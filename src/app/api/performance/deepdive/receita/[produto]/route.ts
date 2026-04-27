import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ produto: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { produto } = await params

  const PRODUTOS_VALIDOS = new Set([
    'rv', 'rf', 'coe', 'cambio', 'feefixo',
    'seguros', 'consorcio', 'dominion', 'oferta_fundos',
  ])
  if (!PRODUTOS_VALIDOS.has(produto)) {
    return NextResponse.json({ error: 'produto inválido' }, { status: 400 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

  const res = await fetch(
    `${apiUrl}/performance/deepdive/receita/${encodeURIComponent(produto)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
