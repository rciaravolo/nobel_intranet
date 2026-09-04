import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

const WRITE_ROLES = new Set(['admin', 'master'])

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await apiFetch('/materiais', {
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
    },
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!WRITE_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  // Reconstrói FormData para o upstream (o boundary será regerado pelo fetch)
  const upstream = new FormData()
  for (const [key, value] of form.entries()) {
    upstream.append(key, value)
  }

  const res = await apiFetch('/materiais', {
    method: 'POST',
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
    },
    body: upstream,
  })
  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
