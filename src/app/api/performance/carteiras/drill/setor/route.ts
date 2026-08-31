import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { setor?: string }
  const setor = body.setor?.trim()
  if (!setor) return NextResponse.json({ error: 'setor obrigatório' }, { status: 400 })

  const filterType = req.nextUrl.searchParams.get('filter_type')
  const filterValue = req.nextUrl.searchParams.get('filter_value')

  // POST body avoids Cloudflare URL decode que trunca '&' em query strings.
  // Passa setor via JSON body para o Hono handler.
  const res = await apiFetch('/performance/carteiras/drill/setor', {
    method: 'POST',
    headers: authHeaders(session, {
      'Content-Type': 'application/json',
      ...(filterType ? { 'X-Filter-Type': filterType } : {}),
      ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
    }),
    body: JSON.stringify({ setor }),
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
