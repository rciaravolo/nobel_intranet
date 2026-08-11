import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import { resolveFilterFromCtx, buildAndFilter } from '../lib/role-filter'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

/** Escapa um campo CSV: se contém vírgula, aspas ou newline, envolve em aspas
 *  e duplica aspas internas. */
function csvField(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// Auth: internal secret (Next.js SSR) OU Cf-Access-Jwt-Assertion (browser)
app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (auth === `Bearer ${secret}`) return next()
  if (c.req.header('Cf-Access-Jwt-Assertion')) return next()
  return c.json({ error: 'Unauthorized' }, 401)
})

/* ── GET /nps ──────────────────────────────────────────────────────────────
   KPIs + linhas da tabela em uma única round-trip.
   Base sempre no mês corrente (dado externo — sem filtro temporal).
──────────────────────────────────────────────────────────────────────────── */
app.get('/', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  // O filtro se aplica a ne.id_assessor (query usa alias `ne`)
  const wf = buildAndFilter(filter, 'ne.id_assessor')

  const [kpisRow, enviosRows] = await Promise.all([
    db
      .prepare(`
        SELECT
          SUM(CASE WHEN email_sent      = 'Sim' THEN 1 ELSE 0 END) AS envios,
          SUM(CASE WHEN email_opened    = 'Sim' THEN 1 ELSE 0 END) AS aberturas,
          SUM(CASE WHEN survey_finished = 'Sim' THEN 1 ELSE 0 END) AS respostas,
          ROUND(
            AVG(CASE WHEN survey_finished = 'Sim' AND nps_assessor > 0 THEN nps_assessor END),
            2
          ) AS media_nota
        FROM nps_envios ne
        WHERE 1=1${wf}
      `)
      .first<{
        envios: number | null
        aberturas: number | null
        respostas: number | null
        media_nota: number | null
      }>(),
    db
      .prepare(`
        SELECT
          ne.id_cliente                                          AS id_cliente,
          COALESCE(bc.nome_cliente, 'Cliente ' || ne.id_cliente) AS nome_cliente,
          bc.email_cliente                                       AS email_cliente,
          bc.telefone                                            AS telefone,
          bc.nome_assessor                                       AS nome_assessor,
          ne.record_date                                         AS record_date,
          ne.email_opened                                        AS email_opened,
          ne.survey_finished                                     AS survey_finished,
          CASE WHEN ne.survey_finished = 'Sim' AND ne.nps_assessor > 0
               THEN ne.nps_assessor
               ELSE NULL END                                     AS nota
        FROM nps_envios ne
        LEFT JOIN base_clientes bc ON bc.id_cliente = ne.id_cliente
        WHERE 1=1${wf}
        ORDER BY ne.record_date DESC
      `)
      .all<{
        id_cliente: number
        nome_cliente: string
        email_cliente: string | null
        telefone: string | null
        nome_assessor: string | null
        record_date: string
        email_opened: string | null
        survey_finished: string | null
        nota: number | null
      }>(),
  ])

  return c.json({
    data: {
      kpis: {
        envios: kpisRow?.envios ?? 0,
        aberturas: kpisRow?.aberturas ?? 0,
        respostas: kpisRow?.respostas ?? 0,
        mediaNota: kpisRow?.media_nota ?? null,
      },
      envios: (enviosRows.results ?? []).map((r) => ({
        idCliente: r.id_cliente,
        nomeCliente: r.nome_cliente,
        emailCliente: r.email_cliente,
        telefone: r.telefone,
        nomeAssessor: r.nome_assessor,
        recordDate: r.record_date,
        emailOpened: r.email_opened,
        surveyFinished: r.survey_finished,
        nota: r.nota,
      })),
    },
  })
})

/* ── GET /nps/pendentes.csv ────────────────────────────────────────────────
   CSV dos clientes que receberam email mas ainda não responderam.
   Respeita o filtro por role (assessor baixa só os pendentes dele).
──────────────────────────────────────────────────────────────────────────── */
app.get('/pendentes.csv', async (c) => {
  const db = c.env.PERF_DB

  const filter = await resolveFilterFromCtx(c)
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wf = buildAndFilter(filter, 'ne.id_assessor')

  const rows = await db
    .prepare(`
      SELECT
        COALESCE(bc.nome_cliente, 'Cliente ' || ne.id_cliente) AS nome_cliente,
        bc.email_cliente                                       AS email_cliente,
        bc.telefone                                            AS telefone,
        bc.nome_assessor                                       AS nome_assessor,
        ne.record_date                                         AS record_date
      FROM nps_envios ne
      LEFT JOIN base_clientes bc ON bc.id_cliente = ne.id_cliente
      WHERE ne.email_sent = 'Sim'
        AND (ne.survey_finished IS NULL OR ne.survey_finished != 'Sim')
        ${wf}
      ORDER BY ne.record_date DESC
    `)
    .all<{
      nome_cliente: string
      email_cliente: string | null
      telefone: string | null
      nome_assessor: string | null
      record_date: string
    }>()

  const header = 'nome_cliente,email_cliente,telefone,nome_assessor,record_date'
  const body = (rows.results ?? [])
    .map((r) =>
      [
        csvField(r.nome_cliente),
        csvField(r.email_cliente),
        csvField(r.telefone),
        csvField(r.nome_assessor),
        csvField(r.record_date),
      ].join(','),
    )
    .join('\n')

  const today = new Date().toISOString().slice(0, 10)
  const csv = `﻿${header}\n${body}\n`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="nps-pendentes-${today}.csv"`,
    },
  })
})

export default app
