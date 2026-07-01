import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const janela = req.nextUrl.searchParams.get('janela')
  if (!janela) return NextResponse.json({ error: 'janela obrigatória' }, { status: 400 })

  const res = await apiFetch(
    `/performance/carteiras/drill/janela?janela=${encodeURIComponent(janela)}`,
    { headers: authHeaders(session) },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
