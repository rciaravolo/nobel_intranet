import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ produto: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { produto } = await params

  const PRODUTOS_VALIDOS = new Set([
    'rv', 'rf', 'coe', 'cambio', 'feefixo',
    'seguros', 'consorcio', 'dominion', 'oferta_fundos',
    'fundos', 'previdencia', 'precas',
  ])
  if (!PRODUTOS_VALIDOS.has(produto)) {
    return NextResponse.json({ error: 'produto inválido' }, { status: 400 })
  }

  const sp = req.nextUrl.searchParams
  const filterType = sp.get('filter_type')
  const filterValue = sp.get('filter_value')

  const res = await apiFetch(`/performance/deepdive/receita/${encodeURIComponent(produto)}`, {
    cache: 'no-store',
    headers: authHeaders(session, {
      ...(filterType ? { 'X-Filter-Type': filterType } : {}),
      ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
    }),
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
