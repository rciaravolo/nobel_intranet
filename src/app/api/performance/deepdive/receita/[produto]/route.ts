import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ produto: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { produto } = await params

  const PRODUTOS_VALIDOS = new Set([
    'rv',
    'rf',
    'coe',
    'cambio',
    'feefixo',
    'seguros',
    'consorcio',
    'dominion',
    'oferta_fundos',
  ])
  if (!PRODUTOS_VALIDOS.has(produto)) {
    return NextResponse.json({ error: 'produto inválido' }, { status: 400 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  const sp = req.nextUrl.searchParams
  const filterType = sp.get('filter_type')
  const filterValue = sp.get('filter_value')

  const res = await fetch(`${apiUrl}/performance/deepdive/receita/${encodeURIComponent(produto)}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${secret}`,
      'X-User-Email': session.email,
      'X-User-Role': session.role,
      'X-User-Equipe': session.equipe ?? '',
      ...(filterType ? { 'X-Filter-Type': filterType } : {}),
      ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
    },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
