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
import qualidadeRouter from './routes/qualidade'
import authRouter from './routes/auth'
import npsRouter from './routes/nps'
import missoesRouter from './routes/missoes'
import rupturaRouter from './routes/ruptura'
import financialPlanningRouter from './routes/financial-planning'
import saudeClienteRouter from './routes/saude-cliente'
import { fetchAllNews } from './lib/rss'
import { fetchAllTickers } from './lib/ticker'
import { snapshotReceita } from './lib/snapshot-receita'

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
app.route('/qualidade', qualidadeRouter)
app.route('/auth', authRouter)
app.route('/nps', npsRouter)
app.route('/missoes', missoesRouter)
app.route('/ruptura', rupturaRouter)
app.route('/financial-planning', financialPlanningRouter)
app.route('/saude-cliente', saudeClienteRouter)

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
// Implementação em ./lib/snapshot-receita (reaproveitada pelo handler admin).
// ---------------------------------------------------------------------------

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (event.cron === '0 21 * * 1-5') {
      ctx.waitUntil(
        snapshotReceita(env).then((r) =>
          console.log(`[cron-snapshot] ${r.equipes.length} equipes gravadas para ${r.dataD2}`),
        ),
      )
    } else {
      ctx.waitUntil(handleScheduled(env))
    }
  },
}
