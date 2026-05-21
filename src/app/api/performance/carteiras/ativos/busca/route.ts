import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q') ?? ''

  const res = await apiFetch(
    `/performance/carteiras/ativos/busca?q=${encodeURIComponent(q)}`,
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
