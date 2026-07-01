import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type KpisQualidade = {
  indiceModeloServir: number | null
  mesReferencia:      string | null
  npsEnvios:          number
  npsRespostas:       number
  npsAssessor:        number | null
  taxaResposta:       number | null
}

/* ─── Fetcher ────────────────────────────────────────────────────────────── */

async function getKpisQualidade(role: string, email: string): Promise<KpisQualidade | null> {
  try {
    const res = await apiFetch('/qualidade/kpis', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: KpisQualidade }
    return json.data
  } catch { return null }
}

/* ─── KPI Card ───────────────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string | undefined
  accent?: boolean | undefined
}) {
  return (
    <div
      className="ds-stat"
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        textAlign:      'center',
        gap:            8,
        flex:           1,
        minWidth:       160,
        borderLeft:     accent ? '3px solid var(--c-gold)' : undefined,
      }}
    >
      <span className="lbl">{label}</span>
      <span
        className="num"
        style={{ color: accent ? 'var(--color-b-500)' : undefined }}
      >
        {value}
      </span>
      {sub && <span className="sub">{sub}</span>}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function QualidadePage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/dashboard')
  }

  const kpis = await getKpisQualidade(session.role, session.email)

  const fmt = (v: number | null, suffix = '', decimals = 1) =>
    v == null ? '—' : `${v.toFixed(decimals).replace('.', ',')}${suffix}`

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label="Indicadores de Qualidade" />

      {/* KPI Cards */}
      <div
        className="grid-kpi"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          marginBottom: 32,
        }}
      >
        <KpiCard
          label="Índice Modelo de Servir"
          value={fmt(kpis?.indiceModeloServir ?? null, '%')}
          sub={kpis?.mesReferencia ?? undefined}
          accent
        />
        <KpiCard
          label="NPS Envios"
          value={kpis ? String(kpis.npsEnvios) : '—'}
          sub="pesquisas enviadas"
        />
        <KpiCard
          label="NPS Respostas"
          value={kpis ? String(kpis.npsRespostas) : '—'}
          sub="pesquisas respondidas"
        />
        <KpiCard
          label="NPS Assessor"
          value={fmt(kpis?.npsAssessor ?? null, '', 1)}
          sub="nota média (0–10)"
          accent
        />
        <KpiCard
          label="Taxa de Respostas"
          value={fmt(kpis?.taxaResposta ?? null, '%')}
          sub="respostas / envios"
        />
      </div>
    </div>
  )
}
