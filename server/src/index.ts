import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env, Variables } from './types'
import comunicadosRouter from './routes/comunicados'
import noticiasRouter, { KV_KEY } from './routes/noticias'
import { fetchAllNews } from './lib/rss'

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
// ---------------------------------------------------------------------------
async function handleScheduled(env: Env): Promise<void> {
  console.log('[cron] Iniciando atualização de notícias...')
  try {
    const payload = await fetchAllNews()
    await env.NOTICIAS_KV.put(KV_KEY, JSON.stringify(payload), {
      // TTL de 28h: garante que sempre há dados mesmo se o cron falhar 1 dia
      expirationTtl: 60 * 60 * 28,
    })
    console.log(`[cron] ${payload.noticias.length} notícias salvas em ${payload.atualizadoEm}`)
  } catch (err) {
    console.error('[cron] Falha ao atualizar notícias:', err)
  }
}

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env))
  },
}
