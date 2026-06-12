import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { IndicadoresTable } from './_components/IndicadoresTable'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type AssessorRow = {
  id:   string
  nome: string
  mtd:  number
  meta?: number
  pct?:  number | null
  ytd?:  number
}

type EquipeRow = {
  equipe:     string
  mtd:        number
  meta:       number
  pct:        number | null
  ytd:        number
  assessores: AssessorRow[]
}

type TotalRow = {
  mtd:  number
  meta: number
  pct:  number | null
  ytd:  number
}

type IndicadoresPayload = {
  mesISO:           string
  assessoresAtivos: number
  captacao: {
    equipes: EquipeRow[]
    total:   TotalRow
  }
  receita: {
    equipes: EquipeRow[]
    total:   TotalRow
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function getMesLabel(mesISO: string): string {
  return new Date(`${mesISO}-15`).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getIndicadores(
  role: string,
  email: string,
): Promise<IndicadoresPayload | null> {
  try {
    const res = await apiFetch('/pnl/indicadores', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: IndicadoresPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── KpiChip ────────────────────────────────────────────────────────────── */

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background:   'var(--bg-elev)',
        border:       '1px solid var(--line)',
        borderRadius: 8,
        padding:      '10px 16px',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--f-mono)',
          fontSize:      18,
          fontWeight:    600,
          color:         'var(--fg)',
          letterSpacing: '-.01em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily:    'var(--f-mono)',
          fontSize:      10,
          color:         'var(--fg-faint)',
          marginTop:     2,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
        }}
      >
        {label}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function IndicadoresPage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/dashboard')
  }

  const dados = await getIndicadores(session.role, session.email)

  const mesLabel = dados ? getMesLabel(dados.mesISO) : ''
  const yearStr  = dados ? dados.mesISO.substring(0, 4) : ''

  return (
    <div style={{ maxWidth: 1340 }}>
      <PageGreeting name={session.name} label="Indicadores gerenciais" />

      {dados == null ? (
        <div
          style={{
            background:   'var(--bg-elev)',
            borderRadius: 12,
            border:       '1px solid var(--line)',
            padding:      '48px 24px',
            textAlign:    'center',
            marginTop:    24,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize:   13,
              color:      'var(--fg-faint)',
            }}
          >
            Erro ao carregar indicadores. Tente novamente.
          </span>
        </div>
      ) : (
        <>
          {/* KPI bar */}
          <div
            style={{
              display:    'flex',
              gap:        12,
              marginTop:  16,
              marginBottom: 20,
              flexWrap:   'wrap',
            }}
          >
            <KpiChip
              label="Assessores ativos"
              value={String(dados.assessoresAtivos)}
            />
            <KpiChip
              label={`Cap MTD — ${mesLabel}`}
              value={fBRL(dados.captacao.total.mtd)}
            />
            <KpiChip
              label={`Cap YTD — ${yearStr}`}
              value={fBRL(dados.captacao.total.ytd)}
            />
            <KpiChip
              label={`Rec MTD — ${mesLabel}`}
              value={fBRL(dados.receita.total.mtd)}
            />
          </div>

          {/* Tabelas lado a lado */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 20,
              alignItems:          'start',
            }}
          >
            <IndicadoresTable
              title="Captacao por Equipe"
              subtitle={`MTD vs Meta — ${mesLabel}`}
              equipes={dados.captacao.equipes}
              total={dados.captacao.total}
              tipo="captacao"
            />
            <IndicadoresTable
              title="Receita por Equipe"
              subtitle={`MTD vs Meta — ${mesLabel}`}
              equipes={dados.receita.equipes}
              total={dados.receita.total}
              tipo="receita"
            />
          </div>
        </>
      )}
    </div>
  )
}
