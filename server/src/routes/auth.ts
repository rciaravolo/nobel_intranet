import { createHash, randomBytes } from 'node:crypto'
import { and, eq, isNull, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { createDb } from '../db/client'
import { passwordResetTokens, users } from '../db/schema'
import { hashPassword, verifyPassword } from '../lib/password'
import type { Env, Variables } from '../types'

const RESET_TOKEN_TTL_MIN = 30

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// ---------------------------------------------------------------------------
// Auth middleware — INTERNAL_API_SECRET Bearer token (mesmo padrão das outras rotas internas)
// ---------------------------------------------------------------------------
app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (auth !== `Bearer ${secret}`) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})

// ---------------------------------------------------------------------------
// POST /auth/verify
// Verifica username/senha contra a tabela `users` no D1.
// Retorna dados do usuário (sem hash) em caso de sucesso, 401 caso contrário.
// Body: { username: string, password: string }
// ---------------------------------------------------------------------------
// Hash dummy para evitar timing attack / user enumeration quando o username não existe
const DUMMY_HASH =
  '704fcea865f0c2eb89f925cadd2fa8a74b0fa5cd1170ea377849e8c53b18a842f643f65db22f7f4c14621834a6909addc4a8a18d97bcb151e209cc7ae015224d.a7f3d2e1c4b5a6f7d8e9c0b1a2f3d4e5'

app.post('/verify', async (c) => {
  let body: { username?: unknown; password?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Body inválido' }, 400)
  }

  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!username || !password) {
    return c.json({ error: 'Username e senha obrigatórios' }, 400)
  }

  const db = createDb(c.env.DB)
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1)
  const user = rows[0]

  // Sempre roda scrypt (mesmo se user inexistente) para não vazar existência via timing
  const isValid = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)

  if (!user || !user.ativo || !isValid) {
    return c.json({ error: 'Username ou senha incorretos' }, 401)
  }

  return c.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      equipe: user.equipe ?? undefined,
      idAssessor: user.idAssessor ?? undefined,
      department: user.department,
      avatarInitials: user.avatarInitials,
      mustChangePassword: user.mustChangePassword,
    },
  })
})

// ---------------------------------------------------------------------------
// POST /auth/change-password
// Body: { userId: string, currentPassword: string, newPassword: string }
// Valida senha atual, salva a nova, zera must_change_password.
// Usado tanto no fluxo de primeiro acesso quanto em troca voluntária.
// ---------------------------------------------------------------------------
app.post('/change-password', async (c) => {
  let body: { userId?: unknown; currentPassword?: unknown; newPassword?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Body inválido' }, 400)
  }

  const userId = typeof body.userId === 'string' ? body.userId : ''
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!userId || !currentPassword) {
    return c.json({ error: 'Dados inválidos' }, 400)
  }
  if (newPassword.length < 8) {
    return c.json({ error: 'A nova senha precisa ter no mínimo 8 caracteres' }, 400)
  }
  if (newPassword === currentPassword) {
    return c.json({ error: 'A nova senha precisa ser diferente da atual' }, 400)
  }

  const db = createDb(c.env.DB)
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const user = rows[0]

  // Sempre roda scrypt (mesmo se user inexistente) pra não vazar existência via timing
  const isValid = verifyPassword(currentPassword, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !user.ativo || !isValid) {
    return c.json({ error: 'Senha atual incorreta' }, 401)
  }

  const salt = randomBytes(16).toString('hex')
  const newHash = hashPassword(newPassword, salt)
  const nowIso = new Date().toISOString()

  await db
    .update(users)
    .set({
      passwordHash: newHash,
      mustChangePassword: false,
      atualizadoEm: nowIso,
    })
    .where(eq(users.id, userId))

  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// POST /auth/request-reset
// Body: { identifier: string }  (email ou username)
// Sempre retorna 200. Se o usuário existe, retorna também `token` (cru) e
// dados mínimos para o Next.js enviar o e-mail; se não existe, retorna user=null.
// ---------------------------------------------------------------------------
app.post('/request-reset', async (c) => {
  let body: { identifier?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Body inválido' }, 400)
  }

  const identifier =
    typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : ''

  if (!identifier) {
    return c.json({ error: 'Identificador obrigatório' }, 400)
  }

  const db = createDb(c.env.DB)
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .limit(1)
  const user = rows[0]

  if (!user || !user.ativo) {
    return c.json({ ok: true, user: null })
  }

  const tokenRaw = randomBytes(32).toString('base64url')
  const tokenHash = sha256Hex(tokenRaw)
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60_000).toISOString()

  await db.insert(passwordResetTokens).values({
    tokenHash,
    userId: user.id,
    expiresAt,
  })

  return c.json({
    ok: true,
    user: { email: user.email, name: user.name },
    token: tokenRaw,
    expiresAt,
  })
})

// ---------------------------------------------------------------------------
// POST /auth/complete-reset
// Body: { token: string, newPassword: string }
// Valida token (não usado, não expirado), gera novo hash e atualiza `users`.
// Marca `used_at` no token para uso único.
// ---------------------------------------------------------------------------
app.post('/complete-reset', async (c) => {
  let body: { token?: unknown; newPassword?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Body inválido' }, 400)
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!token || newPassword.length < 8) {
    return c.json({ error: 'Token ou senha inválidos' }, 400)
  }

  const tokenHash = sha256Hex(token)
  const nowIso = new Date().toISOString()

  const db = createDb(c.env.DB)
  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
    .limit(1)
  const record = rows[0]

  if (!record || record.expiresAt <= nowIso) {
    return c.json({ error: 'Token inválido ou expirado' }, 400)
  }

  const salt = randomBytes(16).toString('hex')
  const newHash = hashPassword(newPassword, salt)

  await db
    .update(users)
    .set({ passwordHash: newHash, atualizadoEm: nowIso })
    .where(eq(users.id, record.userId))

  await db
    .update(passwordResetTokens)
    .set({ usedAt: nowIso })
    .where(eq(passwordResetTokens.tokenHash, tokenHash))

  return c.json({ ok: true })
})

export default app
