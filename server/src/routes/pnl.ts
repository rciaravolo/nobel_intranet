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
  const year  = brt.getUTCFullYear()
  const month = brt.getUTCMonth()
  const day   = brt.getUTCDate()

  // Conta dias úteis desde o dia 1 até hoje (inclusive)
  let bizDaysInMonth = 0
  for (let d = 1; d <= day; d++) {
    const dow = new Date(Date.UTC(year, month, d)).getUTCDay()
    if (dow !== 0 && dow !== 6) bizDaysInMonth++
  }

  // Primeiros 2 dias úteis do mês → tratar como mês anterior
  const usesPrevMonth = bizDaysInMonth <= 2
  const effMonth = usesPrevMonth ? (month === 0 ? 11 : month - 1) : month
  const effYear  = usesPrevMonth && month === 0 ? year - 1 : year

  const mesISO = `${effYear}-${String(effMonth + 1).padStart(2, '0')}`
  const mesCol = MES_COLS[effMonth]!

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
  const mesCol   = MES_COLS[effMonth]!
  const effectiveMesISO = `${effYear}-${String(effMonth + 1).padStart(2, '0')}`

  const TABELAS = [
    'receita_rv', 'receita_rf', 'receita_coe', 'receita_cambio',
    'receita_feefixo', 'receita_seguros', 'receita_consorcio', 'receita_dominion',
    'receita_oferta_fundos', 'receita_parceiros', 'receita_precas',
    'receita_fundos', 'receita_prev',
  ]

  const [metaRows, allSnapRows, ...receitaResults] = await Promise.all([
    db.prepare(`
      SELECT equipe, ${mesCol} AS meta
      FROM   tb_metas_times
      WHERE  equipe IN ${EQUIPES_SQL}
    `).all<{ equipe: string; meta: number | null }>(),
    db.prepare(`
      SELECT equipe, data, receita_total
      FROM   receita_snapshot
      WHERE  strftime('%Y-%m', data) = ?
        AND  equipe IN ${EQUIPES_SQL}
      ORDER  BY data DESC
    `).bind(effectiveMesISO).all<{ equipe: string; data: string; receita_total: number }>(),
    ...TABELAS.map((tabela) =>
      db.prepare(`
        SELECT a.equipe, SUM(r.receita) AS receita
        FROM   ${tabela} r
        JOIN   assessores a ON r.id_assessor = a.id_assessor
        WHERE  a.equipe IN ${EQUIPES_SQL}
        GROUP  BY a.equipe
      `).all<{ equipe: string; receita: number }>()
    ),
  ])

  const metaMap:      Record<string, number> = {}
  const totalReceita: Record<string, number> = {}

  for (const r of metaRows.results) metaMap[r.equipe] = r.meta ?? 0

  for (const res of receitaResults) {
    for (const r of res.results) {
      totalReceita[r.equipe] = (totalReceita[r.equipe] ?? 0) + r.receita
    }
  }

  const grandTotalReceita = Object.values(totalReceita).reduce((s, v) => s + v, 0)
  const grandTotalMeta    = Object.values(metaMap).reduce((s, v) => s + v, 0)

  // 2 dias úteis atrás (pula sáb/dom)
  const ref = new Date(brt)
  let bizDays = 0
  while (bizDays < 2) {
    ref.setUTCDate(ref.getUTCDate() - 1)
    const dow = ref.getUTCDay()
    if (dow !== 0 && dow !== 6) bizDays++
  }
  const dataRef = `${ref.getUTCFullYear()}-${String(ref.getUTCMonth() + 1).padStart(2, '0')}-${String(ref.getUTCDate()).padStart(2, '0')}`

  // Monta snapshot das 2 datas mais recentes
  const snapDates = [...new Set(allSnapRows.results.map(r => r.data))].slice(0, 2)
  const snapMatrix: Record<string, Record<string, number | null>> = {}
  for (const equipe of EQUIPES) {
    snapMatrix[equipe] = {}
    const meta = metaMap[equipe] ?? 0
    for (const row of allSnapRows.results.filter(r => r.equipe === equipe && snapDates.includes(r.data))) {
      snapMatrix[equipe][row.data] = meta > 0 ? row.receita_total / meta : null
    }
  }

  return c.json({
    data: {
      equipes: EQUIPES as readonly string[],
      metas: metaMap,
      totalReceita,
      grandTotalReceita,
      grandTotalMeta,
      dataRef,
      snapDates,
      snapMatrix,
    },
  })
})

/* ─── GET /pnl/receita-historico ─────────────────────────────────────────── */

app.get('/receita-historico', async (c) => {
  const db = c.env.PERF_DB

  // Data de referência = última data em tb_cap (ETL sempre ~2 dias úteis atrás do dia atual)
  const refRow = await db
    .prepare(`SELECT MAX(date(data)) AS ref FROM tb_cap`)
    .first<{ ref: string | null }>()

  const refDate = refRow?.ref
  if (!refDate) return c.json({ data: { semDados: true as const, mesISO: '' } })

  const mesISO = refDate.substring(0, 7)
  const mesNum = parseInt(refDate.substring(5, 7), 10) - 1
  const mesCol = MES_COLS[mesNum]!

  const [datesRes, metaRows, snapshotRows] = await Promise.all([
    db.prepare(`
      SELECT DISTINCT data FROM receita_snapshot
      WHERE  strftime('%Y-%m', data) = ?
      ORDER  BY data DESC LIMIT 10
    `).bind(mesISO).all<{ data: string }>(),
    db.prepare(`
      SELECT equipe, ${mesCol} AS meta
      FROM   tb_metas_times
      WHERE  equipe IN ${EQUIPES_SQL}
    `).all<{ equipe: string; meta: number | null }>(),
    db.prepare(`
      SELECT equipe, data, receita_total
      FROM   receita_snapshot
      WHERE  strftime('%Y-%m', data) = ?
        AND  equipe IN ${EQUIPES_SQL}
      ORDER  BY data DESC
    `).bind(mesISO).all<{ equipe: string; data: string; receita_total: number }>(),
  ])

  const dates = datesRes.results.map((r) => r.data)
  if (dates.length === 0) return c.json({ data: { semDados: true as const, mesISO } })

  const metaMap: Record<string, number> = {}
  for (const r of metaRows.results) metaMap[r.equipe] = r.meta ?? 0

  const matrix: Record<string, Record<string, number | null>> = {}
  for (const equipe of EQUIPES) {
    matrix[equipe] = {}
    const meta = metaMap[equipe] ?? 0
    for (const row of snapshotRows.results.filter((r) => r.equipe === equipe)) {
      matrix[equipe][row.data] = meta > 0 ? row.receita_total / meta : null
    }
  }

  return c.json({
    data: {
      semDados:  false as const,
      mesISO,
      equipes:   EQUIPES as readonly string[],
      dates,
      metas:     metaMap,
      matrix,
    },
  })
})

export default app
