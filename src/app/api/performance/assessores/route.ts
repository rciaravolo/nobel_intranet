import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin' && session.role !== 'master') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  const res = await fetch(`${apiUrl}/performance/assessores`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${secret}`,
      'X-User-Role': session.role,
      'X-User-Email': session.email,
    },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
