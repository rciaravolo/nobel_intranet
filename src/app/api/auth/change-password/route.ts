import { apiFetch } from '@/lib/api/fetch'
import { getSession, setSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const isPasswordIssue = issue?.path?.[0] === 'newPassword'
    const msg = isPasswordIssue
      ? 'A nova senha precisa ter no mínimo 8 caracteres'
      : (issue?.message ?? 'Dados inválidos')
    return NextResponse.json({ error: msg }, { status: 422 })
  }

  try {
    const workerRes = await apiFetch('/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.userId,
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    })

    if (!workerRes.ok) {
      const data = (await workerRes.json().catch(() => ({}))) as { error?: string }
      return NextResponse.json(
        { error: data.error ?? 'Não foi possível trocar a senha' },
        { status: workerRes.status },
      )
    }

    // Reemite a sessão sem a flag mustChangePassword pra liberar navegação
    // no mesmo request-response (sem exigir novo login).
    const { exp: _exp, mustChangePassword: _mcp, ...rest } = session
    await setSession(rest)

    return NextResponse.json({ ok: true })
  } catch (_err) {
    return NextResponse.json({ error: 'Erro de conexão. Tente novamente.' }, { status: 500 })
  }
}
