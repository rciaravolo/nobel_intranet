import { apiFetch } from '@/lib/api/fetch'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const resetSchema = z.object({
  token: z.string().min(10).max(256),
  newPassword: z.string().min(8).max(128),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const isPasswordIssue = issue?.path?.[0] === 'newPassword'
    const msg = isPasswordIssue
      ? 'A senha precisa ter no mínimo 8 caracteres'
      : (issue?.message ?? 'Dados inválidos')
    return NextResponse.json({ error: msg }, { status: 422 })
  }

  try {
    const workerRes = await apiFetch('/auth/complete-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    if (!workerRes.ok) {
      const data = (await workerRes.json().catch(() => ({}))) as { error?: string }
      return NextResponse.json(
        { error: data.error ?? 'Não foi possível redefinir a senha' },
        { status: 400 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[reset] falha', err)
    return NextResponse.json({ error: 'Erro de conexão. Tente novamente.' }, { status: 500 })
  }
}
