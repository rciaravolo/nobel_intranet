import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import type { NoticiasPayload } from '../lib/rss'
import { fetchAllNews } from '../lib/rss'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const KV_KEY = 'noticias:latest'
const REFRESH_SECRET = 'nobel-refresh-2026'

// ---------------------------------------------------------------------------
// GET /noticias — retorna o cache do KV (sem auth: chamado pelo Next.js SSR)
// ---------------------------------------------------------------------------
app.get('/', async (c) => {
  const cached = await c.env.NOTICIAS_KV.get(KV_KEY)

  if (!cached) {
    return c.json({ data: { noticias: [], atualizadoEm: null } })
  }

  const payload = JSON.parse(cached) as NoticiasPayload
  return c.json({ data: payload })
})

// ---------------------------------------------------------------------------
// POST /noticias/refresh?secret=... — disparo manual do cron (temporário)
// ---------------------------------------------------------------------------
app.post('/refresh', async (c) => {
  if (c.req.query('secret') !== REFRESH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const payload = await fetchAllNews()
  await c.env.NOTICIAS_KV.put(KV_KEY, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 28,
  })

  return c.json({ ok: true, total: payload.noticias.length, atualizadoEm: payload.atualizadoEm })
})

export default app
export { KV_KEY }
