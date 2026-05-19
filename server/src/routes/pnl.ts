import { Hono } from 'hono'
import type { Env, Variables } from '../types'

const MES_COLS = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const

const EQUIPES = ['SMART', 'PRIVATE', 'RIO PRETO', 'BRAVO'] as const
type Equipe = (typeof EQUIPES)[number]

const EQUIPES_SQL = `('SMART','PRIVATE','RIO PRETO','BRAVO')`

const PRODUTOS = [
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
] as const

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('*', async (c, next) => {
  const auth   = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  if (auth !== `Bearer ${secret}`) {
    const cfJwt = c.req.header('Cf-Access-Jwt-Assertion')
    if (!cfJwt) return c.json({ error: 'Unauthorized' }, 401)
  }

  const role = c.req.header('X-User-Role')
  if (role !== 'admin' && role !== 'master') return c.json({ error: 'Forbidden' }, 403)

  await next()
})

/* ─── GET /pnl/captacao-equipes ──────────────────────────────────────────── */

app.get('/captacao-equipes', async (c) => {
  const db  = c.env.PERF_DB
  const brt = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const mesISO = `${brt.getUTCFullYear()}-${String(brt.getUTCMonth() + 1).padStart(2, '0')}`
  const mesCol = MES_COLS[brt.getUTCMonth()]!

  // 2 datas mais recentes no mês corrente
  const datesRes = await db
    .prepare(`SELECT DISTINCT date(data) as d FROM tb_cap WHERE strftime('%Y-%m', data) = ? ORDER BY d DESC LIMIT 2`)
    .bind(mesISO)
    .all<{ d: string }>()

  const dateHoje  = datesRes.results[0]?.d ?? null
  const dateOntem = datesRes.results[1]?.d ?? null

  if (!dateHoje) return c.json({ data: { semDados: true as const, mesISO } })

  const [capHojeRows, capOntemRows, metaRows] = await Promise.all([
    db.prepare(`
      SELECT a.equipe, SUM(c.captacao) AS cap
      FROM   tb_cap c
      JOIN   assessores a ON c.id_assessor = a.id_assessor
      WHERE  strftime('%Y-%m', c.data) = ?
        AND  date(c.data) <= ?
        AND  a.equipe IN ${EQUIPES_SQL}
      GROUP  BY a.equipe
    `).bind(mesISO, dateHoje).all<{ equipe: string; cap: number }>(),

    dateOntem
      ? db.prepare(`
          SELECT a.equipe, SUM(c.captacao) AS cap
          FROM   tb_cap c
          JOIN   assessores a ON c.id_assessor = a.id_assessor
          WHERE  strftime('%Y-%m', c.data) = ?
            AND  date(c.data) <= ?
            AND  a.equipe IN ${EQUIPES_SQL}
          GROUP  BY a.equipe
        `).bind(mesISO, dateOntem).all<{ equipe: string; cap: number }>()
      : Promise.resolve({ results: [] as { equipe: string; cap: number }[] }),

    db.prepare(`
      SELECT a.equipe, SUM(mc.${mesCol}) AS meta
      FROM   meta_captacao mc
      JOIN   assessores a ON mc.id_assessor = a.id_assessor
      WHERE  a.equipe IN ${EQUIPES_SQL}
      GROUP  BY a.equipe
    `).all<{ equipe: string; meta: number | null }>(),
  ])

  const capHojeMap:  Record<string, number> = {}
  const capOntemMap: Record<string, number> = {}
  const metaMap:     Record<string, number> = {}

  for (const r of capHojeRows.results)  capHojeMap[r.equipe]  = r.cap
  for (const r of capOntemRows.results) capOntemMap[r.equipe] = r.cap
  for (const r of metaRows.results)     metaMap[r.equipe]     = r.meta ?? 0

  const equipes = (EQUIPES as readonly Equipe[]).map((equipe) => {
    const capHoje  = capHojeMap[equipe]  ?? 0
    const capOntem = capOntemMap[equipe] ?? 0
    const meta     = metaMap[equipe]     ?? 0
    const deltaDia = capHoje - capOntem
    const pctHoje  = meta > 0 ? capHoje  / meta : null
    const pctOntem = meta > 0 ? capOntem / meta : null
    const deltaPp  = pctHoje != null && pctOntem != null ? pctHoje - pctOntem : null
    return { equipe, capHoje, capOntem, deltaDia, meta, pctHoje, pctOntem, deltaPp }
  })

  const totCapHoje  = equipes.reduce((s, e) => s + e.capHoje, 0)
  const totCapOntem = equipes.reduce((s, e) => s + e.capOntem, 0)
  const totMeta     = equipes.reduce((s, e) => s + e.meta, 0)
  const totDelta    = totCapHoje - totCapOntem
  const totPctHoje  = totMeta > 0 ? totCapHoje  / totMeta : null
  const totPctOntem = totMeta > 0 ? totCapOntem / totMeta : null
  const totDeltaPp  = totPctHoje != null && totPctOntem != null ? totPctHoje - totPctOntem : null

  return c.json({
    data: {
      semDados: false as const,
      mesISO,
      dataHoje:  dateHoje,
      dataOntem: dateOntem,
      equipes,
      total: {
        capHoje:  totCapHoje,
        capOntem: totCapOntem,
        deltaDia: totDelta,
        meta:     totMeta,
        pctHoje:  totPctHoje,
        pctOntem: totPctOntem,
        deltaPp:  totDeltaPp,
      },
    },
  })
})

/* ─── GET /pnl/receita-equipes ───────────────────────────────────────────── */

app.get('/receita-equipes', async (c) => {
  const db  = c.env.PERF_DB
  const brt = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const mesCol = MES_COLS[brt.getUTCMonth()]!

  const [metaRows, ...receitaResults] = await Promise.all([
    db.prepare(`
      SELECT equipe, ${mesCol} AS meta
      FROM   tb_metas_times
      WHERE  equipe IN ${EQUIPES_SQL}
    `).all<{ equipe: string; meta: number | null }>(),
    ...PRODUTOS.map((p) =>
      db.prepare(`
        SELECT a.equipe, SUM(r.receita) AS receita
        FROM   ${p.tabela} r
        JOIN   assessores a ON r.id_assessor = a.id_assessor
        WHERE  a.equipe IN ${EQUIPES_SQL}
        GROUP  BY a.equipe
      `).all<{ equipe: string; receita: number }>()
    ),
  ])

  const metaMap: Record<string, number> = {}
  for (const r of metaRows.results) metaMap[r.equipe] = r.meta ?? 0

  const produtos = PRODUTOS.map((p, i) => {
    const rows    = receitaResults[i]!.results
    const receita: Record<string, number> = {}
    let   total   = 0
    for (const r of rows) {
      receita[r.equipe] = r.receita
      total += r.receita
    }
    return { slug: p.slug, label: p.label, receita, total }
  })

  // Receita total por equipe
  const totalReceita: Record<string, number> = {}
  for (const equipe of EQUIPES) {
    totalReceita[equipe] = produtos.reduce((s, p) => s + (p.receita[equipe] ?? 0), 0)
  }
  const grandTotalReceita = Object.values(totalReceita).reduce((s, v) => s + v, 0)
  const grandTotalMeta    = Object.values(metaMap).reduce((s, v) => s + v, 0)

  return c.json({
    data: {
      equipes: EQUIPES as readonly string[],
      produtos,
      metas: metaMap,
      totalReceita,
      grandTotalReceita,
      grandTotalMeta,
    },
  })
})

export default app
