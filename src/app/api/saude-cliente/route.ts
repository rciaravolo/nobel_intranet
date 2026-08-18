import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const filterType = url.searchParams.get('filter_type')
  const filterValue = url.searchParams.get('filter_value')

  const res = await apiFetch('/saude-cliente', {
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
      'X-User-Equipe': session.equipe ?? '',
      ...(session.idAssessor ? { 'X-User-Id-Assessor': session.idAssessor } : {}),
      ...(filterType ? { 'X-Filter-Type': filterType } : {}),
      ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
    },
  })

  const json = await res.json()
  return NextResponse.json(json, { status: res.status })
}
