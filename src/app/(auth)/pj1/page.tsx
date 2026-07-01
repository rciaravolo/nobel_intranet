import { apiFetch } from '@/lib/api/fetch'
import { authHeaders } from '@/lib/auth/api-headers'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { type Categoria, PJ1Client } from './_components/PJ1Client'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type PJ1Payload = {
  mesLabel: string
  categorias: Categoria[]
  total: number
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getPJ1Receitas(session: Awaited<ReturnType<typeof requireSession>>): Promise<PJ1Payload | null> {
  try {
    const res = await apiFetch('/performance/pj1/receitas', {
      cache: 'no-store',
      headers: authHeaders(session),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: PJ1Payload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function PJ1Page() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master' && session.role !== 'lider_pj') {
    redirect('/dashboard')
  }

  const data = await getPJ1Receitas(session)
  const categorias = data?.categorias ?? []
  const total = data?.total ?? 0
  const mesLabel = data?.mesLabel ?? ''

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label={`PJ1 · Receitas ${mesLabel}`} />

      <PJ1Client categorias={categorias} total={total} mesLabel={mesLabel} />

      {!data && (
        <div
          className="ds-stat"
          style={{ marginTop: 20, padding: '48px 24px', textAlign: 'center' }}
        >
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--fg-faint)' }}>
            Sem dados disponíveis para o período atual.
          </span>
        </div>
      )}
    </div>
  )
}
