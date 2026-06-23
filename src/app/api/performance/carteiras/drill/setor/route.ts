import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const setor = req.nextUrl.searchParams.get('setor')
  if (!setor) return NextResponse.json({ error: 'setor obrigatório' }, { status: 400 })

  // '&' no Service Binding Cloudflare é truncado como separador mesmo em headers.
  // Fix: envia setor em base64 via X-Setor-B64 para garantir transmissão segura.
  const setorB64 = Buffer.from(setor, 'utf-8').toString('base64')
  const res = await apiFetch(
    '/performance/carteiras/drill/setor',
    {
      headers: {
        'X-User-Email':  session.email,
        'X-User-Role':   session.role,
        'X-User-Equipe': session.equipe ?? '',
        'X-Setor-B64':   setorB64,
      },
    },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
