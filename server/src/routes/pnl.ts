import { Hono } from 'hono'
import type { Env, Variables } from '../types'

const MES_COLS = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const

const EQUIPES = ['SMART', 'PRIVATE', 'RIO PRETO', 'BRAVO'] as const
type Equipe = (typeof EQUIPES)[number]

const EQUIPES_SQL = `('SMART','PRIVATE','RIO PRETO','BRAVO')`


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

  const [metaRows, receitaRows] = await Promise.all([
    db.prepare(`
      SELECT equipe, ${mesCol} AS meta
      FROM   tb_metas_times
      WHERE  equipe IN ${EQUIPES_SQL}
    `).all<{ equipe: string; meta: number | null }>(),

    db.prepare(`
      SELECT a.equipe, SUM(r.receita) AS total
      FROM (
        SELECT id_assessor, receita FROM receita_rv
        UNION ALL SELECT id_assessor, receita FROM receita_rf
        UNION ALL SELECT id_assessor, receita FROM receita_coe
        UNION ALL SELECT id_assessor, receita FROM receita_cambio
        UNION ALL SELECT id_assessor, receita FROM receita_feefixo
        UNION ALL SELECT id_assessor, receita FROM receita_seguros
        UNION ALL SELECT id_assessor, receita FROM receita_consorcio
        UNION ALL SELECT id_assessor, receita FROM receita_dominion
        UNION ALL SELECT id_assessor, receita FROM receita_oferta_fundos
        UNION ALL SELECT id_assessor, receita FROM receita_fundos
        UNION ALL SELECT id_assessor, receita FROM receita_prev
      ) r
      JOIN assessores a ON r.id_assessor = a.id_assessor
      WHERE a.equipe IN ${EQUIPES_SQL}
      GROUP BY a.equipe
    `).all<{ equipe: string; total: number }>(),
  ])

  const metaMap:      Record<string, number> = {}
  const totalReceita: Record<string, number> = {}

  for (const r of metaRows.results)   metaMap[r.equipe]      = r.meta  ?? 0
  for (const r of receitaRows.results) totalReceita[r.equipe] = r.total ?? 0

  const grandTotalReceita = Object.values(totalReceita).reduce((s, v) => s + v, 0)
  const grandTotalMeta    = Object.values(metaMap).reduce((s, v) => s + v, 0)

  return c.json({
    data: {
      equipes: EQUIPES as readonly string[],
      metas: metaMap,
      totalReceita,
      grandTotalReceita,
      grandTotalMeta,
    },
  })
})

export default app
