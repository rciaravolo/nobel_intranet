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

/* ── GET /missoes ──────────────────────────────────────────────────────────
   KPIs + linhas em uma única round-trip.
   Base sempre no período mais recente disponível (dado externo).
──────────────────────────────────────────────────────────────────────────── */
app.get('/', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wf = buildAndFilter(filter, 'm.id_assessor')

  const [kpisRow, rows] = await Promise.all([
    db
      .prepare(`
        SELECT
          COUNT(*)                                                    AS total,
          SUM(CASE WHEN m.status = 'Premiado' THEN 1 ELSE 0 END)      AS premiadas,
          SUM(CASE WHEN m.status = 'Ativado'  THEN 1 ELSE 0 END)      AS ativadas,
          SUM(CASE WHEN m.status = 'Elegível' THEN 1 ELSE 0 END)      AS elegiveis,
          COUNT(DISTINCT m.id_assessor)                               AS assessores_ativos,
          MAX(m.ano_mes)                                              AS periodo
        FROM missoes m
        WHERE 1=1${wf}
      `)
      .first<{
        total: number | null
        premiadas: number | null
        ativadas: number | null
        elegiveis: number | null
        assessores_ativos: number | null
        periodo: string | null
      }>(),
    db
      .prepare(`
        SELECT
          m.id_assessor                                                AS id_assessor,
          a.nome_assessor                                              AS nome_assessor,
          a.equipe                                                     AS equipe,
          m.produto                                                    AS produto,
          m.valor                                                      AS valor,
          m.status                                                     AS status,
          m.url_img                                                    AS url_img,
          m.ano_mes                                                    AS ano_mes
        FROM missoes m
        LEFT JOIN assessores a ON a.id_assessor = m.id_assessor
        WHERE 1=1${wf}
        ORDER BY
          CASE m.status
            WHEN 'Premiado' THEN 1
            WHEN 'Ativado'  THEN 2
            WHEN 'Elegível' THEN 3
            ELSE 4
          END,
          m.valor DESC
      `)
      .all<{
        id_assessor: string
        nome_assessor: string | null
        equipe: string | null
        produto: string | null
        valor: number | null
        status: string | null
        url_img: string | null
        ano_mes: string | null
      }>(),
  ])

  return c.json({
    data: {
      kpis: {
        total: kpisRow?.total ?? 0,
        premiadas: kpisRow?.premiadas ?? 0,
        ativadas: kpisRow?.ativadas ?? 0,
        elegiveis: kpisRow?.elegiveis ?? 0,
        assessoresAtivos: kpisRow?.assessores_ativos ?? 0,
        periodo: formatAnoMes(kpisRow?.periodo ?? null),
      },
      rows: (rows.results ?? []).map((r) => ({
        idAssessor: r.id_assessor,
        nomeAssessor: r.nome_assessor,
        equipe: r.equipe,
        produto: r.produto,
        valor: r.valor,
        status: r.status,
        urlImg: r.url_img,
      })),
    },
  })
})

export default app
