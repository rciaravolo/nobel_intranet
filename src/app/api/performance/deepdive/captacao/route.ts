import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  const sp          = req.nextUrl.searchParams
  const filterType  = sp.get('filter_type')
  const filterValue = sp.get('filter_value')

  const res = await fetch(`${apiUrl}/performance/deepdive/captacao`, {
    cache: 'no-store',
    headers: {
      Authorization:    `Bearer ${secret}`,
      'X-User-Email':   session.email,
      'X-User-Role':    session.role,
      'X-User-Equipe':  session.equipe ?? '',
      ...(filterType  ? { 'X-Filter-Type':  filterType  } : {}),
      ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
    },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
