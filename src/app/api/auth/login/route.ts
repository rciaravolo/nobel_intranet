import { compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession, sessionCookieOptions } from '@/lib/auth/session'
import { findUserByUsername } from '@/lib/auth/users'

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username obrigatório')
    .max(64)
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Senha obrigatória').max(128),
})

// Rate limiting simples em memória (substituir por KV em produção)
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 min

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count }
}

function resetRateLimit(ip: string) {
  attempts.delete(ip)
}

export async function POST(req: NextRequest) {
  // Rate limiting por IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rate = checkRateLimit(ip)

  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
      {
        status: 429,
        headers: { 'Retry-After': '900' },
      },
    )
  }

  // Validar body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    )
  }

  const { username, password } = parsed.data

  // Buscar usuário — timing consistente para evitar user enumeration
  const user = findUserByUsername(username)
  const dummyHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LQv3c1yqBWVHxkd0L'
  const hashToCompare = user?.passwordHash ?? dummyHash

  // Sempre comparar (evita timing attack mesmo quando user não existe)
  const passwordMatch = await compare(password, hashToCompare)

  if (!user || !passwordMatch) {
    return NextResponse.json(
      { error: 'Username ou senha incorretos' },
      { status: 401 },
    )
  }

  // Credenciais corretas — limpar rate limit e criar sessão
  resetRateLimit(ip)

  const token = await createSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })

  const cookieStore = await cookies()
  cookieStore.set(sessionCookieOptions(token))

  return NextResponse.json({
    ok: true,
    user: {
      username: user.username,
      name: user.name,
      role: user.role,
    },
  })
}
