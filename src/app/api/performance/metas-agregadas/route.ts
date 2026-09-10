import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const filterType = sp.get('filter_type')
  const filterValue = sp.get('filter_value')

  const res = await apiFetch(`/performance/metas-agregadas`, {
    cache: 'no-store',
    headers: authHeaders(session, {
      ...(filterType ? { 'X-Filter-Type': filterType } : {}),
      ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
    }),
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
