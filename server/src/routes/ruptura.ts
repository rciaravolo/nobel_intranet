import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { resolveFilterFromCtx, buildAndFilter } from '../lib/role-filter'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatAnoMes(anoMes: string | null): string | null {
  if (!anoMes) return null
  const s = anoMes.replace('.0', '')
  if (s.length !== 6) return anoMes
  const y = s.slice(0, 4)
  const m = parseInt(s.slice(4, 6))
  if (!MESES[m - 1]) return anoMes
  return `${MESES[m - 1]}/${y}`
}

// Auth: internal secret (Next.js SSR) OU Cf-Access-Jwt-Assertion (browser)
app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (auth === `Bearer ${secret}`) return next()
  if (c.req.header('Cf-Access-Jwt-Assertion')) return next()
  return c.json({ error: 'Unauthorized' }, 401)
})

/* ── GET /ruptura ──────────────────────────────────────────────────────────
   KPIs + linhas em uma única round-trip.
   Filtra por role via resolveFilterFromCtx (assessor vê só as próprias).
──────────────────────────────────────────────────────────────────────────── */
app.get('/', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wf = buildAndFilter(filter, 'r.id_assessor')

  const [kpisRow, rows] = await Promise.all([
    db
      .prepare(`
        SELECT
          COUNT(*)                                                    AS total,
          SUM(CASE WHEN r.pont_ruptura >= 6 THEN 1 ELSE 0 END)        AS alta,
          SUM(CASE WHEN r.pont_ruptura BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS media,
          COALESCE(SUM(r.auc), 0)                                     AS auc_total,
          COUNT(DISTINCT r.id_assessor)                               AS assessores_ativos,
          MAX(r.ano_mes)                                              AS periodo
        FROM ruptura r
        WHERE 1=1${wf}
      `)
      .first<{
        total: number | null
        alta: number | null
        media: number | null
        auc_total: number | null
        assessores_ativos: number | null
        periodo: string | null
      }>(),
    db
      .prepare(`
        SELECT
          r.id_cliente                                                AS id_cliente,
          COALESCE(bc.nome_cliente, 'Cliente ' || r.id_cliente)       AS nome_cliente,
          r.id_assessor                                               AS id_assessor,
          COALESCE(a.nome_assessor, r.nome_assessor)                  AS nome_assessor,
          r.modelo                                                    AS modelo,
          r.auc                                                       AS auc,
          r.pont_ruptura                                              AS pont_ruptura,
          r.meses_ruptura                                             AS meses_ruptura,
          r.nps_detrator                                              AS nps_detrator,
          r.stvm_out                                                  AS stvm_out,
          r.monoproduto_cross_sell                                    AS monoproduto_cross_sell,
          r.sem_aportes                                               AS sem_aportes,
          r.rent_negativa                                             AS rent_negativa,
          r.sem_ordem                                                 AS sem_ordem
        FROM ruptura r
        LEFT JOIN base_clientes bc ON bc.id_cliente = r.id_cliente
        LEFT JOIN assessores a ON a.id_assessor = r.id_assessor
        WHERE 1=1${wf}
        ORDER BY r.pont_ruptura DESC, r.auc DESC
      `)
      .all<{
        id_cliente: number
        nome_cliente: string
        id_assessor: string
        nome_assessor: string | null
        modelo: string | null
        auc: number | null
        pont_ruptura: number | null
        meses_ruptura: number | null
        nps_detrator: number | null
        stvm_out: number | null
        monoproduto_cross_sell: number | null
        sem_aportes: number | null
        rent_negativa: number | null
        sem_ordem: number | null
      }>(),
  ])

  return c.json({
    data: {
      kpis: {
        total: kpisRow?.total ?? 0,
        alta: kpisRow?.alta ?? 0,
        media: kpisRow?.media ?? 0,
        aucTotal: kpisRow?.auc_total ?? 0,
        assessoresAtivos: kpisRow?.assessores_ativos ?? 0,
        periodo: formatAnoMes(kpisRow?.periodo ?? null),
      },
      rows: (rows.results ?? []).map((r) => ({
        idCliente: r.id_cliente,
        nomeCliente: r.nome_cliente,
        idAssessor: r.id_assessor,
        nomeAssessor: r.nome_assessor,
        modelo: r.modelo,
        auc: r.auc,
        pontRuptura: r.pont_ruptura,
        mesesRuptura: r.meses_ruptura,
        sinais: {
          npsDetrator: r.nps_detrator === 1,
          stvmOut: r.stvm_out === 1,
          monoproduto: r.monoproduto_cross_sell === 1,
          semAportes: r.sem_aportes === 1,
          rentNegativa: r.rent_negativa === 1,
          semOrdem: r.sem_ordem === 1,
        },
      })),
    },
  })
})

export default app
