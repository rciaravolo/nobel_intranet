import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { PageGreeting } from '../_components/PageGreeting'
import { AnalisesFilters } from '../analises/_components/AnalisesFilters'
import { NpsTable } from './_components/NpsTable'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export type Envio = {
  idCliente: number
  nomeCliente: string
  emailCliente: string | null
  telefone: string | null
  nomeAssessor: string | null
  recordDate: string
  emailOpened: string | null
  surveyFinished: string | null
  nota: number | null
}

type NpsPayload = {
  kpis: { envios: number; aberturas: number; respostas: number; mediaNota: number | null }
  envios: Envio[]
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

function fNota(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toFixed(2).replace('.', ',')
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

type NpsFetchOpts = {
  email: string
  role: string
  equipe?: string | undefined
  idAssessor?: string | undefined
  filterType?: string | undefined
  filterValue?: string | undefined
}

async function getNps(opts: NpsFetchOpts): Promise<NpsPayload | null> {
  try {
    const res = await apiFetch('/nps', {
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
    const json = (await res.json()) as { data: NpsPayload }
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
  if (role !== 'admin' && role !== 'master' && role !== 'lider' && role !== 'lider_pj') return null
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

export default async function NpsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireSession()
  const sp = await searchParams
  const filterType = typeof sp.filter_type === 'string' ? sp.filter_type : undefined
  const filterValue = typeof sp.filter_value === 'string' ? sp.filter_value : undefined

  const canFilter =
    session.role === 'admin' || session.role === 'master' || session.role === 'lider'

  const [data, assessoresData] = await Promise.all([
    getNps({
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

  const kpis = data?.kpis ?? { envios: 0, aberturas: 0, respostas: 0, mediaNota: null }

  // CSV mantém o filtro ativo (admin/master/lider); pra outras roles ignora.
  const csvHref = (() => {
    if (!canFilter || !filterType || !filterValue) return '/api/nps/pendentes.csv'
    const qs = new URLSearchParams({ filter_type: filterType, filter_value: filterValue })
    return `/api/nps/pendentes.csv?${qs.toString()}`
  })()

  /* ─── Estilos — padrão canônico de card (copiado de clientes/page.tsx) ── */
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

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label="Pesquisa NPS" />

      {/* ── Filtro (admin / master / lider) ─────────────────────────────── */}
      {canFilter && (
        <AnalisesFilters
          basePath="/nps"
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
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        {/* Envios */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Envios</p>
            <p style={kpiValue}>{fInt(kpis.envios)}</p>
            <span style={kpiPill}>base completa</span>
          </div>
        </div>

        {/* Aberturas */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Aberturas</p>
            <p style={kpiValue}>{fInt(kpis.aberturas)}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {fPct(kpis.aberturas, kpis.envios)} dos envios
            </span>
          </div>
        </div>

        {/* Respostas */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Respostas</p>
            <p style={kpiValue}>{fInt(kpis.respostas)}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {fPct(kpis.respostas, kpis.envios)} dos envios
            </span>
          </div>
        </div>

        {/* Média Nota */}
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Média Nota</p>
            <p style={kpiValue}>{fNota(kpis.mediaNota)}</p>
            <span style={kpiPill}>
              sobre {fInt(kpis.respostas)} {kpis.respostas === 1 ? 'resposta' : 'respostas'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Botão CSV ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--s-4)', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={csvHref}
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'var(--bg-elev)',
            color: 'var(--fg)',
            fontFamily: 'var(--f-mono)',
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          ↓ Baixar clientes pendentes (CSV)
        </a>
      </div>

      {/* ── Tabela ────────────────────────────────────────────────────── */}
      {data === null ? (
        <div style={{ padding: 24, color: 'var(--fg-faint)', fontFamily: 'var(--f-text)' }}>
          Não foi possível carregar dados de NPS.
        </div>
      ) : (
        <NpsTable envios={data.envios} />
      )}
    </div>
  )
}
