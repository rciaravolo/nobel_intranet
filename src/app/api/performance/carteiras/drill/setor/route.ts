import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { setor?: string }
  const setor = body.setor?.trim()
  if (!setor) return NextResponse.json({ error: 'setor obrigatório' }, { status: 400 })

  // POST body avoids Cloudflare URL decode que trunca '&' em query strings.
  // Passa setor via JSON body para o Hono handler.
  const res = await apiFetch(
    '/performance/carteiras/drill/setor',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email':  session.email,
        'X-User-Role':   session.role,
        'X-User-Equipe': session.equipe ?? '',
      },
      body: JSON.stringify({ setor }),
    },
  )

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
