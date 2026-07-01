import { Hono } from 'hono'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatMesReferencia(anoMes: string): string {
  const s = anoMes.replace('.0', '')
  if (s.length !== 6) return anoMes
  const y = s.slice(0, 4)
  const m = parseInt(s.slice(4, 6))
  return `${MESES[m - 1]}/${y}`
}

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

/* ── GET /qualidade/kpis ──────────────────────────────────────────────────── */
app.get('/kpis', async (c) => {
  const db = c.env.PERF_DB

  const [latestMesRow, npsRow] = await Promise.all([
    db
      .prepare(`SELECT MAX(ano_mes) as mes FROM modelo_servir WHERE id_assessor IS NOT NULL`)
      .first<{ mes: string | null }>(),
    db
      .prepare(`
        SELECT
          SUM(CASE WHEN email_sent     = 'Sim' THEN 1 ELSE 0 END) AS envios,
          SUM(CASE WHEN survey_finished = 'Sim' THEN 1 ELSE 0 END) AS respostas,
          ROUND(AVG(CASE WHEN survey_finished = 'Sim' AND nps_assessor > 0 THEN nps_assessor END), 1) AS nps_assessor_medio,
          ROUND(
            100.0 * SUM(CASE WHEN survey_finished = 'Sim' THEN 1 ELSE 0 END) /
            NULLIF(SUM(CASE WHEN email_sent = 'Sim' THEN 1 ELSE 0 END), 0),
          1) AS taxa_resposta
        FROM nps_envios
      `)
      .first<{
        envios: number
        respostas: number
        nps_assessor_medio: number | null
        taxa_resposta: number | null
      }>(),
  ])

  const latestMes = latestMesRow?.mes ?? null
  let indiceModeloServir: number | null = null
  let mesReferencia: string | null = null

  if (latestMes) {
    const mdsRow = await db
      .prepare(`
        SELECT ROUND(AVG(indice_modelo_servir), 2) AS indice
        FROM modelo_servir
        WHERE id_assessor IS NOT NULL AND ano_mes = ?
      `)
      .bind(latestMes)
      .first<{ indice: number | null }>()
    indiceModeloServir = mdsRow?.indice ?? null
    mesReferencia = formatMesReferencia(latestMes)
  }

  return c.json({
    data: {
      indiceModeloServir,
      mesReferencia,
      npsEnvios:    npsRow?.envios            ?? 0,
      npsRespostas: npsRow?.respostas          ?? 0,
      npsAssessor:  npsRow?.nps_assessor_medio ?? null,
      taxaResposta: npsRow?.taxa_resposta       ?? null,
    },
  })
})

export default app
