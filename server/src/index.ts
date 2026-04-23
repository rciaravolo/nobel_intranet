import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env, Variables } from './types'
import comunicadosRouter from './routes/comunicados'

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

export default app
