import { apiFetch } from '@/lib/api/fetch'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const filterType = url.searchParams.get('filter_type')
  const filterValue = url.searchParams.get('filter_value')
  const canFilter =
    session.role === 'admin' || session.role === 'master' || session.role === 'lider'

  const res = await apiFetch('/nps/pendentes.csv', {
    headers: {
      'X-User-Email': session.email,
      'X-User-Role': session.role,
      'X-User-Equipe': session.equipe ?? '',
      ...(session.idAssessor ? { 'X-User-Id-Assessor': session.idAssessor } : {}),
      ...(canFilter && filterType ? { 'X-Filter-Type': filterType } : {}),
      ...(canFilter && filterValue ? { 'X-Filter-Value': filterValue } : {}),
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Falha ao gerar CSV' }, { status: res.status })
  }

  const body = await res.arrayBuffer()
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') ?? 'text/csv; charset=utf-8',
      'Content-Disposition':
        res.headers.get('content-disposition') ??
        `attachment; filename="nps-pendentes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
