import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { diasUteisDoMes } from '../lib/dias-uteis'
import {
  resolveFilterFromCtx,
  buildAndFilter,
  buildWhereFilter,
  buildDivFilter,
} from '../lib/role-filter'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

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

  const filter = await resolveFilterFromCtx(c)
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

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const f = buildAndFilter(filter)

  const [capRows, custRows, roa25Rows, roa26Rows] = await Promise.all([
    db.prepare(`
      SELECT strftime('%m', data) AS mes, strftime('%Y', data) AS ano, SUM(captacao) AS v
      FROM   cap_historica
      WHERE  data >= '2025-01-01' AND data < '2027-01-01'${f}
      GROUP  BY ano, mes ORDER BY ano, mes
    `).all<{ mes: string; ano: string; v: number }>(),
    db.prepare(`
      SELECT strftime('%m', data) AS mes, strftime('%Y', data) AS ano, SUM(total) AS v
      FROM   cust_historica
      WHERE  data >= '2025-01-01' AND data < '2027-01-01'${f}
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

  const filter = await resolveFilterFromCtx(c)
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
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_financiamento${buildWhereFilter(filter)}`).first<{ v: number }>(),
      db.prepare(`SELECT COALESCE(SUM(receita),0) AS v FROM receita_planejamento${buildWhereFilter(filter)}`).first<{ v: number }>(),
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
    'Seguros', 'Consórcio', 'Internacional', 'Oferta de Fundos',
    'Fundos', 'Previdência', 'Precatórios', 'Financiamento',
    'Planejamento Financeiro',
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

type Pj = 'PJ1' | 'PJ2'
type ProdutoMeta = {
  slug: string
  label: string
  pj: Pj
  tabela?: string       // sem tabela → realizado 0 (produto novo que ainda não tem receita rastreada)
  tabelaExtra?: string
  semProjecao?: boolean // receita lumpy: extrapolação linear engana → não projeta pra frente
}

// PJ1 = assessoria de investimentos; PJ2 = seguros/consórcio/saúde (empresas separadas).
// Ordem aqui é a ordem de exibição no BlocoMetas.
const PRODUTOS_METAS: ProdutoMeta[] = [
  { slug: 'rv',            pj: 'PJ1', tabela: 'receita_rv',            label: 'Renda Variável'          },
  { slug: 'rf',            pj: 'PJ1', tabela: 'receita_rf',            label: 'Renda Fixa'              },
  { slug: 'coe',           pj: 'PJ1', tabela: 'receita_coe',           label: 'COE'                     },
  { slug: 'cambio',        pj: 'PJ1', tabela: 'receita_cambio',        label: 'Câmbio'                  },
  { slug: 'feefixo',       pj: 'PJ1', tabela: 'receita_feefixo',       label: 'Fee Fixo'                },
  { slug: 'internacional', pj: 'PJ1', tabela: 'receita_parceiros',     label: 'Internacional'           },
  { slug: 'off_shore',     pj: 'PJ1', tabela: 'receita_dominion',      label: 'Off-shore'               },
  { slug: 'oferta_fundos', pj: 'PJ1', tabela: 'receita_oferta_fundos', label: 'Oferta de Fundos'        },
  { slug: 'fundos',        pj: 'PJ1', tabela: 'receita_fundos',        label: 'Fundos',                 semProjecao: true },
  { slug: 'previdencia',   pj: 'PJ1', tabela: 'receita_prev',          label: 'Previdência',            semProjecao: true },
  { slug: 'precas',        pj: 'PJ1', tabela: 'receita_precas',        label: 'Precatórios'             },
  { slug: 'planejamento',  pj: 'PJ1', tabela: 'receita_planejamento',  label: 'Planejamento Financeiro' },
  { slug: 'seguros',       pj: 'PJ2', tabela: 'receita_seguros',       label: 'Seguros'                 },
  { slug: 'consorcio',     pj: 'PJ2', tabela: 'receita_consorcio',     label: 'Consórcio'               },
  { slug: 'plano_saude',   pj: 'PJ2', tabela: 'receita_seg_saude',     label: 'Plano de Saúde'          },
]

app.get('/metas', async (c) => {
  const db    = c.env.PERF_DB
  const role  = c.req.header('X-User-Role')

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const agora = new Date()

  // Mês de referência em BRT (UTC-3): primeiros 2 dias úteis → mês anterior (ainda fechando)
  const brt   = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const year  = brt.getUTCFullYear()
  const month = brt.getUTCMonth()
  const day   = brt.getUTCDate()

  let bizDaysInMonth = 0
  for (let d = 1; d <= day; d++) {
    const dow = new Date(Date.UTC(year, month, d)).getUTCDay()
    if (dow !== 0 && dow !== 6) bizDaysInMonth++
  }

  const usesPrevMonth = bizDaysInMonth <= 2
  const effMonth = usesPrevMonth ? (month === 0 ? 11 : month - 1) : month
  const effYear  = usesPrevMonth && month === 0 ? year - 1 : year
  const mesISO   = `${effYear}-${String(effMonth + 1).padStart(2, '0')}`

  // Metas vêm de PERF_DB.metas_produto (uma linha por mes_iso × produto_slug).
  // Fallback: se o mês corrente não tem metas cadastradas, usa o mais recente.
  const metasRows = await db
    .prepare('SELECT produto_slug, valor FROM metas_produto WHERE mes_iso = ?')
    .bind(mesISO)
    .all<{ produto_slug: string; valor: number }>()

  let metasMes: Record<string, number> | null =
    metasRows.results.length > 0
      ? Object.fromEntries(metasRows.results.map(r => [r.produto_slug, r.valor]))
      : null
  let mesUsado = mesISO

  if (!metasMes) {
    const ultimoMesRow = await db
      .prepare('SELECT mes_iso FROM metas_produto ORDER BY mes_iso DESC LIMIT 1')
      .first<{ mes_iso: string }>()
    if (ultimoMesRow?.mes_iso) {
      const rows = await db
        .prepare('SELECT produto_slug, valor FROM metas_produto WHERE mes_iso = ?')
        .bind(ultimoMesRow.mes_iso)
        .all<{ produto_slug: string; valor: number }>()
      metasMes = Object.fromEntries(rows.results.map(r => [r.produto_slug, r.valor]))
      mesUsado = ultimoMesRow.mes_iso
    }
  }

  if (!metasMes) return c.json({ data: { semMeta: true, mesISO } })

  // Mês anterior já encerrado → passa último dia dele para dias úteis (restantes = 0)
  const dataParaDias = usesPrevMonth ? new Date(Date.UTC(effYear, effMonth + 1, 0)) : agora
  const dias = diasUteisDoMes(dataParaDias)

  // Alguns produtos (ex: plano_saude) ainda não têm tabela de receita criada.
  // Nesses casos e em qualquer falha de query, realizado = 0.
  const receitaRows = await Promise.allSettled(
    PRODUTOS_METAS.map(p => {
      if (!p.tabela) return Promise.resolve({ v: 0 } as { v: number })
      const sql = p.tabelaExtra
        ? `SELECT COALESCE(SUM(v),0) AS v FROM (SELECT receita AS v FROM ${p.tabela}${buildWhereFilter(filter)} UNION ALL SELECT receita AS v FROM ${p.tabelaExtra}${buildWhereFilter(filter)})`
        : `SELECT COALESCE(SUM(receita), 0) AS v FROM ${p.tabela}${buildWhereFilter(filter)}`
      return db.prepare(sql).first<{ v: number }>()
    })
  )

  const produtos = PRODUTOS_METAS.map((p, i) => {
    const row = receitaRows[i]
    const realizado      = row?.status === 'fulfilled' ? (row.value?.v ?? 0) : 0
    const meta           = metasMes[p.slug] ?? 0
    const paceRealizado  = dias.passados > 0 ? realizado / dias.passados : 0
    const paceNecessario = dias.restantes > 0 ? Math.max(0, meta - realizado) / dias.restantes : 0
    // Produtos lumpy (fundos, previdência) não extrapolam: projecao = realizado.
    // Isso garante que total.projecao bata com o que a UI mostra por linha.
    const projecao       = p.semProjecao ? realizado : realizado + paceRealizado * dias.restantes
    const pctMeta        = meta > 0 ? projecao / meta : null
    return {
      slug: p.slug, label: p.label, pj: p.pj,
      semProjecao: p.semProjecao ?? false,
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

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const f = buildAndFilter(filter, 'c.id_assessor')

  const [aportesRows, resgatesRows] = await Promise.all([
    db.prepare(`
      SELECT c.id_cliente,
             bc.nome_cliente,
             a.nome_assessor,
             SUM(c.captacao) AS valor
      FROM   tb_cap c
      LEFT JOIN base_clientes bc ON CAST(c.id_cliente AS INTEGER) = bc.id_cliente
      LEFT JOIN assessores a ON c.id_assessor = a.id_assessor
      WHERE  strftime('%Y-%m', c.data) = (SELECT strftime('%Y-%m', MAX(data)) FROM tb_cap)${f}
      GROUP  BY c.id_cliente
      HAVING SUM(c.captacao) > 0
      ORDER  BY valor DESC
      LIMIT  10
    `).all<{ id_cliente: string; nome_cliente: string | null; nome_assessor: string | null; valor: number }>(),

    db.prepare(`
      SELECT c.id_cliente,
             bc.nome_cliente,
             a.nome_assessor,
             SUM(c.captacao) AS valor
      FROM   tb_cap c
      LEFT JOIN base_clientes bc ON CAST(c.id_cliente AS INTEGER) = bc.id_cliente
      LEFT JOIN assessores a ON c.id_assessor = a.id_assessor
      WHERE  strftime('%Y-%m', c.data) = (SELECT strftime('%Y-%m', MAX(data)) FROM tb_cap)${f}
      GROUP  BY c.id_cliente
      HAVING SUM(c.captacao) < 0
      ORDER  BY valor ASC
      LIMIT  10
    `).all<{ id_cliente: string; nome_cliente: string | null; nome_assessor: string | null; valor: number }>(),
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
    dominion:      { tabela: 'receita_dominion',      label: 'Internacional'    },
    oferta_fundos: { tabela: 'receita_oferta_fundos', label: 'Oferta de Fundos' },
    fundos:        { tabela: 'receita_fundos',        label: 'Fundos'           },
    previdencia:   { tabela: 'receita_prev',          label: 'Previdência'      },
    precas:        { tabela: 'receita_precas',        label: 'Precatórios'      },
    financiamento: { tabela: 'receita_financiamento', label: 'Financiamento'    },
    planejamento:  { tabela: 'receita_planejamento',  label: 'Planejamento Financeiro' },
  }

  const info = PRODUTO_MAP[produto]
  if (!info) return c.json({ error: 'produto inválido' }, 400)

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  type ClienteRow = { id_cliente: string | number; nome_cliente: string | null; nome_assessor: string | null; valor: number }

  let clientes: ClienteRow[]

  if (produto === 'financiamento') {
    const r = await db.prepare(`
      SELECT r.nome_cliente AS id_cliente,
             r.nome_cliente,
             r.nome_assessor,
             SUM(r.receita) AS valor
      FROM   receita_financiamento r
      ${buildWhereFilter(filter, 'r.id_assessor')}
      GROUP  BY r.nome_cliente
      ORDER  BY valor DESC
      LIMIT  20
    `).all<ClienteRow>()
    clientes = r.results
  } else if (produto === 'planejamento') {
    const r = await db.prepare(`
      SELECT r.nome_cliente AS id_cliente,
             r.nome_cliente,
             r.nome_assessor,
             SUM(r.receita) AS valor
      FROM   receita_planejamento r
      ${buildWhereFilter(filter, 'r.id_assessor')}
      GROUP  BY r.nome_cliente
      ORDER  BY valor DESC
      LIMIT  20
    `).all<ClienteRow>()
    clientes = r.results
  } else if (produto === 'dominion') {
    const r = await db.prepare(`
      SELECT r.conta        AS id_cliente,
             r.consultor    AS nome_cliente,
             NULL           AS nome_assessor,
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
             a.nome_assessor,
             SUM(r.receita) AS valor
      FROM   ${info.tabela} r
      LEFT JOIN base_clientes bc ON r.id_cliente = bc.id_cliente
      LEFT JOIN assessores a ON r.id_assessor = a.id_assessor
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
  const equipeHeader = c.req.header('X-User-Equipe')
  if (role !== 'admin' && role !== 'master' && role !== 'lider' && role !== 'lider_pj') return c.json({ error: 'Forbidden' }, 403)

  const db = c.env.PERF_DB
  const rows = role === 'lider' && equipeHeader
    ? await db
        .prepare(`SELECT id_assessor, nome_assessor, equipe FROM assessores WHERE equipe = ? AND equipe IS NOT NULL ORDER BY nome_assessor`)
        .bind(equipeHeader)
        .all<{ id_assessor: string; nome_assessor: string | null; equipe: string }>()
    : await db
        .prepare(`SELECT id_assessor, nome_assessor, equipe FROM assessores WHERE equipe IS NOT NULL ORDER BY equipe, nome_assessor`)
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

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const fw = buildDivFilter(filter)

  const [alocacaoRows, totalRow] = await Promise.all([
    db
      .prepare(`
        SELECT produto,
               SUM(net)              AS total,
               COUNT(DISTINCT id_cliente) AS clientes
        FROM   tb_diversificador${fw}
        GROUP  BY produto
        ORDER  BY total DESC
      `)
      .all<{ produto: string; total: number; clientes: number }>(),
    db
      .prepare(`SELECT SUM(net) AS aum, MAX(data_posicao) AS data_ref FROM tb_diversificador${fw}`)
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

  const filter = await resolveFilterFromCtx(c)
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

    // RF busca por código OU nome amigável (analitico_rf.nome_ativo via ticker = último token de d.ativo)
    db
      .prepare(`
        WITH match_tk AS (
          SELECT DISTINCT ticker FROM analitico_rf
          WHERE  nome_ativo LIKE ?1 AND ticker IS NOT NULL
        ),
        res AS (
          SELECT d.ativo, d.sub_produto AS categoria,
                 SUM(d.net) AS total, COUNT(DISTINCT d.id_cliente) AS clientes
          FROM   tb_diversificador d
          INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
          WHERE  d.ativo IS NOT NULL
            AND  d.produto = 'Renda Fixa'
            AND  (d.ativo LIKE ?1
                  OR substr(d.ativo, length(rtrim(d.ativo, replace(d.ativo, ' ', ''))) + 1) IN (SELECT ticker FROM match_tk))
            ${waRFJ}
          GROUP  BY d.ativo, d.sub_produto
          ORDER  BY total DESC
          LIMIT  8
        ),
        nomes AS (
          SELECT ticker, MIN(nome_ativo) AS nome_ativo
          FROM   analitico_rf
          WHERE  ticker IN (SELECT substr(ativo, length(rtrim(ativo, replace(ativo, ' ', ''))) + 1) FROM res)
            AND  nome_ativo IS NOT NULL
          GROUP  BY ticker
          HAVING COUNT(DISTINCT nome_ativo) = 1
        )
        SELECT 'rf' AS classe, res.*, n.nome_ativo
        FROM   res
        LEFT   JOIN nomes n ON n.ticker = substr(res.ativo, length(rtrim(res.ativo, replace(res.ativo, ' ', ''))) + 1)
      `)
      .bind(like)
      .all<{ classe: 'rf'; ativo: string; nome_ativo: string | null; categoria: string | null; total: number; clientes: number }>(),
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

  const filter = await resolveFilterFromCtx(c)
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

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'p.id_assessor')

  // Nome amigável vem de analitico_rf.ticker = último token de tb_diversificador.ativo
  // (ex: "CRA FLU CRA02200C1F" → "CRA PATENSE - MAI/2028"). Títulos públicos compartilham
  // o ticker SELIC entre vencimentos (n > 1) → sem nome único, cai no código original.
  const rows = await db
    .prepare(`
      WITH top AS (
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
      ),
      nomes AS (
        SELECT ticker, MIN(nome_ativo) AS nome_ativo
        FROM   analitico_rf
        WHERE  ticker IN (SELECT substr(ativo, length(rtrim(ativo, replace(ativo, ' ', ''))) + 1) FROM top)
          AND  nome_ativo IS NOT NULL
        GROUP  BY ticker
        HAVING COUNT(DISTINCT nome_ativo) = 1
      )
      SELECT top.*, n.nome_ativo
      FROM   top
      LEFT   JOIN nomes n ON n.ticker = substr(top.ativo, length(rtrim(top.ativo, replace(top.ativo, ' ', ''))) + 1)
      ORDER  BY top.total DESC
    `)
    .all<{ ativo: string; nome_ativo: string | null; sub_produto: string; emissor: string | null; total: number; clientes: number; posicoes: number }>()

  return c.json({ data: { ativos: rows.results } })
})

/* ─── /carteiras/drill ───────────────────────────────────────────────────── */

app.get('/carteiras/drill', async (c) => {
  const ativo = c.req.query('ativo')
  if (!ativo) return c.json({ error: 'ativo obrigatório' }, 400)

  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'p.id_assessor')

  const [clientesRows, summaryRow] = await Promise.all([
    db
      .prepare(`
        SELECT d.id_cliente, bc.nome_cliente,
               SUM(d.net)       AS total,
               d.data_vencimento,
               d.sub_produto,
               MAX(a.nome_assessor) AS nome_assessor
        FROM   tb_diversificador d
        INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
        LEFT   JOIN base_clientes bc ON d.id_cliente = bc.id_cliente
        LEFT   JOIN assessores a ON p.id_assessor = a.id_assessor
        WHERE  d.ativo = ?
          AND  d.produto = 'Renda Fixa'
          ${wa}
        GROUP  BY d.id_cliente, bc.nome_cliente, d.data_vencimento, d.sub_produto
        ORDER  BY total DESC
        LIMIT  20
      `)
      .bind(ativo)
      .all<{ id_cliente: number; nome_cliente: string | null; total: number; data_vencimento: string | null; sub_produto: string; nome_assessor: string | null }>(),

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

/* ─── /carteiras/drill/export ───────────────────────────────────────────── */

app.get('/carteiras/drill/export', async (c) => {
  const ativo = c.req.query('ativo')
  const tipo  = c.req.query('tipo') ?? 'rf' // 'rf' | 'rv'
  if (!ativo) return c.json({ error: 'ativo obrigatório' }, 400)

  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'p.id_assessor')

  if (tipo === 'rv') {
    const waRV = buildAndFilter(filter)
    const rows = await db
      .prepare(`
        SELECT rv.id_cliente, bc.nome_cliente,
               SUM(rv.auc)       AS total,
               rv.setor, rv.produto,
               AVG(rv.variacao)  AS variacao,
               MAX(a.nome_assessor) AS nome_assessor,
               MAX(a.equipe)        AS equipe
        FROM   analitico_rv rv
        LEFT   JOIN base_clientes bc ON rv.id_cliente = bc.id_cliente
        LEFT   JOIN tb_positivador p  ON rv.id_cliente = p.id_cliente
        LEFT   JOIN assessores a ON p.id_assessor = a.id_assessor
        WHERE  rv.ativo = ?
          ${waRV}
        GROUP  BY rv.id_cliente, bc.nome_cliente, rv.setor, rv.produto
        ORDER  BY total DESC
      `)
      .bind(ativo)
      .all<{ id_cliente: number; nome_cliente: string | null; total: number; setor: string | null; produto: string | null; variacao: number | null; nome_assessor: string | null; equipe: string | null }>()
    return c.json({ data: { ativo, tipo: 'rv', clientes: rows.results } })
  }

  const rows = await db
    .prepare(`
      SELECT d.id_cliente, bc.nome_cliente,
             SUM(d.net)           AS total,
             d.data_vencimento,
             d.sub_produto,
             MAX(a.nome_assessor) AS nome_assessor,
             MAX(a.equipe)        AS equipe
      FROM   tb_diversificador d
      INNER  JOIN tb_positivador p ON d.id_cliente = p.id_cliente
      LEFT   JOIN base_clientes bc ON d.id_cliente = bc.id_cliente
      LEFT   JOIN assessores a ON p.id_assessor = a.id_assessor
      WHERE  d.ativo = ?
        AND  d.produto = 'Renda Fixa'
        ${wa}
      GROUP  BY d.id_cliente, bc.nome_cliente, d.data_vencimento, d.sub_produto
      ORDER  BY total DESC
    `)
    .bind(ativo)
    .all<{ id_cliente: number; nome_cliente: string | null; total: number; data_vencimento: string | null; sub_produto: string; nome_assessor: string | null; equipe: string | null }>()

  return c.json({ data: { ativo, tipo: 'rf', clientes: rows.results } })
})

/* ─── /carteiras/drill/setor ────────────────────────────────────────────── */

app.post('/carteiras/drill/setor', async (c) => {
  // POST body evita o truncamento de '&' em query strings pelo Cloudflare.
  const body = await c.req.json() as { setor?: string }
  const setor = (body.setor ?? '').trim()
  if (!setor) return c.json({ error: 'setor obrigatório' }, 400)

  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa     = buildAndFilter(filter)                       // analitico_rv (sem alias)
  const waJoin = buildAndFilter(filter, 'rv.id_assessor')     // query com JOIN

  const [summaryRow, topAtivosRows, topClientesRows] = await Promise.all([
    db
      .prepare(`
        SELECT SUM(auc)               AS total,
               COUNT(DISTINCT id_cliente) AS clientes,
               COUNT(DISTINCT ativo)  AS ativos
        FROM   analitico_rv
        WHERE  setor = ? AND auc IS NOT NULL${wa}
      `)
      .bind(setor)
      .first<{ total: number; clientes: number; ativos: number }>(),

    db
      .prepare(`
        SELECT ativo, produto,
               SUM(auc)                  AS total,
               COUNT(DISTINCT id_cliente) AS clientes,
               AVG(variacao)             AS variacao
        FROM   analitico_rv
        WHERE  setor = ? AND auc IS NOT NULL${wa}
        GROUP  BY ativo, produto
        ORDER  BY total DESC
        LIMIT  10
      `)
      .bind(setor)
      .all<{ ativo: string; produto: string | null; total: number; clientes: number; variacao: number | null }>(),

    db
      .prepare(`
        SELECT rv.id_cliente,
               bc.nome_cliente,
               SUM(rv.auc)           AS total,
               AVG(rv.variacao)      AS variacao,
               MAX(a.nome_assessor)  AS nome_assessor,
               MAX(a.equipe)         AS equipe
        FROM   analitico_rv rv
        LEFT   JOIN base_clientes bc ON rv.id_cliente = bc.id_cliente
        LEFT   JOIN assessores a     ON rv.id_assessor = a.id_assessor
        WHERE  rv.setor = ? AND rv.auc IS NOT NULL${waJoin}
        GROUP  BY rv.id_cliente, bc.nome_cliente
        ORDER  BY total DESC
        LIMIT  20
      `)
      .bind(setor)
      .all<{
        id_cliente: number
        nome_cliente: string | null
        total: number
        variacao: number | null
        nome_assessor: string | null
        equipe: string | null
      }>(),
  ])

  return c.json({
    data: {
      setor,
      total:          summaryRow?.total    ?? 0,
      clientes_count: summaryRow?.clientes ?? 0,
      ativos_count:   summaryRow?.ativos   ?? 0,
      top_ativos:     topAtivosRows.results,
      top_clientes:   topClientesRows.results,
    },
  })
})

/* ─── /carteiras/drill/janela ───────────────────────────────────────────── */

const JANELA_CONDS: Record<string, string> = {
  '0-6m':  `vencimento < date('now', '+6 months')`,
  '6-12m': `vencimento >= date('now', '+6 months') AND vencimento < date('now', '+12 months')`,
  '1-2a':  `vencimento >= date('now', '+12 months') AND vencimento < date('now', '+24 months')`,
  '2-5a':  `vencimento >= date('now', '+24 months') AND vencimento < date('now', '+60 months')`,
  '5+a':   `vencimento >= date('now', '+60 months')`,
}

app.get('/carteiras/drill/janela', async (c) => {
  const janela = c.req.query('janela') ?? ''
  if (!JANELA_CONDS[janela]) {
    return c.json({ error: 'janela inválida — use: 0-6m, 6-12m, 1-2a, 2-5a, 5+a' }, 400)
  }

  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa       = buildAndFilter(filter)                      // analitico_rf (sem alias)
  const waJoin   = buildAndFilter(filter, 'ar.id_assessor')    // query com JOIN

  const cond     = JANELA_CONDS[janela]!
  const condJoin = cond.replace(/vencimento/g, 'ar.vencimento')

  const [summaryRow, clientesRows] = await Promise.all([
    db
      .prepare(`
        SELECT SUM(posicao_atual) AS total,
               COUNT(DISTINCT id_cliente) AS clientes,
               COUNT(*) AS posicoes
        FROM analitico_rf
        WHERE vencimento IS NOT NULL AND ${cond}${wa}
      `)
      .first<{ total: number; clientes: number; posicoes: number }>(),

    db
      .prepare(`
        SELECT ar.id_cliente,
               bc.nome_cliente,
               SUM(ar.posicao_atual) AS total,
               COUNT(*)              AS posicoes,
               MAX(ar.tipo_ativo)    AS tipo_ativo,
               MIN(ar.vencimento)    AS proximo_vencimento,
               MAX(a.nome_assessor)  AS nome_assessor,
               MAX(a.equipe)         AS equipe
        FROM   analitico_rf ar
        LEFT   JOIN base_clientes bc ON ar.id_cliente = bc.id_cliente
        LEFT   JOIN assessores a     ON ar.id_assessor = a.id_assessor
        WHERE  ar.vencimento IS NOT NULL AND ${condJoin}${waJoin}
        GROUP  BY ar.id_cliente, bc.nome_cliente
        ORDER  BY total DESC
        LIMIT  20
      `)
      .all<{
        id_cliente: number
        nome_cliente: string | null
        total: number
        posicoes: number
        tipo_ativo: string | null
        proximo_vencimento: string | null
        nome_assessor: string | null
        equipe: string | null
      }>(),
  ])

  return c.json({
    data: {
      janela,
      total:          summaryRow?.total    ?? 0,
      clientes_count: summaryRow?.clientes ?? 0,
      posicoes:       summaryRow?.posicoes ?? 0,
      clientes:       clientesRows.results,
    },
  })
})

/* ─── /clientes ──────────────────────────────────────────────────────────── */

app.get('/clientes', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
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

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa  = buildAndFilter(filter)
  const fwd = buildDivFilter(filter)

  const JANELAS = ['0-6m', '6-12m', '1-2a', '2-5a', '5+a'] as const
  const janelaExpr = `CASE
    WHEN vencimento < date('now', '+6 months')  THEN '0-6m'
    WHEN vencimento < date('now', '+12 months') THEN '6-12m'
    WHEN vencimento < date('now', '+24 months') THEN '1-2a'
    WHEN vencimento < date('now', '+60 months') THEN '2-5a'
    ELSE '5+a'
  END`

  const [
    rfTotalRow, rvTotalRow, coeTotalRow, ldTotalRow, aumRow,
    rfIdxRows, rfMatRows, rfMarcRows,
    rvSetRows, rvTopRows,
    coeRows, ldRows,
  ] = await Promise.all([
    db.prepare(`SELECT SUM(posicao_atual) as total FROM analitico_rf WHERE tipo_ativo IS NOT NULL AND posicao_atual IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(auc) as total FROM analitico_rv WHERE setor IS NOT NULL AND auc IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(posicao_atual) as total FROM analitico_coe WHERE tipo IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(custodia) as total FROM custodia_ld WHERE indexador IS NOT NULL${wa}`).first<{ total: number }>(),
    db.prepare(`SELECT SUM(net) AS aum FROM tb_diversificador${fwd}`).first<{ aum: number | null }>(),

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
      FROM analitico_coe WHERE tipo IS NOT NULL${wa}
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
  const aumTotal = aumRow?.aum ?? (rfTotal + rvTotal + coeTotal + ldTotal)

  // Build wall-of-maturities
  const matMap: Record<string, Record<string, number>> = {}
  for (const r of rfMatRows.results) {
    if (!matMap[r.janela]) matMap[r.janela] = {}
    const jRow = matMap[r.janela]!
    jRow[r.tipo_ativo] = (jRow[r.tipo_ativo] ?? 0) + r.total
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
      totais: { rf: rfTotal, rv: rvTotal, coe: coeTotal, liquidez: ldTotal, total: aumTotal },
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

/* ─── PJ1 — linhas de produto lideradas pelo lider_pj ─────────────────────── */
app.get('/pj1/receitas', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const w = buildWhereFilter(filter)

  const [rvRow, rfRow, coeRow, cambioRow, ofFundosRow, fundosRow, prevRow] = await Promise.all([
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_rv${w}`).first<{ v: number }>(),
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_rf${w}`).first<{ v: number }>(),
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_coe${w}`).first<{ v: number }>(),
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_cambio${w}`).first<{ v: number }>(),
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_oferta_fundos${w}`).first<{ v: number }>(),
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_fundos${w}`).first<{ v: number }>(),
    db.prepare(`SELECT COALESCE(SUM(receita), 0) AS v FROM receita_prev${w}`).first<{ v: number }>(),
  ])

  const categorias = [
    { slug: 'rv',            label: 'Renda Variável',   receita: rvRow?.v ?? 0 },
    { slug: 'rf',            label: 'Renda Fixa',       receita: rfRow?.v ?? 0 },
    { slug: 'coe',           label: 'COE',              receita: coeRow?.v ?? 0 },
    { slug: 'cambio',        label: 'Câmbio',           receita: cambioRow?.v ?? 0 },
    { slug: 'oferta_fundos', label: 'Oferta de Fundos', receita: ofFundosRow?.v ?? 0 },
    { slug: 'fundos',        label: 'Fundos',           receita: fundosRow?.v ?? 0 },
    { slug: 'previdencia',   label: 'Previdência',      receita: prevRow?.v ?? 0 },
  ]
  const total = categorias.reduce((s, c) => s + c.receita, 0)

  const mesLabel = new Date()
    .toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' })
    .replace(/^\w/, (ch) => ch.toUpperCase())

  return c.json({
    data: {
      mesLabel,
      categorias,
      total,
    },
  })
})

/* ─── PJ1 — receita agregada por equipe (drill: equipe → assessor) ────────── */
app.get('/pj1/receita-por-equipe', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'r.id_assessor')

  const TABLES = [
    'receita_rv',
    'receita_rf',
    'receita_coe',
    'receita_cambio',
    'receita_oferta_fundos',
    'receita_fundos',
    'receita_prev',
  ]
  const unionSql = TABLES.map((t) => `SELECT id_assessor, receita FROM ${t}`).join(' UNION ALL ')

  const rows = await db.prepare(`
    SELECT
      COALESCE(a.equipe, 'SEM EQUIPE') AS equipe,
      r.id_assessor AS id_assessor,
      COALESCE(a.nome_assessor, r.id_assessor) AS nome_assessor,
      SUM(r.receita) AS receita
    FROM (${unionSql}) r
    LEFT JOIN assessores a ON r.id_assessor = a.id_assessor
    WHERE 1=1${wa}
    GROUP BY COALESCE(a.equipe, 'SEM EQUIPE'), r.id_assessor
    HAVING SUM(r.receita) > 0
    ORDER BY receita DESC
  `).all<{ equipe: string; id_assessor: string; nome_assessor: string; receita: number }>()

  type Assessor = { id: string; nome: string; receita: number }
  type Equipe = { equipe: string; total: number; assessores: Assessor[] }

  const equipesMap = new Map<string, Equipe>()
  for (const row of rows.results) {
    if (!equipesMap.has(row.equipe)) {
      equipesMap.set(row.equipe, { equipe: row.equipe, total: 0, assessores: [] })
    }
    const eq = equipesMap.get(row.equipe)!
    eq.total += row.receita
    eq.assessores.push({ id: row.id_assessor, nome: row.nome_assessor, receita: row.receita })
  }
  const equipes: Equipe[] = Array.from(equipesMap.values())
    .map((eq) => {
      eq.assessores.sort((a, b) => b.receita - a.receita)
      return eq
    })
    .sort((a, b) => b.total - a.total)
  const total = equipes.reduce((s, e) => s + e.total, 0)

  return c.json({ data: { total, equipes } })
})

app.get('/pj1/drill', async (c) => {
  const db = c.env.PERF_DB
  const categoria = c.req.query('categoria') ?? ''

  const TABELAS: Record<string, { tabela: string; label: string }> = {
    rv:            { tabela: 'receita_rv',            label: 'Renda Variável'   },
    rf:            { tabela: 'receita_rf',            label: 'Renda Fixa'       },
    coe:           { tabela: 'receita_coe',           label: 'COE'              },
    cambio:        { tabela: 'receita_cambio',        label: 'Câmbio'           },
    oferta_fundos: { tabela: 'receita_oferta_fundos', label: 'Oferta de Fundos' },
  }
  const meta = TABELAS[categoria]
  if (!meta) return c.json({ error: 'categoria inválida' }, 400)

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter, 'r.id_assessor')

  const rows = await db.prepare(`
    SELECT
      COALESCE(a.equipe, 'SEM EQUIPE') AS equipe,
      r.id_assessor,
      COALESCE(a.nome_assessor, r.id_assessor) AS nome_assessor,
      r.id_cliente,
      bc.nome_cliente,
      SUM(r.receita) AS receita
    FROM ${meta.tabela} r
    LEFT JOIN assessores a ON r.id_assessor = a.id_assessor
    LEFT JOIN base_clientes bc ON r.id_cliente = bc.id_cliente
    WHERE 1=1${wa}
    GROUP BY COALESCE(a.equipe, 'SEM EQUIPE'), r.id_assessor, r.id_cliente
    HAVING SUM(r.receita) > 0
    ORDER BY receita DESC
  `).all<{ equipe: string; id_assessor: string; nome_assessor: string; id_cliente: string | number | null; nome_cliente: string | null; receita: number }>()

  type Cliente = { id: string | number; nome: string | null; receita: number }
  type Assessor = { id: string; nome: string; receita: number; clientes: Cliente[] }
  type Equipe = { equipe: string; total: number; assessores: Assessor[] }

  const equipesMap = new Map<string, { entry: Equipe; assessoresMap: Map<string, Assessor> }>()
  for (const row of rows.results) {
    if (!equipesMap.has(row.equipe)) {
      equipesMap.set(row.equipe, {
        entry: { equipe: row.equipe, total: 0, assessores: [] },
        assessoresMap: new Map(),
      })
    }
    const eq = equipesMap.get(row.equipe)!
    eq.entry.total += row.receita

    if (!eq.assessoresMap.has(row.id_assessor)) {
      const assessor: Assessor = { id: row.id_assessor, nome: row.nome_assessor, receita: 0, clientes: [] }
      eq.assessoresMap.set(row.id_assessor, assessor)
      eq.entry.assessores.push(assessor)
    }
    const asr = eq.assessoresMap.get(row.id_assessor)!
    asr.receita += row.receita
    if (row.id_cliente != null) {
      asr.clientes.push({ id: row.id_cliente, nome: row.nome_cliente, receita: row.receita })
    }
  }
  // Ordenação: equipes por total desc; assessores dentro da equipe por receita desc; clientes idem.
  const equipes: Equipe[] = Array.from(equipesMap.values())
    .map((eq) => {
      eq.entry.assessores.sort((a, b) => b.receita - a.receita)
      eq.entry.assessores.forEach((a) => a.clientes.sort((x, y) => y.receita - x.receita))
      return eq.entry
    })
    .sort((a, b) => b.total - a.total)
  const total = equipes.reduce((s, e) => s + e.total, 0)

  return c.json({
    data: {
      categoria,
      label: meta.label,
      total,
      equipes,
    },
  })
})

export default app
