import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categoria = req.nextUrl.searchParams.get('categoria') ?? ''
  if (!categoria) return NextResponse.json({ error: 'categoria obrigatória' }, { status: 400 })

  const res = await apiFetch(
    `/performance/pj1/drill?categoria=${encodeURIComponent(categoria)}`,
    { cache: 'no-store', headers: authHeaders(session) },
  )
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
