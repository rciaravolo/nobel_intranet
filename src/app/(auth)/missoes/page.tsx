import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { AnalisesFilters } from '../analises/_components/AnalisesFilters'
import { MissoesTable } from './_components/MissoesTable'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type Missao = {
  idAssessor: string
  nomeAssessor: string | null
  equipe: string | null
  produto: string | null
  valor: number | null
  status: string | null
  urlImg: string | null
}

type MissoesPayload = {
  kpis: {
    total: number
    premiadas: number
    ativadas: number
    elegiveis: number
    assessoresAtivos: number
    periodo: string | null
  }
  rows: Missao[]
}

type AssessoresPayload = {
  equipes: string[]
  assessores: { id_assessor: string; nome_assessor: string | null; equipe: string }[]
}

/* ─── Formatters ─────────────────────────────────────────────────────────── */

function fInt(n: number): string {
  return n.toLocaleString('pt-BR')
}

function fPct(a: number, b: number): string {
  if (b === 0) return '—'
  return `${Math.round((a / b) * 100)}%`
}

/* ─── Fetchers ───────────────────────────────────────────────────────────── */

type MissoesFetchOpts = {
  email: string
  role: string
  equipe?: string | undefined
  idAssessor?: string | undefined
  filterType?: string | undefined
  filterValue?: string | undefined
}

async function getMissoes(opts: MissoesFetchOpts): Promise<MissoesPayload | null> {
  try {
    const res = await apiFetch('/missoes', {
      cache: 'no-store',
      headers: {
        'X-User-Email': opts.email,
        'X-User-Role': opts.role,
        'X-User-Equipe': opts.equipe ?? '',
        ...(opts.idAssessor ? { 'X-User-Id-Assessor': opts.idAssessor } : {}),
        ...(opts.filterType ? { 'X-Filter-Type': opts.filterType } : {}),
        ...(opts.filterValue ? { 'X-Filter-Value': opts.filterValue } : {}),
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data: MissoesPayload }
    return json.data
  } catch {
    return null
  }
}

async function getAssessores(
  role: string,
  email: string,
  equipe?: string,
  idAssessor?: string,
): Promise<AssessoresPayload | null> {
  if (role !== 'admin' && role !== 'master' && role !== 'lider') return null
  try {
    const res = await apiFetch('/performance/assessores', {
      cache: 'no-store',
      headers: {
        'X-User-Role': role,
        'X-User-Email': email,
        ...(equipe ? { 'X-User-Equipe': equipe } : {}),
        ...(idAssessor ? { 'X-User-Id-Assessor': idAssessor } : {}),
      },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: AssessoresPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function MissoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireSession()

  const allowedRoles = ['admin', 'master', 'lider', 'assessor']
  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard')
  }

  const sp = await searchParams
  const filterType = typeof sp.filter_type === 'string' ? sp.filter_type : undefined
  const filterValue = typeof sp.filter_value === 'string' ? sp.filter_value : undefined

  const canFilter =
    session.role === 'admin' || session.role === 'master' || session.role === 'lider'

  const [data, assessoresData] = await Promise.all([
    getMissoes({
      email: session.email,
      role: session.role,
      equipe: session.equipe,
      idAssessor: session.idAssessor,
      ...(canFilter && filterType ? { filterType } : {}),
      ...(canFilter && filterValue ? { filterValue } : {}),
    }),
    canFilter
      ? getAssessores(session.role, session.email, session.equipe, session.idAssessor)
      : Promise.resolve(null),
  ])

  const kpis = data?.kpis ?? {
    total: 0,
    premiadas: 0,
    ativadas: 0,
    elegiveis: 0,
    assessoresAtivos: 0,
    periodo: null,
  }

  /* ─── Estilos — padrão canônico de card (copiado de NPS) ── */
  const card: React.CSSProperties = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    boxShadow: 'var(--e-float)',
    overflow: 'hidden',
  }
  const kpiLabel: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--fg-faint)',
    textTransform: 'uppercase',
    letterSpacing: '.10em',
    marginBottom: 14,
  }
  const kpiValue: React.CSSProperties = {
    fontFamily: 'var(--f-text)',
    fontSize: 34,
    fontWeight: 700,
    color: 'var(--fg)',
    lineHeight: 1,
    letterSpacing: '-.02em',
    marginBottom: 12,
  }
  const kpiPill: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--f-mono)',
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 'var(--r-pill)',
    background: 'var(--bg-deep)',
    color: 'var(--fg-mute)',
  }

  const periodoLabel = kpis.periodo ?? '—'

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label={`Missões — ${periodoLabel}`} />

      {/* ── Filtro (admin / master / lider) ─────────────────────────────── */}
      {canFilter && (
        <AnalisesFilters
          basePath="/missoes"
          equipes={
            session.role === 'lider'
              ? []
              : (assessoresData?.equipes ?? []).slice().sort((a, b) => a.localeCompare(b, 'pt-BR'))
          }
          assessores={(assessoresData?.assessores ?? [])
            .slice()
            .sort((a, b) =>
              (a.nome_assessor ?? a.id_assessor).localeCompare(
                b.nome_assessor ?? b.id_assessor,
                'pt-BR',
              ),
            )}
        />
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        {/* Total */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Total de Missões</p>
            <p style={kpiValue}>{fInt(kpis.total)}</p>
            <span style={kpiPill}>no período</span>
          </div>
        </div>

        {/* Premiadas */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Premiadas</p>
            <p style={{ ...kpiValue, color: 'var(--c-gold)' }}>{fInt(kpis.premiadas)}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {fPct(kpis.premiadas, kpis.total)} do total
            </span>
          </div>
        </div>

        {/* Ativadas */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Ativadas</p>
            <p style={kpiValue}>{fInt(kpis.ativadas)}</p>
            <span style={kpiPill}>{fPct(kpis.ativadas, kpis.total)} do total</span>
          </div>
        </div>

        {/* Elegíveis */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Elegíveis</p>
            <p style={kpiValue}>{fInt(kpis.elegiveis)}</p>
            <span style={kpiPill}>{fPct(kpis.elegiveis, kpis.total)} do total</span>
          </div>
        </div>

        {/* Assessores Ativos */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Assessores Ativos</p>
            <p style={kpiValue}>{fInt(kpis.assessoresAtivos)}</p>
            <span style={kpiPill}>com missões</span>
          </div>
        </div>
      </div>

      {/* ── Tabela ────────────────────────────────────────────────────── */}
      {data === null ? (
        <div style={{ padding: 24, color: 'var(--fg-faint)', fontFamily: 'var(--f-text)' }}>
          Não foi possível carregar as missões.
        </div>
      ) : (
        <MissoesTable rows={data.rows} />
      )}
    </div>
  )
}
