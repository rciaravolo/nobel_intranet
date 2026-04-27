import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  const res = await fetch(`${apiUrl}/performance/metas`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      'X-User-Email': session.email,
      'X-User-Role':  session.role,
    },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
