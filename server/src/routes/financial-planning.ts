import { Hono } from 'hono'
import { buildAndFilter, resolveFilterFromCtx } from '../lib/role-filter'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatAnoMes(anoMes: string | null): string | null {
  if (!anoMes) return null
  const s = anoMes.replace('.0', '')
  if (s.length !== 6) return anoMes
  const y = s.slice(0, 4)
  const m = Number.parseInt(s.slice(4, 6))
  if (!MESES[m - 1]) return anoMes
  return `${MESES[m - 1]}/${y}`
}

app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (auth === `Bearer ${secret}`) return next()
  if (c.req.header('Cf-Access-Jwt-Assertion')) return next()
  return c.json({ error: 'Unauthorized' }, 401)
})

/* ── GET /financial-planning ───────────────────────────────────────────────
   Funil de FP + linhas por cliente. KPIs derivados do universo completo
   (inclui contas inativas). Filtros da UI (status FP / incluir inativos /
   busca) atuam no client-side sobre `rows`.
──────────────────────────────────────────────────────────────────────────── */
app.get('/', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wf = buildAndFilter(filter, 'fp.id_assessor')

  const [kpisRow, clustersRows, rows] = await Promise.all([
    db
      .prepare(`
        SELECT
          COUNT(*)                                                            AS total,
          SUM(CASE WHEN fp.status_fp = 'FP Iniciado' THEN 1 ELSE 0 END)       AS iniciado,
          SUM(CASE WHEN fp.completude >= 70 THEN 1 ELSE 0 END)                AS geq_70,
          SUM(CASE WHEN fp.completude = 100 THEN 1 ELSE 0 END)                AS completo,
          COUNT(DISTINCT fp.id_assessor)                                      AS assessores_ativos,
          MAX(fp.mes)                                                         AS periodo
        FROM financial_planning fp
        WHERE 1=1${wf}
      `)
      .first<{
        total: number | null
        iniciado: number | null
        geq_70: number | null
        completo: number | null
        assessores_ativos: number | null
        periodo: string | null
      }>(),
    db
      .prepare(`
        SELECT
          COALESCE(fp.segmento_conta, 'Sem segmento') AS segmento,
          COUNT(*)                                     AS n
        FROM financial_planning fp
        WHERE fp.completude >= 70${wf}
        GROUP BY fp.segmento_conta
      `)
      .all<{ segmento: string; n: number }>(),
    db
      .prepare(`
        SELECT
          CAST(fp.id_cliente AS INTEGER)                                      AS id_cliente,
          COALESCE(bc.nome_cliente, 'Cliente ' || CAST(fp.id_cliente AS INTEGER)) AS nome_cliente,
          fp.id_assessor                                                      AS id_assessor,
          COALESCE(a.nome_assessor, fp.id_assessor)                           AS nome_assessor,
          fp.segmento_conta                                                   AS segmento_conta,
          fp.status_conta                                                     AS status_conta,
          fp.status_fp                                                        AS status_fp,
          fp.completude                                                       AS completude,
          fp.data_criacao_fp                                                  AS data_criacao_fp,
          fp.ultima_atualizacao                                               AS ultima_atualizacao
        FROM financial_planning fp
        LEFT JOIN base_clientes bc ON bc.id_cliente = CAST(fp.id_cliente AS INTEGER)
        LEFT JOIN assessores a ON a.id_assessor = fp.id_assessor
        WHERE 1=1${wf}
        ORDER BY fp.completude DESC, fp.ultima_atualizacao DESC
      `)
      .all<{
        id_cliente: number
        nome_cliente: string
        id_assessor: string
        nome_assessor: string | null
        segmento_conta: string | null
        status_conta: string | null
        status_fp: string | null
        completude: number | null
        data_criacao_fp: string | null
        ultima_atualizacao: string | null
      }>(),
  ])

  // Ordena clusters em ordem canônica de tier (Private > PF 300K+ > PJ > PF 300K- > outros)
  const TIER_ORDER: Record<string, number> = {
    Private: 1,
    'PF 300K+': 2,
    PJ: 3,
    'PF 300K-': 4,
  }
  const clustersGeq70 = (clustersRows.results ?? [])
    .map((r) => ({ segmento: r.segmento, n: r.n }))
    .sort((a, b) => (TIER_ORDER[a.segmento] ?? 99) - (TIER_ORDER[b.segmento] ?? 99))

  return c.json({
    data: {
      kpis: {
        total: kpisRow?.total ?? 0,
        iniciado: kpisRow?.iniciado ?? 0,
        geq70: kpisRow?.geq_70 ?? 0,
        completo: kpisRow?.completo ?? 0,
        assessoresAtivos: kpisRow?.assessores_ativos ?? 0,
        periodo: formatAnoMes(kpisRow?.periodo ?? null),
      },
      clustersGeq70,
      rows: (rows.results ?? []).map((r) => ({
        idCliente: r.id_cliente,
        nomeCliente: r.nome_cliente,
        idAssessor: r.id_assessor,
        nomeAssessor: r.nome_assessor,
        segmentoConta: r.segmento_conta,
        statusConta: r.status_conta,
        statusFp: r.status_fp,
        completude: r.completude,
        dataCriacaoFp: r.data_criacao_fp,
        ultimaAtualizacao: r.ultima_atualizacao,
      })),
    },
  })
})

export default app
