/**
 * Gerenciamento de sessão via JWT assinado com HMAC-SHA256.
 * Usa apenas APIs nativas do Node.js — zero dependências.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'intra_session'
const SECRET = process.env.JWT_SECRET ?? 'dev-secret-nobel-intra-2026-change-in-prod'
const SESSION_DURATION_S = 60 * 60 * 8 // 8 horas

export interface SessionPayload {
  userId: string
  username: string
  name: string
  role: 'admin' | 'master' | 'lider' | 'assessor'
  equipe?: string
  email: string
  exp: number
}

// ── JWT manual (sem dependências) ─────────────────────────────

function b64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64url')
}

function parseB64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function createToken(payload: Omit<SessionPayload, 'exp'>): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_S }),
  )
  const sig = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, body, sig] = parts as [string, string, string]
    const expected = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')

    // Comparação segura contra timing attacks
    if (!timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) {
      return null
    }

    const payload = JSON.parse(parseB64url(body)) as SessionPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

// ── Helpers de cookie ─────────────────────────────────────────

export async function setSession(payload: Omit<SessionPayload, 'exp'>) {
  const token = createToken(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_S,
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}
