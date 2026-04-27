import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPassword } from '@/lib/auth/password'
import { setSession } from '@/lib/auth/session'
import { findUserByUsername } from '@/lib/auth/users'

const loginSchema = z.object({
  username: z.string().min(1).max(64).trim().toLowerCase(),
  password: z.string().min(1).max(128),
})

// Rate limiting simples em memória
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX = 5
const WINDOW = 15 * 60 * 1000

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW })
    return true
  }
  if (rec.count >= MAX) return false
  rec.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 15 minutos.' },
      { status: 429 },
    )
  }

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
  const user = findUserByUsername(username)

  // Sempre verificar hash (evita timing attack / user enumeration)
  const dummyHash =
    '704fcea865f0c2eb89f925cadd2fa8a74b0fa5cd1170ea377849e8c53b18a842f643f65db22f7f4c14621834a6909addc4a8a18d97bcb151e209cc7ae015224d.a7f3d2e1c4b5a6f7d8e9c0b1a2f3d4e5'
  const isValid = verifyPassword(password, user?.passwordHash ?? dummyHash)

  if (!user || !isValid) {
    return NextResponse.json({ error: 'Username ou senha incorretos' }, { status: 401 })
  }

  await setSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
  })

  return NextResponse.json({
    ok: true,
    redirect: '/dashboard',
    user: { username: user.username, name: user.name, role: user.role },
  })
}
