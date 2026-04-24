import { Hono } from 'hono'
import type { Env, Variables } from '../types'
import type { NoticiasPayload } from '../lib/rss'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

const KV_KEY = 'noticias:latest'

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

export default app
export { KV_KEY }
