import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import metasJson from '../data/metas.json'
import { diasUteisDoMes } from '../lib/dias-uteis'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

/* ─── Filtro por role ────────────────────────────────────────────────────────
   admin/master → acesso total (sem filtro)
   lider        → filtro por equipe (subquery em assessores)
   assessor     → filtro por id_assessor (lookup por email)
   denied       → acesso negado
 ─────────────────────────────────────────────────────────────────────────── */
type FilterResult =
  | { type: 'all' }
  | { type: 'assessor'; id: string }
  | { type: 'equipe'; equipe: string }
  | { type: 'denied' }

async function resolveFilter(
  db: D1Database,
  role: string | undefined,
  email: string | undefined,
  equipe: string | undefined,
  filterType?: string | undefined,
  filterValue?: string | undefined,
): Promise<FilterResult> {
  if (role === 'admin' || role === 'master') {
    // Suporte a filtro de drill-down para admin/master
    if (filterType === 'equipe' && filterValue) return { type: 'equipe', equipe: filterValue }
    if (filterType === 'assessor' && filterValue) return { type: 'assessor', id: filterValue }
    return { type: 'all' }
  }
  if (role === 'lider') {
    if (!equipe) return { type: 'denied' }
    return { type: 'equipe', equipe }
  }
  // assessor (e legacy 'member')
  if (!email) return { type: 'denied' }
  const row = await db
    .prepare('SELECT id_assessor FROM assessores WHERE LOWER(mail_assessor) = LOWER(?)')
    .bind(email)
    .first<{ id_assessor: string }>()
  return row ? { type: 'assessor', id: row.id_assessor } : { type: 'denied' }
}

function buildWhereFilter(f: FilterResult, col = 'id_assessor'): string {
  if (f.type === 'all')      return ''
  if (f.type === 'assessor') return ` WHERE ${col} = '${f.id}'`
  if (f.type === 'equipe')   return ` WHERE ${col} IN (SELECT id_assessor FROM assessores WHERE equipe = '${f.equipe}')`
  return ''
}

function buildAndFilter(f: FilterResult, col = 'id_assessor'): string {
  if (f.type === 'all')      return ''
  if (f.type === 'assessor') return ` AND ${col} = '${f.id}'`
  if (f.type === 'equipe')   return ` AND ${col} IN (SELECT id_assessor FROM assessores WHERE equipe = '${f.equipe}')`
  return ''
}

// Auth: aceita internal secret (Next.js SSR) ou CF Access JWT (browser direto)
app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  if (auth === `Bearer ${secret}`) {
    await next()
    return
  }

  // Fallback: CF Access JWT
  const cfJwt = c.req.header('Cf-Access-Jwt-Assertion')
  if (cfJwt) {
    await next()
    return
  }

  return c.json({ error: 'Unauthorized' }, 401)
})

app.get('/kpis', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const w  = buildWhereFilter(filter)
  const wf = buildAndFilter(filter)

  const [aumRow, clientesRow, capRow, receitaRows] = await Promise.all([
    db
      .prepare(`SELECT SUM(net_em_m) as aum, MAX(data_posicao) as data_ref FROM tb_positivador${w}`)
      .first<{ aum: number; data_ref: string }>(),
    db
      .prepare(`SELECT COUNT(DISTINCT id_cliente) as clientes FROM tb_positivador WHERE status = 'ATIVO'${buildAndFilter(filter)}`)
      .first<{ clientes: number }>(),
    db
      .prepare(`SELECT SUM(captacao) as cap, strftime('%Y-%m', MAX(data)) as mes_ref FROM tb_cap WHERE strftime('%Y-%m', data) = (SELECT strftime('%Y-%m', MAX(data)) FROM tb_cap)${buildAndFilter(filter)}`)
      .first<{ cap: number | null; mes_ref: string | null }>(),
    Promise.all([
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_rv${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_rf${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_coe${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_cambio${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_feefixo${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_seguros${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_consorcio${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_dominion${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_oferta_fundos${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_fundos${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_prev${w}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_precas${w}`).first<{ v: number }>(),
    ]),
  ])

  const receitaTotal = (receitaRows as Array<{ v: number } | null>).reduce((s, r) => s + (r?.v ?? 0), 0)

  const capMesRef = capRow?.mes_ref ?? null
  const mesLabel = capMesRef
    ? new Date(`${capMesRef}-15`).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
        .replace(/^\w/, (c) => c.toUpperCase()).replace(/\.$/, '') + '.'
    : new Date().toLocaleDateString('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' })
        .replace(/^\w/, (c) => c.toUpperCase()).replace(/\.$/, '') + '.'

  return c.json({
    data: {
      aum: {
        value: aumRow?.aum ?? 0,
        dataRef: aumRow?.data_ref ?? null,
      },
      clientesAtivos: {
        value: clientesRow?.clientes ?? 0,
      },
      captacao: {
        value: capRow?.cap ?? 0,
        mesLabel,
      },
      receita: {
        value: receitaTotal,
      },
    },
  })
})

app.get('/historico', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const f = buildAndFilter(filter)

  const [capRows, custRows, roa25Rows, roa26Rows] = await Promise.all([
    db.prepare(`
      SELECT strftime('%m', data) AS mes, strftime('%Y', data) AS ano, SUM(captacao) AS v
      FROM   cap_historica
      WHERE  strftime('%Y', data) IN ('2025','2026')${f}
      GROUP  BY ano, mes ORDER BY ano, mes
    `).all<{ mes: string; ano: string; v: number }>(),
    db.prepare(`
      SELECT strftime('%m', data) AS mes, strftime('%Y', data) AS ano, SUM(total) AS v
      FROM   cust_historica
      WHERE  strftime('%Y', data) IN ('2025','2026')${f}
      GROUP  BY ano, mes ORDER BY ano, mes
    `).all<{ mes: string; ano: string; v: number }>(),
    db.prepare(`
      SELECT CAST(SUBSTR(data, 1, INSTR(data,'/') - 1) AS INTEGER) AS mes,
             SUM(receita)       AS receita,
             SUM(receita) / NULLIF(SUM(media_receita_aum), 0) * 12 AS roa
      FROM   roa_historico WHERE data LIKE '%/2025'${f}
      GROUP  BY mes ORDER BY mes
    `).all<{ mes: number; receita: number; roa: number }>(),
    db.prepare(`
      SELECT CAST(SUBSTR(data, 6, 2) AS INTEGER) AS mes,
             SUM(receita)       AS receita,
             SUM(receita) / NULLIF(SUM(media_receita_aum), 0) * 12 AS roa
      FROM   roa_historico WHERE data LIKE '2026%'${f}
      GROUP  BY mes ORDER BY mes
    `).all<{ mes: number; receita: number; roa: number }>(),
  ])

  // mapas de lookup
  const capMap:  Record<string, number> = {}
  const custMap: Record<string, number> = {}
  for (const r of capRows.results)  capMap[`${r.ano}-${r.mes}`]  = r.v
  for (const r of custRows.results) custMap[`${r.ano}-${r.mes}`] = r.v

  type RoaVal = { receita: number; roa: number }
  const roa25: Record<number, RoaVal> = {}
  const roa26: Record<number, RoaVal> = {}
  for (const r of roa25Rows.results) roa25[r.mes] = { receita: r.receita, roa: r.roa }
  for (const r of roa26Rows.results) roa26[r.mes] = { receita: r.receita, roa: r.roa }

  const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

  const historico = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1
    const m   = String(mes).padStart(2, '0')
    return {
      mes,
      label: MESES[i]!,
      custodia: { v25: custMap[`2025-${m}`] ?? null, v26: custMap[`2026-${m}`] ?? null },
      captacao: { v25: capMap[`2025-${m}`]  ?? null, v26: capMap[`2026-${m}`]  ?? null },
      roa:      { v25: roa25[mes]?.roa      ?? null, v26: roa26[mes]?.roa      ?? null },
      receita:  { v25: roa25[mes]?.receita  ?? null, v26: roa26[mes]?.receita  ?? null },
    }
  })

  const totais = {
    captacao: {
      v25: historico.reduce((s, r) => s + (r.captacao.v25 ?? 0), 0),
      v26: historico.reduce((s, r) => s + (r.captacao.v26 ?? 0), 0),
    },
    receita: {
      v25: historico.reduce((s, r) => s + (r.receita.v25 ?? 0), 0),
      v26: historico.reduce((s, r) => s + (r.receita.v26 ?? 0), 0),
    },
  }

  return c.json({ data: { historico, totais } })
})

app.get('/onepage', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const f = buildAndFilter(filter)

  const [aumRow, clientesRow, capRow, receitaRows, faixasRow] = await Promise.all([
    db
      .prepare(`SELECT SUM(net_em_m) AS aum, MAX(data_posicao) AS data_ref FROM tb_positivador${buildWhereFilter(filter)}`)
      .first<{ aum: number; data_ref: string }>(),
    db
      .prepare(`
        SELECT
          COUNT(DISTINCT CASE WHEN status = 'ATIVO'   THEN id_cliente END) AS ativos,
          COUNT(DISTINCT CASE WHEN status = 'INATIVO' THEN id_cliente END) AS inativos
        FROM tb_positivador${buildWhereFilter(filter)}
      `)
      .first<{ ativos: number; inativos: number }>(),
    db
      .prepare(`
        SELECT
          SUM(CASE WHEN aux = 'C' THEN captacao ELSE 0 END) AS bruta,
          SUM(CASE WHEN aux = 'D' THEN captacao ELSE 0 END) AS resgates,
          SUM(captacao)                                      AS liquida,
          strftime('%Y-%m', MAX(data))                       AS mes_ref
        FROM tb_cap
        WHERE strftime('%Y-%m', data) = (SELECT strftime('%Y-%m', MAX(data)) FROM tb_cap)${f}
      `)
      .first<{ bruta: number; resgates: number; liquida: number }>(),
    Promise.all([
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_rv${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_rf${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_coe${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_cambio${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_feefixo${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_seguros${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_consorcio${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_dominion${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_oferta_fundos${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_fundos${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_prev${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_precas${buildWhereFilter(filter)}`).first<{ v: number }>(),
    ]),
    db.prepare(`
      SELECT
        COUNT(CASE WHEN net_em_m < 300000 THEN 1 END) AS cnt_a,
        COUNT(CASE WHEN net_em_m >= 300000 AND net_em_m < 1000000 THEN 1 END) AS cnt_b,
        COUNT(CASE WHEN net_em_m >= 1000000 AND net_em_m < 10000000 THEN 1 END) AS cnt_c,
        COUNT(CASE WHEN net_em_m >= 10000000 THEN 1 END) AS cnt_d,
        COALESCE(SUM(CASE WHEN net_em_m < 300000 THEN net_em_m END), 0) AS aum_a,
        COALESCE(SUM(CASE WHEN net_em_m >= 300000 AND net_em_m < 1000000 THEN net_em_m END), 0) AS aum_b,
        COALESCE(SUM(CASE WHEN net_em_m >= 1000000 AND net_em_m < 10000000 THEN net_em_m END), 0) AS aum_c,
        COALESCE(SUM(CASE WHEN net_em_m >= 10000000 THEN net_em_m END), 0) AS aum_d
      FROM tb_positivador${buildWhereFilter(filter)}
    `).first<{ cnt_a: number; cnt_b: number; cnt_c: number; cnt_d: number; aum_a: number; aum_b: number; aum_c: number; aum_d: number }>(),
  ])

  const mesLabel = new Date()
    .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' })
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\.$/, '') + '.'

  const LABELS = [
    'Renda Variável', 'Renda Fixa', 'COE', 'Câmbio', 'Fee Fixo',
    'Seguros', 'Consórcio', 'Dominion', 'Oferta de Fundos',
    'Fundos', 'Previdência', 'Precatórios',
  ]
  const porProduto = receitaRows
    .map((r, i) => ({ produto: LABELS[i]!, receita: r?.v ?? 0 }))
    .filter(r => r.receita > 0)
    .sort((a, b) => b.receita - a.receita)

  const receitaTotal = porProduto.reduce((s, r) => s + r.receita, 0)

  return c.json({
    data: {
      dataRef:  aumRow?.data_ref ?? null,
      mesLabel,
      aum:      aumRow?.aum ?? 0,
      clientes: {
        ativos:   clientesRow?.ativos   ?? 0,
        inativos: clientesRow?.inativos ?? 0,
      },
      captacao: {
        bruta:    capRow?.bruta    ?? 0,
        resgates: capRow?.resgates ?? 0,
        liquida:  capRow?.liquida  ?? 0,
      },
      receita: {
        total:      receitaTotal,
        porProduto,
      },
      faixasNet: [
        { label: '0 – 300K',   clientes: faixasRow?.cnt_a ?? 0, aum: faixasRow?.aum_a ?? 0 },
        { label: '300K – 1MM', clientes: faixasRow?.cnt_b ?? 0, aum: faixasRow?.aum_b ?? 0 },
        { label: '1MM – 10MM', clientes: faixasRow?.cnt_c ?? 0, aum: faixasRow?.aum_c ?? 0 },
        { label: '> 10MM',     clientes: faixasRow?.cnt_d ?? 0, aum: faixasRow?.aum_d ?? 0 },
      ],
    },
  })
})

const PRODUTOS_METAS = [
  { slug: 'rv',            tabela: 'receita_rv',            label: 'Renda Variável'   },
  { slug: 'rf',            tabela: 'receita_rf',            label: 'Renda Fixa'       },
  { slug: 'coe',           tabela: 'receita_coe',           label: 'COE'              },
  { slug: 'cambio',        tabela: 'receita_cambio',        label: 'Câmbio'           },
  { slug: 'feefixo',       tabela: 'receita_feefixo',       label: 'Fee Fixo'         },
  { slug: 'seguros',       tabela: 'receita_seguros',       label: 'Seguros'          },
  { slug: 'consorcio',     tabela: 'receita_consorcio',     label: 'Consórcio'        },
  { slug: 'dominion',      tabela: 'receita_dominion',      label: 'Dominion'         },
  { slug: 'oferta_fundos', tabela: 'receita_oferta_fundos', label: 'Oferta de Fundos' },
  { slug: 'fundos',        tabela: 'receita_fundos',        label: 'Fundos'           },
  { slug: 'previdencia',   tabela: 'receita_prev',          label: 'Previdência'      },
  { slug: 'precas',        tabela: 'receita_precas',        label: 'Precatórios'      },
] as const

app.get('/metas', async (c) => {
  const db    = c.env.PERF_DB
  const agora = new Date()

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  // Mês corrente em BRT (UTC-3)
  const brt    = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const mesISO = `${brt.getUTCFullYear()}-${String(brt.getUTCMonth() + 1).padStart(2, '0')}`

  const metasData = metasJson as Record<string, Record<string, number>>
  let metasMes = metasData[mesISO]
  let mesUsado = mesISO

  if (!metasMes) {
    // Fallback: usa o mês mais recente com meta definida
    const ultimoMes = Object.keys(metasData).sort().at(-1)
    if (ultimoMes) { metasMes = metasData[ultimoMes]; mesUsado = ultimoMes }
  }

  if (!metasMes) return c.json({ data: { semMeta: true, mesISO } })

  const dias = diasUteisDoMes(agora)

  const receitaRows = await Promise.all(
    PRODUTOS_METAS.map(p =>
      db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM ${p.tabela}${buildWhereFilter(filter)}`)
        .first<{ v: number }>()
    )
  )

  const produtos = PRODUTOS_METAS.map((p, i) => {
    const realizado      = receitaRows[i]?.v ?? 0
    const meta           = metasMes[p.slug] ?? 0
    const paceRealizado  = dias.passados > 0 ? realizado / dias.passados : 0
    const paceNecessario = dias.restantes > 0 ? Math.max(0, meta - realizado) / dias.restantes : 0
    const projecao       = realizado + paceRealizado * dias.restantes
    const pctMeta        = meta > 0 ? projecao / meta : null
    return {
      slug: p.slug, label: p.label,
      meta, realizado,
      gap:         meta - realizado,
      pctAtingido: meta > 0 ? realizado / meta : null,
      paceRealizado, paceNecessario, projecao, pctMeta,
    }
  })

  const totalMeta      = produtos.reduce((s, p) => s + p.meta, 0)
  const totalRealizado = produtos.reduce((s, p) => s + p.realizado, 0)
  const totalProjecao  = produtos.reduce((s, p) => s + p.projecao, 0)

  return c.json({
    data: {
      semMeta: false as const,
      mesISO: mesUsado,
      dias,
      produtos,
      total: {
        meta:        totalMeta,
        realizado:   totalRealizado,
        projecao:    totalProjecao,
        gap:         totalMeta - totalRealizado,
        pctAtingido: totalMeta > 0 ? totalRealizado / totalMeta : null,
        pctMeta:     totalMeta > 0 ? totalProjecao  / totalMeta : null,
      },
    },
  })
})

app.get('/deepdive/captacao', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const f = buildAndFilter(filter, 'c.id_assessor')

  const [aportesRows, resgatesRows] = await Promise.all([
    db.prepare(`
      SELECT c.id_cliente,
             bc.nome_cliente,
             SUM(c.captacao) AS valor
      FROM   tb_cap c
      LEFT JOIN base_clientes bc ON CAST(c.id_cliente AS INTEGER) = bc.id_cliente
      WHERE  c.aux = 'C'
        AND  strftime('%Y-%m', c.data) = (SELECT strftime('%Y-%m', MAX(data)) FROM tb_cap)${f}
      GROUP  BY c.id_cliente
      ORDER  BY valor DESC
      LIMIT  20
    `).all<{ id_cliente: string; nome_cliente: string | null; valor: number }>(),

    db.prepare(`
      SELECT c.id_cliente,
             bc.nome_cliente,
             SUM(c.captacao) AS valor
      FROM   tb_cap c
      LEFT JOIN base_clientes bc ON CAST(c.id_cliente AS INTEGER) = bc.id_cliente
      WHERE  c.aux = 'D'
        AND  strftime('%Y-%m', c.data) = (SELECT strftime('%Y-%m', MAX(data)) FROM tb_cap)${f}
      GROUP  BY c.id_cliente
      ORDER  BY valor ASC
      LIMIT  20
    `).all<{ id_cliente: string; nome_cliente: string | null; valor: number }>(),
  ])

  const mesLabel = new Date().toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  })

  return c.json({
    data: {
      mesLabel,
      aportes:  aportesRows.results,
      resgates: resgatesRows.results.map(r => ({ ...r, valor: Math.abs(r.valor) })),
    },
  })
})

app.get('/deepdive/receita/:produto', async (c) => {
  const db      = c.env.PERF_DB
  const produto = c.req.param('produto')

  const PRODUTO_MAP: Record<string, { tabela: string; label: string }> = {
    rv:            { tabela: 'receita_rv',            label: 'Renda Variável'   },
    rf:            { tabela: 'receita_rf',            label: 'Renda Fixa'       },
    coe:           { tabela: 'receita_coe',           label: 'COE'              },
    cambio:        { tabela: 'receita_cambio',        label: 'Câmbio'           },
    feefixo:       { tabela: 'receita_feefixo',       label: 'Fee Fixo'         },
    seguros:       { tabela: 'receita_seguros',       label: 'Seguros'          },
    consorcio:     { tabela: 'receita_consorcio',     label: 'Consórcio'        },
    dominion:      { tabela: 'receita_dominion',      label: 'Dominion'         },
    oferta_fundos: { tabela: 'receita_oferta_fundos', label: 'Oferta de Fundos' },
    fundos:        { tabela: 'receita_fundos',        label: 'Fundos'           },
    previdencia:   { tabela: 'receita_prev',          label: 'Previdência'      },
    precas:        { tabela: 'receita_precas',        label: 'Precatórios'      },
  }

  const info = PRODUTO_MAP[produto]
  if (!info) return c.json({ error: 'produto inválido' }, 400)

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  type ClienteRow = { id_cliente: string | number; nome_cliente: string | null; valor: number }

  let clientes: ClienteRow[]

  if (produto === 'dominion') {
    const r = await db.prepare(`
      SELECT r.conta        AS id_cliente,
             r.consultor    AS nome_cliente,
             SUM(r.receita) AS valor
      FROM   receita_dominion r
      ${buildWhereFilter(filter, 'r.id_assessor')}
      GROUP  BY r.conta
      ORDER  BY valor DESC
      LIMIT  20
    `).all<ClienteRow>()
    clientes = r.results
  } else {
    const r = await db.prepare(`
      SELECT r.id_cliente,
             bc.nome_cliente,
             SUM(r.receita) AS valor
      FROM   ${info.tabela} r
      LEFT JOIN base_clientes bc ON r.id_cliente = bc.id_cliente
      ${buildWhereFilter(filter, 'r.id_assessor')}
      GROUP  BY r.id_cliente
      ORDER  BY valor DESC
      LIMIT  20
    `).all<ClienteRow>()
    clientes = r.results
  }

  return c.json({
    data: {
      produto,
      label:    info.label,
      clientes,
    },
  })
})

app.get('/assessores', async (c) => {
  const role = c.req.header('X-User-Role')
  if (role !== 'admin' && role !== 'master') return c.json({ error: 'Forbidden' }, 403)

  const db = c.env.PERF_DB
  const rows = await db
    .prepare(`
      SELECT id_assessor, nome_assessor, equipe
      FROM   assessores
      WHERE  equipe IS NOT NULL
      ORDER  BY equipe, nome_assessor
    `)
    .all<{ id_assessor: string; nome_assessor: string | null; equipe: string }>()

  const assessores = rows.results
  const equipes = [...new Set(assessores.map(a => a.equipe))].sort()

  return c.json({ data: { equipes, assessores } })
})

app.get('/carteiras/cliente', async (c) => {
  const id = c.req.query('id')
  if (!id) return c.json({ error: 'id obrigatório' }, 400)

  const db = c.env.PERF_DB

  const [posicoesRows, breakdownRows] = await Promise.all([
    db
      .prepare(`
        SELECT produto, sub_produto, ativo, emissor, data_vencimento, quantidade, net
        FROM   tb_diversificador
        WHERE  id_cliente = ?
        ORDER  BY net DESC
      `)
      .bind(id)
      .all<{ produto: string; sub_produto: string; ativo: string; emissor: string | null; data_vencimento: string | null; quantidade: number; net: number }>(),
    db
      .prepare(`
        SELECT produto, SUM(net) AS total
        FROM   tb_diversificador
        WHERE  id_cliente = ?
        GROUP  BY produto
        ORDER  BY total DESC
      `)
      .bind(id)
      .all<{ produto: string; total: number }>(),
  ])

  return c.json({
    data: {
      id_cliente: id,
      aum: posicoesRows.results.reduce((s, r) => s + r.net, 0),
      posicoes: posicoesRows.results,
      breakdown: breakdownRows.results,
    },
  })
})

app.get('/carteiras', async (c) => {
  const db = c.env.PERF_DB

  const [alocacaoRows, totalRow] = await Promise.all([
    db
      .prepare(`
        SELECT produto,
               SUM(net)              AS total,
               COUNT(DISTINCT id_cliente) AS clientes
        FROM   tb_diversificador
        GROUP  BY produto
        ORDER  BY total DESC
      `)
      .all<{ produto: string; total: number; clientes: number }>(),
    db
      .prepare('SELECT SUM(net) AS aum, MAX(data_posicao) AS data_ref FROM tb_diversificador')
      .first<{ aum: number; data_ref: string }>(),
  ])

  return c.json({
    data: {
      aum: totalRow?.aum ?? 0,
      dataRef: totalRow?.data_ref ?? null,
      alocacao: alocacaoRows.results,
    },
  })
})

/* ─── /carteiras/ativos/busca ────────────────────────────────────────────── */

app.get('/carteiras/ativos/busca', async (c) => {
  const q = (c.req.query('q') ?? '').trim()
  if (q.length < 2) return c.json({ data: { resultados: [] } })

  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const waRV  = buildAndFilter(filter)                   // analitico_rv tem id_assessor direto
  const waRFJ = buildAndFilter(filter, 'p.id_assessor')  // tb_diversificador via JOIN positivador

  const like = `%${q}%`

  const [rvRows, rfRows] = await Promise.all([
    db
      .prepare(`
        SELECT 'rv' AS classe, ativo, setor AS categoria,
               SUM(auc) AS total, COUNT(DISTINCT id_cliente) AS clientes
        FROM   analitico_rv
        WHERE  ativo LIKE ?
          AND  ativo IS NOT NULL
          ${waRV}
        GROUP  BY ativo, setor
        ORDER  BY total DESC
        LIMIT  8
      `)
      .bind(like)
      .all<{ classe: 'rv'; ativo: string; categoria: string | null; total: number; clientes: number }>(),

    db
      .prepare(`
        SELECT 'rf' AS classe, d.ativo, d.sub_produto AS categoria,
               SUM(d.net) AS total, COUNT(DISTINCT d.id_cliente) AS clientes
        FROM   tb_diversificador d
        INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
        WHERE  d.ativo LIKE ?
          AND  d.ativo IS NOT NULL
          AND  d.produto = 'Renda Fixa'
          ${waRFJ}
        GROUP  BY d.ativo, d.sub_produto
        ORDER  BY total DESC
        LIMIT  8
      `)
      .bind(like)
      .all<{ classe: 'rf'; ativo: string; categoria: string | null; total: number; clientes: number }>(),
  ])

  const resultados = [...rvRows.results, ...rfRows.results]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return c.json({ data: { resultados } })
})

/* ─── /carteiras/drill/rv ────────────────────────────────────────────────── */

app.get('/carteiras/drill/rv', async (c) => {
  const ativo = c.req.query('ativo')
  if (!ativo) return c.json({ error: 'ativo obrigatório' }, 400)

  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter)

  const [clientesRows, summaryRow] = await Promise.all([
    db
      .prepare(`
        SELECT rv.id_cliente, bc.nome_cliente,
               SUM(rv.auc) AS total,
               rv.setor, rv.produto,
               AVG(rv.variacao) AS variacao
        FROM   analitico_rv rv
        LEFT   JOIN base_clientes bc ON rv.id_cliente = bc.id_cliente
        WHERE  rv.ativo = ?
          ${wa}
        GROUP  BY rv.id_cliente, bc.nome_cliente, rv.setor, rv.produto
        ORDER  BY total DESC
        LIMIT  20
      `)
      .bind(ativo)
      .all<{ id_cliente: number; nome_cliente: string | null; total: number; setor: string | null; produto: string | null; variacao: number | null }>(),

    db
      .prepare(`
        SELECT SUM(auc) AS total, COUNT(*) AS posicoes, COUNT(DISTINCT id_cliente) AS clientes
        FROM   analitico_rv
        WHERE  ativo = ?
          ${wa}
      `)
      .bind(ativo)
      .first<{ total: number; posicoes: number; clientes: number }>(),
  ])

  return c.json({
    data: {
      ativo,
      total: summaryRow?.total ?? 0,
      posicoes: summaryRow?.posicoes ?? 0,
      clientes_count: summaryRow?.clientes ?? 0,
      clientes: clientesRows.results,
    },
  })
})

/* ─── /carteiras/rf/ativos ───────────────────────────────────────────────── */

app.get('/carteiras/rf/ativos', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'p.id_assessor')

  const rows = await db
    .prepare(`
      SELECT d.ativo, d.sub_produto, d.emissor,
             SUM(d.net)              AS total,
             COUNT(DISTINCT d.id_cliente) AS clientes,
             COUNT(*)                AS posicoes
      FROM   tb_diversificador d
      INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
      WHERE  d.produto = 'Renda Fixa'
        AND  d.ativo IS NOT NULL
        ${wa}
      GROUP  BY d.ativo, d.sub_produto, d.emissor
      ORDER  BY total DESC
      LIMIT  40
    `)
    .all<{ ativo: string; sub_produto: string; emissor: string | null; total: number; clientes: number; posicoes: number }>()

  return c.json({ data: { ativos: rows.results } })
})

/* ─── /carteiras/drill ───────────────────────────────────────────────────── */

app.get('/carteiras/drill', async (c) => {
  const ativo = c.req.query('ativo')
  if (!ativo) return c.json({ error: 'ativo obrigatório' }, 400)

  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'p.id_assessor')

  const [clientesRows, summaryRow] = await Promise.all([
    db
      .prepare(`
        SELECT d.id_cliente, bc.nome_cliente,
               SUM(d.net)       AS total,
               d.data_vencimento,
               d.sub_produto
        FROM   tb_diversificador d
        INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
        LEFT   JOIN base_clientes bc ON d.id_cliente = bc.id_cliente
        WHERE  d.ativo = ?
          AND  d.produto = 'Renda Fixa'
          ${wa}
        GROUP  BY d.id_cliente, bc.nome_cliente, d.data_vencimento, d.sub_produto
        ORDER  BY total DESC
        LIMIT  20
      `)
      .bind(ativo)
      .all<{ id_cliente: number; nome_cliente: string | null; total: number; data_vencimento: string | null; sub_produto: string }>(),

    db
      .prepare(`
        SELECT SUM(d.net) AS total, COUNT(*) AS posicoes,
               COUNT(DISTINCT d.id_cliente) AS clientes,
               MAX(d.emissor) AS emissor
        FROM   tb_diversificador d
        INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
        WHERE  d.ativo = ?
          AND  d.produto = 'Renda Fixa'
          ${wa}
      `)
      .bind(ativo)
      .first<{ total: number; posicoes: number; clientes: number; emissor: string | null }>(),
  ])

  return c.json({
    data: {
      ativo,
      emissor: summaryRow?.emissor ?? null,
      total: summaryRow?.total ?? 0,
      posicoes: summaryRow?.posicoes ?? 0,
      clientes_count: summaryRow?.clientes ?? 0,
      clientes: clientesRows.results,
    },
  })
})

/* ─── /clientes ──────────────────────────────────────────────────────────── */

app.get('/clientes', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const where = filter.type === 'all'
    ? ``
    : filter.type === 'assessor'
    ? `WHERE p.id_assessor = '${filter.id}'`
    : `WHERE p.id_assessor IN (SELECT id_assessor FROM assessores WHERE equipe = '${filter.equipe}')`

  const [clientesRows, statsRow] = await Promise.all([
    db.prepare(`
      SELECT
        p.id_cliente,
        p.status,
        p.tipo_pessoa,
        p.net_em_m,
        p.afd_ajustada,
        p.nome_assessor,
        p.equipe,
        b.nome_cliente,
        b.suitability,
        b.email_cliente,
        b.telefone
      FROM tb_positivador p
      INNER JOIN base_clientes b ON p.id_cliente = b.id_cliente
      ${where}
      ORDER BY p.net_em_m DESC
      LIMIT 500
    `).all<{
      id_cliente: number
      status: string
      tipo_pessoa: string
      net_em_m: number
      afd_ajustada: number
      nome_assessor: string | null
      equipe: string | null
      nome_cliente: string | null
      suitability: string | null
      email_cliente: string | null
      telefone: string | null
    }>(),
    db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN p.status = 'ATIVO' THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN p.status = 'INATIVO' THEN 1 ELSE 0 END) as inativos,
        SUM(p.net_em_m) as aum_total
      FROM tb_positivador p
      INNER JOIN base_clientes b ON p.id_cliente = b.id_cliente
      ${where}
    `).first<{ total: number; ativos: number; inativos: number; aum_total: number }>(),
  ])

  return c.json({
    data: {
      clientes: clientesRows.results,
      stats: {
        total:     statsRow?.total     ?? 0,
        ativos:    statsRow?.ativos    ?? 0,
        inativos:  statsRow?.inativos  ?? 0,
        aum_total: statsRow?.aum_total ?? 0,
      },
    },
  })
})

/* ─── /carteiras/visao ────────────────────────────────────────────────────── */

app.get('/carteiras/visao', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter)

  const JANELAS = ['0-6m', '6-12m', '1-2a', '2-5a', '5+a'] as const
  const janelaExpr = `CASE
    WHEN vencimento < date('now', '+6 months')  THEN '0-6m'
    WHEN vencimento < date('now', '+12 months') THEN '6-12m'
    WHEN vencimento < date('now', '+24 months') THEN '1-2a'
    WHEN vencimento < date('now', '+60 months') THEN '2-5a'
    ELSE '5+a'
  END`

  const [
    rfTotalRow, rvTotalRow, coeTotalRow, ldTotalRow,
    rfIdxRows, rfMatRows, rfMarcRows,
    rvSetRows, rvTopRows,
    coeRows, ldRows,
  ] = await Promise.all([
    db.prepare(`SELECT SUM(posicao_atual) as total FROM analitico_rf WHERE tipo_ativo IS NOT NULL AND posicao_atual IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(auc) as total FROM analitico_rv WHERE setor IS NOT NULL AND auc IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(posicao_atual) as total FROM posicao_coe WHERE tipo IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(custodia) as total FROM custodia_ld WHERE indexador IS NOT NULL${wa}`).first<{ total: number }>(),

    db.prepare(`
      SELECT indexador, SUM(posicao_atual) as total, COUNT(*) as posicoes, COUNT(DISTINCT id_cliente) as clientes
      FROM analitico_rf WHERE indexador IS NOT NULL${wa}
      GROUP BY indexador ORDER BY total DESC
    `).all<{ indexador: string; total: number; posicoes: number; clientes: number }>(),

    db.prepare(`
      SELECT ${janelaExpr} as janela, tipo_ativo, SUM(posicao_atual) as total
      FROM analitico_rf WHERE vencimento IS NOT NULL AND tipo_ativo IS NOT NULL${wa}
      GROUP BY janela, tipo_ativo
    `).all<{ janela: string; tipo_ativo: string; total: number }>(),

    db.prepare(`
      SELECT flag_marcacao, SUM(posicao_atual) as total, COUNT(*) as posicoes
      FROM analitico_rf WHERE flag_marcacao IS NOT NULL${wa}
      GROUP BY flag_marcacao
    `).all<{ flag_marcacao: string; total: number; posicoes: number }>(),

    db.prepare(`
      SELECT setor, produto, SUM(auc) as total, COUNT(DISTINCT id_cliente) as clientes
      FROM analitico_rv WHERE setor IS NOT NULL AND auc IS NOT NULL${wa}
      GROUP BY setor, produto ORDER BY total DESC LIMIT 20
    `).all<{ setor: string; produto: string; total: number; clientes: number }>(),

    db.prepare(`
      SELECT ativo, setor, produto, SUM(auc) as total,
             COUNT(DISTINCT id_cliente) as clientes, AVG(variacao) as variacao
      FROM analitico_rv WHERE ativo IS NOT NULL AND auc IS NOT NULL${wa}
      GROUP BY ativo, setor, produto ORDER BY total DESC LIMIT 12
    `).all<{ ativo: string; setor: string; produto: string; total: number; clientes: number; variacao: number }>(),

    db.prepare(`
      SELECT tipo, COUNT(*) as posicoes, SUM(posicao_atual) as total_atual,
             SUM(valor_compra) as total_compra, SUM(cupom_recebido) as total_cupom,
             COUNT(DISTINCT id_cliente) as clientes
      FROM posicao_coe WHERE tipo IS NOT NULL${wa}
      GROUP BY tipo ORDER BY total_atual DESC
    `).all<{ tipo: string; posicoes: number; total_atual: number; total_compra: number; total_cupom: number; clientes: number }>(),

    db.prepare(`
      SELECT indexador, SUM(custodia) as total, COUNT(*) as posicoes, COUNT(DISTINCT id_cliente) as clientes
      FROM custodia_ld WHERE indexador IS NOT NULL${wa}
      GROUP BY indexador ORDER BY total DESC
    `).all<{ indexador: string; total: number; posicoes: number; clientes: number }>(),
  ])

  const rfTotal  = rfTotalRow?.total  ?? 0
  const rvTotal  = rvTotalRow?.total  ?? 0
  const coeTotal = coeTotalRow?.total ?? 0
  const ldTotal  = ldTotalRow?.total  ?? 0

  // Build wall-of-maturities
  const matMap: Record<string, Record<string, number>> = {}
  for (const r of rfMatRows.results) {
    if (!matMap[r.janela]) matMap[r.janela] = {}
    matMap[r.janela][r.tipo_ativo] = (matMap[r.janela][r.tipo_ativo] ?? 0) + r.total
  }
  const maturities = JANELAS.map((j) => ({
    janela: j,
    total: Object.values(matMap[j] ?? {}).reduce((s, v) => s + v, 0),
    itens: Object.entries(matMap[j] ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, total]) => ({ tipo, total })),
  }))

  return c.json({
    data: {
      totais: { rf: rfTotal, rv: rvTotal, coe: coeTotal, liquidez: ldTotal, total: rfTotal + rvTotal + coeTotal + ldTotal },
      rf: {
        porIndexador: rfIdxRows.results,
        maturities,
        marcacao: rfMarcRows.results,
      },
      rv: {
        setorial: rvSetRows.results,
        topAtivos: rvTopRows.results,
      },
      coe: {
        porTipo: coeRows.results.map((r) => ({
          ...r,
          pl: r.total_atual + r.total_cupom - r.total_compra,
        })),
      },
      liquidez: { porIndexador: ldRows.results },
    },
  })
})

export default app
