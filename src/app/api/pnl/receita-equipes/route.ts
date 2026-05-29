import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.role !== 'admin' && session.role !== 'master') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const headers: Record<string, string> = {
    'X-User-Role': session.role,
    'X-User-Email': session.email,
  }
  if (session.equipe) headers['X-User-Equipe'] = session.equipe

  const res = await apiFetch('/pnl/receita-equipes', { cache: 'no-store', headers })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
