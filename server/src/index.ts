import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env, Variables } from './types'
import comunicadosRouter from './routes/comunicados'
import noticiasRouter, { KV_KEY as NOTICIAS_KV_KEY } from './routes/noticias'
import tickerRouter, { TICKER_KV_KEY } from './routes/ticker'
import performanceRouter from './routes/performance'
import pnlRouter from './routes/pnl'
import adminRouter from './routes/admin'
import { fetchAllNews } from './lib/rss'
import { fetchAllTickers } from './lib/ticker'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// ---------------------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------------------
app.use('*', logger())

app.use(
  '*',
  cors({
    origin: ['https://intra.nobelcapital.com.br', 'http://localhost:3000', 'http://localhost:3001'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cf-Access-Jwt-Assertion'],
    maxAge: 86400,
  }),
)

// ---------------------------------------------------------------------------
// Health check (público — sem auth)
// ---------------------------------------------------------------------------
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ---------------------------------------------------------------------------
// Rotas da API
// ---------------------------------------------------------------------------
app.route('/comunicados', comunicadosRouter)
app.route('/noticias', noticiasRouter)
app.route('/ticker', tickerRouter)
app.route('/performance', performanceRouter)
app.route('/pnl', pnlRouter)
app.route('/admin', adminRouter)

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------
app.notFound((c) => c.json({ error: 'Rota não encontrada' }, 404))

// ---------------------------------------------------------------------------
// Error handler global
// ---------------------------------------------------------------------------
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Erro interno no servidor' }, 500)
})

// ---------------------------------------------------------------------------
// Cron 1 — "30 9 * * 1-5" (06h30 BRT): atualiza notícias e ticker
// ---------------------------------------------------------------------------
async function handleScheduled(env: Env): Promise<void> {
  console.log('[cron] Iniciando atualização matinal...')

  const [noticiasResult, tickerResult] = await Promise.allSettled([
    fetchAllNews().then((payload) =>
      env.NOTICIAS_KV.put(NOTICIAS_KV_KEY, JSON.stringify(payload), {
        expirationTtl: 60 * 60 * 28,
      }).then(() => payload),
    ),
    fetchAllTickers().then((payload) =>
      env.NOTICIAS_KV.put(TICKER_KV_KEY, JSON.stringify(payload), {
        expirationTtl: 60 * 60 * 28,
      }).then(() => payload),
    ),
  ])

  if (noticiasResult.status === 'fulfilled') {
    console.log(`[cron] ${noticiasResult.value.noticias.length} notícias salvas`)
  } else {
    console.error('[cron] Falha nas notícias:', noticiasResult.reason)
  }

  if (tickerResult.status === 'fulfilled') {
    console.log(`[cron] ${tickerResult.value.tickers.length} tickers salvos`)
  } else {
    console.error('[cron] Falha no ticker:', tickerResult.reason)
  }
}

// ---------------------------------------------------------------------------
// Cron 2 — "0 21 * * 1-5" (18h BRT): snapshot diário de receita por equipe
// Lê as 13 tabelas receita_* e grava um registro em receita_snapshot.
// Idempotente: re-rodar no mesmo dia sobrescreve (INSERT OR REPLACE).
// ---------------------------------------------------------------------------
const RECEITA_TABELAS = [
  'receita_rv', 'receita_rf', 'receita_coe', 'receita_cambio',
  'receita_feefixo', 'receita_seguros', 'receita_consorcio', 'receita_dominion',
  'receita_oferta_fundos', 'receita_parceiros', 'receita_precas',
  'receita_fundos', 'receita_prev',
] as const

async function snapshotReceita(env: Env): Promise<void> {
  console.log('[cron-snapshot] Iniciando snapshot de receita...')

  const db = env.PERF_DB
  const brt = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const dataHoje = [
    brt.getUTCFullYear(),
    String(brt.getUTCMonth() + 1).padStart(2, '0'),
    String(brt.getUTCDate()).padStart(2, '0'),
  ].join('-')

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS receita_snapshot (
      equipe        TEXT NOT NULL,
      data          TEXT NOT NULL,
      receita_total REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (equipe, data)
    )
  `).run()

  const unionSQL = RECEITA_TABELAS
    .map((t) => `SELECT id_assessor, receita FROM ${t}`)
    .join(' UNION ALL ')

  const rows = await db.prepare(`
    SELECT a.equipe, COALESCE(SUM(r.receita), 0) AS receita_total
    FROM   (${unionSQL}) r
    JOIN   assessores a ON r.id_assessor = a.id_assessor
    WHERE  a.equipe IN ('SMART', 'PRIVATE', 'RIO PRETO', 'BRAVO')
    GROUP  BY a.equipe
  `).all<{ equipe: string; receita_total: number }>()

  if (rows.results.length === 0) {
    console.log('[cron-snapshot] Sem dados de receita — snapshot ignorado')
    return
  }

  await db.batch(
    rows.results.map((r) =>
      db
        .prepare(`INSERT OR REPLACE INTO receita_snapshot (equipe, data, receita_total) VALUES (?, ?, ?)`)
        .bind(r.equipe, dataHoje, r.receita_total),
    ),
  )

  console.log(`[cron-snapshot] ${rows.results.length} equipes gravadas para ${dataHoje}`)
}

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (event.cron === '0 21 * * 1-5') {
      ctx.waitUntil(snapshotReceita(env))
    } else {
      ctx.waitUntil(handleScheduled(env))
    }
  },
}
