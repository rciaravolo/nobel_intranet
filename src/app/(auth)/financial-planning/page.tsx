import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { AnalisesFilters } from '../analises/_components/AnalisesFilters'
import { FinancialPlanningTable } from './_components/FinancialPlanningTable'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type FPRow = {
  idCliente: number
  nomeCliente: string
  idAssessor: string
  nomeAssessor: string | null
  segmentoConta: string | null
  statusConta: string | null
  statusFp: string | null
  completude: number | null
  dataCriacaoFp: string | null
  ultimaAtualizacao: string | null
}

type FPPayload = {
  kpis: {
    total: number
    iniciado: number
    geq70: number
    completo: number
    assessoresAtivos: number
    periodo: string | null
  }
  clustersGeq70: { segmento: string; n: number }[]
  rows: FPRow[]
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

/* ─── ClusterBarChart ────────────────────────────────────────────────────── */

function ClusterBarChart({ clusters }: { clusters: { segmento: string; n: number }[] }) {
  const max = Math.max(1, ...clusters.map((c) => c.n))
  if (clusters.length === 0) {
    return (
      <div style={{ color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
        Sem dados no período
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {clusters.map((c) => (
        <div
          key={c.segmento}
          style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 18 }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              color: 'var(--fg-mute)',
              width: 68,
              textAlign: 'right',
              whiteSpace: 'nowrap',
            }}
          >
            {c.segmento}
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              background: 'var(--bg-deep)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(c.n / max) * 100}%`,
                height: '100%',
                background: 'var(--c-gold)',
                transition: 'width .2s',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--fg)',
              width: 32,
              textAlign: 'right',
              fontFeatureSettings: '"tnum"',
            }}
          >
            {c.n}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Fetchers ───────────────────────────────────────────────────────────── */

type FPFetchOpts = {
  email: string
  role: string
  equipe?: string | undefined
  idAssessor?: string | undefined
  filterType?: string | undefined
  filterValue?: string | undefined
}

async function getFP(opts: FPFetchOpts): Promise<FPPayload | null> {
  try {
    const res = await apiFetch('/financial-planning', {
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
    const json = (await res.json()) as { data: FPPayload }
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

export default async function FinancialPlanningPage({
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
    getFP({
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
    iniciado: 0,
    geq70: 0,
    completo: 0,
    assessoresAtivos: 0,
    periodo: null,
  }
  const clustersGeq70 = data?.clustersGeq70 ?? []

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
  const isAssessor = session.role === 'assessor'

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label={`Financial Planning — ${periodoLabel}`} />

      {canFilter && (
        <AnalisesFilters
          basePath="/financial-planning"
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isAssessor ? 'repeat(4, 1fr)' : 'repeat(4, 1fr) 1.6fr',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Total de Clientes</p>
            <p style={kpiValue}>{fInt(kpis.total)}</p>
            <span style={kpiPill}>no período</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>FP Iniciado</p>
            <p style={{ ...kpiValue, color: 'var(--c-gold)' }}>{fInt(kpis.iniciado)}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {fPct(kpis.iniciado, kpis.total)} do total
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Completude ≥ 70%</p>
            <p style={kpiValue}>{fInt(kpis.geq70)}</p>
            <span style={kpiPill}>{fPct(kpis.geq70, kpis.total)} do total</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>FP Completo</p>
            <p style={{ ...kpiValue, color: 'var(--color-positive)' }}>{fInt(kpis.completo)}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {fPct(kpis.completo, kpis.total)} — 100%
            </span>
          </div>
        </div>

        {!isAssessor && (
          <div style={card}>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ ...kpiLabel, marginBottom: 12, textAlign: 'left' }}>
                Completude ≥ 70% por Cluster
              </p>
              <ClusterBarChart clusters={clustersGeq70} />
            </div>
          </div>
        )}
      </div>

      {data === null ? (
        <div style={{ padding: 24, color: 'var(--fg-faint)', fontFamily: 'var(--f-text)' }}>
          Não foi possível carregar os dados de Financial Planning.
        </div>
      ) : (
        <FinancialPlanningTable rows={data.rows} showAssessor={!isAssessor} />
      )}
    </div>
  )
}
