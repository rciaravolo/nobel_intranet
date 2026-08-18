import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { AnalisesFilters } from '../analises/_components/AnalisesFilters'
import { SaudeClienteTable } from './_components/SaudeClienteTable'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type SaudeRow = {
  idCliente: number
  nomeCliente: string
  idAssessor: string
  nomeAssessor: string | null
  modelo: string | null
  auc: number | null
  indiceSaude: number | null
  pontAportes: number | null
  pontRentabilidade: number | null
  pontCrossSell: number | null
  qtdeMesesAporteU12m: number | null
  qtdeCrossSell: number | null
}

type ByModel = { modelo: string; boa: number; media: number; baixa: number; total: number }

type SaudePayload = {
  kpis: {
    total: number
    boa: number
    media: number
    baixa: number
    indiceMedio: number | null
    periodo: string | null
  }
  byModel: ByModel[]
  rows: SaudeRow[]
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

function fNum(n: number | null, decimals = 1): string {
  if (n == null) return '—'
  return n.toFixed(decimals).replace('.', ',')
}

/* ─── DistribuicaoPorModelo ──────────────────────────────────────────────── */

function DistribuicaoPorModelo({ byModel }: { byModel: ByModel[] }) {
  if (byModel.length === 0) {
    return (
      <div style={{ color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
        Sem dados no período
      </div>
    )
  }
  const modeloLabel = (m: string): string => {
    if (m === 'FEE BASED') return 'FEE'
    if (m === 'COMISSION BASED') return 'COMISSION'
    return m
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {byModel.map((m) => {
        const total = m.total || 1
        const pBoa = (m.boa / total) * 100
        const pMedia = (m.media / total) * 100
        const pBaixa = (m.baixa / total) * 100
        return (
          <div key={m.modelo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                color: 'var(--fg-mute)',
                width: 78,
                textAlign: 'right',
                whiteSpace: 'nowrap',
              }}
            >
              {modeloLabel(m.modelo)}
            </span>
            <div
              style={{
                flex: 1,
                display: 'flex',
                height: 10,
                background: 'var(--bg-deep)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
              title={`Boa ${m.boa} · Média ${m.media} · Baixa ${m.baixa}`}
            >
              <div style={{ width: `${pBoa}%`, background: 'var(--color-positive)' }} />
              <div style={{ width: `${pMedia}%`, background: 'var(--c-gold)' }} />
              <div style={{ width: `${pBaixa}%`, background: 'var(--color-negative)' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--fg)',
                width: 48,
                textAlign: 'right',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fInt(m.total)}
            </span>
          </div>
        )
      })}
      <div
        style={{
          display: 'flex',
          gap: 12,
          fontFamily: 'var(--f-mono)',
          fontSize: 9,
          color: 'var(--fg-faint)',
          marginTop: 2,
          justifyContent: 'center',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-positive)' }}
          />
          Boa
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--c-gold)' }} />
          Média
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--color-negative)' }}
          />
          Baixa
        </span>
      </div>
    </div>
  )
}

/* ─── Fetchers ───────────────────────────────────────────────────────────── */

type SaudeFetchOpts = {
  email: string
  role: string
  equipe?: string | undefined
  idAssessor?: string | undefined
  filterType?: string | undefined
  filterValue?: string | undefined
}

async function getSaude(opts: SaudeFetchOpts): Promise<SaudePayload | null> {
  try {
    const res = await apiFetch('/saude-cliente', {
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
    const json = (await res.json()) as { data: SaudePayload }
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

export default async function SaudeClientePage({
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
    getSaude({
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
    boa: 0,
    media: 0,
    baixa: 0,
    indiceMedio: null,
    periodo: null,
  }
  const byModel = data?.byModel ?? []

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
      <PageGreeting name={session.name} label={`Saúde do Cliente — ${periodoLabel}`} />

      {canFilter && (
        <AnalisesFilters
          basePath="/saude-cliente"
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
          gridTemplateColumns: isAssessor ? 'repeat(5, 1fr)' : 'repeat(5, 1fr) 1.6fr',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Clientes Monitorados</p>
            <p style={kpiValue}>{fInt(kpis.total)}</p>
            <span style={kpiPill}>no período</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Saúde Boa</p>
            <p style={{ ...kpiValue, color: 'var(--color-positive)' }}>{fInt(kpis.boa)}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {fPct(kpis.boa, kpis.total)} — ≥ 70
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Saúde Média</p>
            <p style={{ ...kpiValue, color: 'var(--c-gold)' }}>{fInt(kpis.media)}</p>
            <span style={kpiPill}>{fPct(kpis.media, kpis.total)} — 40 a 69</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Saúde Baixa</p>
            <p style={{ ...kpiValue, color: 'var(--color-negative)' }}>{fInt(kpis.baixa)}</p>
            <span style={{ ...kpiPill, background: 'var(--neg-bg)', color: 'var(--neg-fg)' }}>
              {fPct(kpis.baixa, kpis.total)} — &lt; 40
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '22px 24px', textAlign: 'center' }}>
            <p style={kpiLabel}>Índice Médio</p>
            <p style={kpiValue}>{fNum(kpis.indiceMedio, 1)}</p>
            <span style={kpiPill}>escala 0–100</span>
          </div>
        </div>

        {!isAssessor && (
          <div style={card}>
            <div style={{ padding: '18px 20px' }}>
              <p style={{ ...kpiLabel, marginBottom: 12, textAlign: 'left' }}>
                Distribuição por Modelo
              </p>
              <DistribuicaoPorModelo byModel={byModel} />
            </div>
          </div>
        )}
      </div>

      {data === null ? (
        <div style={{ padding: 24, color: 'var(--fg-faint)', fontFamily: 'var(--f-text)' }}>
          Não foi possível carregar os dados de Saúde do Cliente.
        </div>
      ) : (
        <SaudeClienteTable rows={data.rows} showAssessor={!isAssessor} />
      )}
    </div>
  )
}
