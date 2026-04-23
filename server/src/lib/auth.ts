import type { Context, Next } from 'hono'
import type { Env, Variables } from '../types'

export type CFUser = {
  email: string
  name: string
}

// TODO: validar assinatura JWT em produção
// Em produção, buscar as chaves públicas do Cloudflare Access em:
// https://<team-domain>/cdn-cgi/access/certs
// e verificar a assinatura usando Web Crypto API antes de confiar no payload.
export async function cfAccessAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
) {
  const jwt = c.req.header('Cf-Access-Jwt-Assertion')
  if (!jwt) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const user = parseCFJwt(jwt)
    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Forbidden' }, 403)
  }
}

function parseCFJwt(jwt: string): CFUser {
  // Cloudflare Access JWT: header.payload.signature (base64url)
  const parts = jwt.split('.')
  if (parts.length !== 3 || !parts[1]) throw new Error('Invalid JWT')

  const paddedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = paddedPayload + '='.repeat((4 - (paddedPayload.length % 4)) % 4)
  const payload = JSON.parse(atob(padded)) as Record<string, unknown>

  if (!payload['email'] || typeof payload['email'] !== 'string') {
    throw new Error('No email in JWT')
  }

  return {
    email: payload['email'],
    name: typeof payload['name'] === 'string' ? payload['name'] : payload['email'],
  }
}
