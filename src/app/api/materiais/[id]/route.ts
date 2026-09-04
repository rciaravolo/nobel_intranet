import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

const WRITE_ROLES = new Set(['admin', 'master'])

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!WRITE_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await ctx.params
  const body = await request.text()

  const res = await apiFetch(`/materiais/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Email': session.email,
      'X-User-Role': session.role,
    },
    body,
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!WRITE_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await ctx.params

  const res = await apiFetch(`/materiais/${id}`, {
    method: 'DELETE',
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
    },
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
