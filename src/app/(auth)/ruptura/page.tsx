import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { AnalisesFilters } from '../analises/_components/AnalisesFilters'
import { RupturaTable } from './_components/RupturaTable'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type RupturaSinais = {
  npsDetrator: boolean
  stvmOut: boolean
  monoproduto: boolean
  semAportes: boolean
  rentNegativa: boolean
  semOrdem: boolean
}

export type RupturaRow = {
  idCliente: number
  nomeCliente: string
  idAssessor: string
  nomeAssessor: string | null
  modelo: string | null
  auc: number | null
  pontRuptura: number | null
  mesesRuptura: number | null
  sinais: RupturaSinais
}

type RupturaPayload = {
  kpis: {
    total: number
    alta: number
    media: number
    aucTotal: number
    assessoresAtivos: number
    periodo: string | null
  }
  rows: RupturaRow[]
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

function fBRLShort(n: number): string {
  if (n >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toFixed(2).replace('.', ',')} Bi`
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')} Mi`
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)} mil`
  return `R$ ${n.toFixed(0)}`
}

/* ─── Fetchers ───────────────────────────────────────────────────────────── */

type RupturaFetchOpts = {
  email: string
  role: string
  equipe?: string | undefined
  idAssessor?: string | undefined
  filterType?: string | undefined
  filterValue?: string | undefined
}

async function getRuptura(opts: RupturaFetchOpts): Promise<RupturaPayload | null> {
  try {
    const res = await apiFetch('/ruptura', {
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
    const json = (await res.json()) as { data: RupturaPayload }
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

export default async function RupturaPage({
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
    getRuptura({
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
    alta: 0,
    media: 0,
    aucTotal: 0,
    assessoresAtivos: 0,
    periodo: null,
  }

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
      <PageGreeting name={session.name} label={`Ruptura — ${periodoLabel}`} />

      {canFilter && (
        <AnalisesFilters
          basePath="/ruptura"
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
          gridTemplateColumns: `repeat(${isAssessor ? 4 : 5}, 1fr)`,
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Clientes em Risco</p>
            <p style={kpiValue}>{fInt(kpis.total)}</p>
            <span style={kpiPill}>no período</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Ruptura Alta</p>
            <p style={{ ...kpiValue, color: 'var(--color-negative)' }}>{fInt(kpis.alta)}</p>
            <span style={{ ...kpiPill, background: 'var(--neg-bg)', color: 'var(--neg-fg)' }}>
              {fPct(kpis.alta, kpis.total)} — pont ≥ 6
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Ruptura Média</p>
            <p style={kpiValue}>{fInt(kpis.media)}</p>
            <span style={kpiPill}>{fPct(kpis.media, kpis.total)} — pont 3–5</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>AUC em Risco</p>
            <p style={{ ...kpiValue, color: 'var(--c-gold)' }}>{fBRLShort(kpis.aucTotal)}</p>
            <span style={kpiPill}>custódia total</span>
          </div>
        </div>

        {!isAssessor && (
          <div style={card}>
            <div style={{ padding: '22px 24px', textAlign: 'center' }}>
              <p style={kpiLabel}>Assessores Impactados</p>
              <p style={kpiValue}>{fInt(kpis.assessoresAtivos)}</p>
              <span style={kpiPill}>com clientes em risco</span>
            </div>
          </div>
        )}
      </div>

      {data === null ? (
        <div style={{ padding: 24, color: 'var(--fg-faint)', fontFamily: 'var(--f-text)' }}>
          Não foi possível carregar os dados de ruptura.
        </div>
      ) : (
        <RupturaTable rows={data.rows} showAssessor={!isAssessor} />
      )}
    </div>
  )
}
