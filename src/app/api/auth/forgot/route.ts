import { apiFetch } from '@/lib/api/fetch'
import { resetPasswordEmail, sendEmail } from '@/lib/email'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const forgotSchema = z.object({
  identifier: z.string().min(1).max(128).trim().toLowerCase(),
})

// Rate limiting simples em memória — 5 pedidos por IP a cada 15 min
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
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const parsed = forgotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    )
  }

  const { identifier } = parsed.data

  try {
    const workerRes = await apiFetch('/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    })

    if (workerRes.ok) {
      const data = (await workerRes.json()) as {
        ok: boolean
        user?: { email: string; name: string } | null
        token?: string
        expiresAt?: string
      }

      if (data.user && data.token) {
        const origin =
          req.headers.get('origin') ??
          `${req.nextUrl.protocol}//${req.headers.get('host') ?? req.nextUrl.host}`
        const resetUrl = `${origin}/nova-senha?token=${encodeURIComponent(data.token)}`

        const { subject, html } = resetPasswordEmail({
          userName: data.user.name,
          resetUrl,
        })
        await sendEmail({ to: data.user.email, subject, html })
      }
    } else {
      console.error('[forgot] worker retornou', workerRes.status)
    }
  } catch (err) {
    console.error('[forgot] falha', err)
  }

  // Sempre 200 — anti user enumeration
  return NextResponse.json({ ok: true })
}
