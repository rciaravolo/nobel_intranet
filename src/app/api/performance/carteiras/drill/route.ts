import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ativo = req.nextUrl.searchParams.get('ativo')
  if (!ativo) return NextResponse.json({ error: 'ativo obrigatório' }, { status: 400 })

  const res = await apiFetch(
    `/performance/carteiras/drill?ativo=${encodeURIComponent(ativo)}`,
    {
      headers: {
        'X-User-Email': session.email,
        'X-User-Role': session.role,
        'X-User-Equipe': session.equipe ?? '',
      },
    },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
