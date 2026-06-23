import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const setor = req.nextUrl.searchParams.get('setor')
  if (!setor) return NextResponse.json({ error: 'setor obrigatório' }, { status: 400 })

  // Passa setor via header para evitar que '&' no nome seja tratado como separador
  // de query string pelo Cloudflare Service Binding (bug de decode duplo de %26).
  const res = await apiFetch(
    '/performance/carteiras/drill/setor',
    {
      headers: {
        'X-User-Email':  session.email,
        'X-User-Role':   session.role,
        'X-User-Equipe': session.equipe ?? '',
        'X-Setor':       setor,
      },
    },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
