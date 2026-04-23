import type { CFUser } from './lib/auth'

export type Env = {
  DB: D1Database
  CF_ACCESS_AUD: string
  CF_ACCESS_TEAM_DOMAIN: string
}

// Hono context variables (set by middleware)
export type Variables = {
  user: CFUser
}
