import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PnlClient } from './_components/PnlClient'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export type EquipeCapItem = {
  equipe: string
  capHoje: number
  capOntem: number
  deltaDia: number
  meta: number
  pctHoje: number | null
  pctOntem: number | null
  deltaPp: number | null
}

export type CapPayload =
  | { semDados: true; mesISO: string }
  | {
      semDados: false
      mesISO: string
      dataHoje: string
      dataOntem: string | null
      equipes: EquipeCapItem[]
      total: EquipeCapItem & { equipe: 'Total' }
    }

export type ReceitaPayload = {
  equipes: string[]
  metas: Record<string, number>
  totalReceita: Record<string, number>
  grandTotalReceita: number
  grandTotalMeta: number
  dataRef?: string
  snapDates: string[]
  snapMatrix: Record<string, Record<string, number | null>>
}

/* ─── Fetch helpers ──────────────────────────────────────────────────────── */

async function getReceita(role: string, email: string): Promise<ReceitaPayload | null> {
  try {
    const res = await apiFetch('/pnl/receita-equipes', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: ReceitaPayload }
    return json.data
  } catch {
    return null
  }
}

async function getCaptacao(role: string, email: string): Promise<CapPayload | null> {
  try {
    const res = await apiFetch('/pnl/captacao-equipes', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: CapPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function MobilePnlPage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/m')
  }

  const [receita, captacao] = await Promise.all([
    getReceita(session.role, session.email),
    getCaptacao(session.role, session.email),
  ])

  return <PnlClient receita={receita} captacao={captacao} />
}
