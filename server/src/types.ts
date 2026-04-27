import type { CFUser } from './lib/auth'

export type Env = {
  DB: D1Database
  PERF_DB: D1Database
  NOTICIAS_KV: KVNamespace
  CF_ACCESS_AUD: string
  CF_ACCESS_TEAM_DOMAIN: string
  INTERNAL_API_SECRET: string
}

// Hono context variables (set by middleware)
export type Variables = {
  user: CFUser
}
