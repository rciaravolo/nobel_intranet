import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const res = await apiFetch(`/materiais/${id}/download`, {
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
    },
  })

  if (!res.ok) {
    const errBody = await res.text()
    return new Response(errBody, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Repassa headers relevantes (Content-Type, Content-Length, Content-Disposition)
  const headers = new Headers()
  const passthrough = ['content-type', 'content-length', 'content-disposition', 'cache-control']
  for (const h of passthrough) {
    const v = res.headers.get(h)
    if (v) headers.set(h, v)
  }

  return new Response(res.body, { status: res.status, headers })
}
