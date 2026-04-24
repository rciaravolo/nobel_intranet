import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import type { TickerPayload } from '../lib/ticker'
import { fetchAllTickers } from '../lib/ticker'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const KV_KEY = 'ticker:latest'
const REFRESH_SECRET = 'nobel-refresh-2026'

// ---------------------------------------------------------------------------
// GET /ticker — retorna cache do KV (sem auth: chamado pelo Next.js SSR)
// ---------------------------------------------------------------------------
app.get('/', async (c) => {
  const cached = await c.env.NOTICIAS_KV.get(KV_KEY)
  if (!cached) return c.json({ data: { tickers: [], atualizadoEm: null } })
  return c.json({ data: JSON.parse(cached) as TickerPayload })
})

// ---------------------------------------------------------------------------
// POST /ticker/refresh?secret=... — disparo manual (temporário)
// ---------------------------------------------------------------------------
app.post('/refresh', async (c) => {
  if (c.req.query('secret') !== REFRESH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const payload = await fetchAllTickers()
  await c.env.NOTICIAS_KV.put(KV_KEY, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 28,
  })
  return c.json({ ok: true, tickers: payload.tickers.length, atualizadoEm: payload.atualizadoEm })
})

export default app
export { KV_KEY as TICKER_KV_KEY }
