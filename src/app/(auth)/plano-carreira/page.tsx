import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { PlanoCarreiraTable } from './_components/PlanoCarreiraTable'

export type PlanAssessor = {
  id_assessor: string
  nome:        string
  equipe:      string
  classe:      string
  cap_mtd:     number
  cap_trigger: number
  cap_pct:     number
  rec_mtd:     number
  rec_trigger: number
  rec_pct:     number
  mds:         number
  mds_trigger: number
  mds_pct:     number
}

type Payload = {
  mesISO:     string
  assessores: PlanAssessor[]
}

async function getPlanoCarreira(role: string, email: string): Promise<Payload | null> {
  try {
    const res = await apiFetch('/pnl/plano-carreira', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: Payload }
    return json.data
  } catch { return null }
}

export default async function PlanoCarreiraPage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/dashboard')
  }

  const payload = await getPlanoCarreira(session.role, session.email)

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label="Plano de Carreira 2026" />

      {!payload || payload.assessores.length === 0 ? (
        <div
          style={{
            background:   'var(--bg-elev)',
            borderRadius: 12,
            border:       '1px solid var(--line)',
            padding:      '48px 24px',
            textAlign:    'center',
          }}
        >
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--fg-faint)' }}>
            Sem dados disponíveis para o período atual.
          </span>
        </div>
      ) : (
        <PlanoCarreiraTable assessores={payload.assessores} mesISO={payload.mesISO} />
      )}
    </div>
  )
}
