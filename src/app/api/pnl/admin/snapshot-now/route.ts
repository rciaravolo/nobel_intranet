import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const res = await apiFetch('/pnl/admin/snapshot-now', {
    method: 'POST',
    cache: 'no-store',
    headers: { 'X-User-Role': session.role, 'X-User-Email': session.email },
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
