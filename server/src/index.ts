import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env, Variables } from './types'
import comunicadosRouter from './routes/comunicados'
import noticiasRouter, { KV_KEY as NOTICIAS_KV_KEY } from './routes/noticias'
import tickerRouter, { TICKER_KV_KEY } from './routes/ticker'
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
    origin: ['https://intra.nobelcapital.com.br', 'http://localhost:3000'],
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
// Scheduled handler — cron: "30 9 * * 1-5" (06h30 BRT, seg–sex)
// Atualiza notícias e ticker em paralelo
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

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env))
  },
}
