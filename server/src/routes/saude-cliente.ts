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

/* ── GET /saude-cliente ────────────────────────────────────────────────────
   KPIs (faixas de saúde) + distribuição por modelo + linhas por cliente.
   Filtro por role via resolveFilterFromCtx. Ordem padrão: piores primeiro.
──────────────────────────────────────────────────────────────────────────── */
app.get('/', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wf = buildAndFilter(filter, 'sc.id_assessor')

  const [kpisRow, byModelRows, rows] = await Promise.all([
    db
      .prepare(`
        SELECT
          COUNT(*)                                                              AS total,
          SUM(CASE WHEN sc.indice_saude >= 70 THEN 1 ELSE 0 END)                AS boa,
          SUM(CASE WHEN sc.indice_saude >= 40 AND sc.indice_saude < 70 THEN 1 ELSE 0 END) AS media,
          SUM(CASE WHEN sc.indice_saude < 40 THEN 1 ELSE 0 END)                 AS baixa,
          ROUND(AVG(sc.indice_saude), 1)                                        AS indice_medio,
          MAX(sc.ano_mes)                                                       AS periodo
        FROM saude_cliente sc
        WHERE 1=1${wf}
      `)
      .first<{
        total: number | null
        boa: number | null
        media: number | null
        baixa: number | null
        indice_medio: number | null
        periodo: string | null
      }>(),
    db
      .prepare(`
        SELECT
          COALESCE(sc.modelo, 'Sem modelo') AS modelo,
          SUM(CASE WHEN sc.indice_saude >= 70 THEN 1 ELSE 0 END) AS boa,
          SUM(CASE WHEN sc.indice_saude >= 40 AND sc.indice_saude < 70 THEN 1 ELSE 0 END) AS media,
          SUM(CASE WHEN sc.indice_saude < 40 THEN 1 ELSE 0 END)  AS baixa,
          COUNT(*)                                                AS total
        FROM saude_cliente sc
        WHERE 1=1${wf}
        GROUP BY sc.modelo
      `)
      .all<{ modelo: string; boa: number; media: number; baixa: number; total: number }>(),
    db
      .prepare(`
        SELECT
          sc.id_cliente                                                AS id_cliente,
          COALESCE(bc.nome_cliente, 'Cliente ' || sc.id_cliente)       AS nome_cliente,
          sc.id_assessor                                               AS id_assessor,
          COALESCE(a.nome_assessor, sc.nome_assessor)                  AS nome_assessor,
          sc.modelo                                                    AS modelo,
          sc.auc                                                       AS auc,
          sc.indice_saude                                              AS indice_saude,
          sc.pont_aportes                                              AS pont_aportes,
          sc.pont_rentabilidade                                        AS pont_rentabilidade,
          sc.pont_cross_sell                                           AS pont_cross_sell,
          sc.qtde_meses_aporte_u12m                                    AS qtde_meses_aporte_u12m,
          sc.qtde_cross_sell                                           AS qtde_cross_sell
        FROM saude_cliente sc
        LEFT JOIN base_clientes bc ON bc.id_cliente = sc.id_cliente
        LEFT JOIN assessores a ON a.id_assessor = sc.id_assessor
        WHERE 1=1${wf}
        ORDER BY sc.indice_saude ASC, sc.auc DESC
      `)
      .all<{
        id_cliente: number
        nome_cliente: string
        id_assessor: string
        nome_assessor: string | null
        modelo: string | null
        auc: number | null
        indice_saude: number | null
        pont_aportes: number | null
        pont_rentabilidade: number | null
        pont_cross_sell: number | null
        qtde_meses_aporte_u12m: number | null
        qtde_cross_sell: number | null
      }>(),
  ])

  // Ordena modelos com FEE primeiro (destaque, geralmente melhor)
  const MODELO_ORDER: Record<string, number> = { 'FEE BASED': 1, 'COMISSION BASED': 2 }
  const byModel = (byModelRows.results ?? [])
    .map((r) => ({
      modelo: r.modelo,
      boa: r.boa,
      media: r.media,
      baixa: r.baixa,
      total: r.total,
    }))
    .sort((a, b) => (MODELO_ORDER[a.modelo] ?? 99) - (MODELO_ORDER[b.modelo] ?? 99))

  return c.json({
    data: {
      kpis: {
        total: kpisRow?.total ?? 0,
        boa: kpisRow?.boa ?? 0,
        media: kpisRow?.media ?? 0,
        baixa: kpisRow?.baixa ?? 0,
        indiceMedio: kpisRow?.indice_medio ?? null,
        periodo: formatAnoMes(kpisRow?.periodo ?? null),
      },
      byModel,
      rows: (rows.results ?? []).map((r) => ({
        idCliente: r.id_cliente,
        nomeCliente: r.nome_cliente,
        idAssessor: r.id_assessor,
        nomeAssessor: r.nome_assessor,
        modelo: r.modelo,
        auc: r.auc,
        indiceSaude: r.indice_saude,
        pontAportes: r.pont_aportes,
        pontRentabilidade: r.pont_rentabilidade,
        pontCrossSell: r.pont_cross_sell,
        qtdeMesesAporteU12m: r.qtde_meses_aporte_u12m,
        qtdeCrossSell: r.qtde_cross_sell,
      })),
    },
  })
})

export default app
