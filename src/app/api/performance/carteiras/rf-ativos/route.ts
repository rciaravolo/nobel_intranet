import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await apiFetch('/performance/carteiras/rf/ativos', {
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
      'X-User-Equipe': session.equipe ?? '',
    },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
