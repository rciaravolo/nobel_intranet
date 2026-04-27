import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  const res = await fetch(`${apiUrl}/performance/carteiras/cliente?id=${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
