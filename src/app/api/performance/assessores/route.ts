import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin' && session.role !== 'master' && session.role !== 'lider_pj') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const res = await apiFetch(`/performance/assessores`, {
    cache: 'no-store',
    headers: authHeaders(session),
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
