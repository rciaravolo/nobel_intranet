import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ativo = req.nextUrl.searchParams.get('ativo')
  const tipo  = req.nextUrl.searchParams.get('tipo') ?? 'rf'
  if (!ativo) return NextResponse.json({ error: 'ativo obrigatório' }, { status: 400 })

  const res = await apiFetch(
    `/performance/carteiras/drill/export?ativo=${encodeURIComponent(ativo)}&tipo=${tipo}`,
    { headers: authHeaders(session) },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
