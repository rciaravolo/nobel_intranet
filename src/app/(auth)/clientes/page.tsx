import { requireSession } from '@/lib/auth/session'
import { type Cliente, ClientesTable } from './_components/ClientesTable'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type ClientesPayload = {
  clientes: Cliente[]
  stats: { total: number; ativos: number; inativos: number; aum_total: number }
}

/* ─── Formatters ─────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000) return `R$ ${Math.round(v / 1_000)}K`
  return `R$ ${v.toFixed(0)}`
}

function fPct(a: number, b: number): string {
  if (b === 0) return '—'
  return `${((a / b) * 100).toFixed(0)}%`
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getClientes(
  email: string,
  role: string,
  equipe?: string,
): Promise<ClientesPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/clientes`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${secret}`,
        'X-User-Email': email,
        'X-User-Role': role,
        'X-User-Equipe': equipe ?? '',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data: ClientesPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function ClientesPage() {
  const session = await requireSession()
  const data = await getClientes(session.email, session.role, session.equipe)

  const stats = data?.stats ?? { total: 0, ativos: 0, inativos: 0, aum_total: 0 }
  const clientes = data?.clientes ?? []
  const isAdmin = session.role === 'admin' || session.role === 'master'

  /* ─── Estilos — padrão canônico de card ──────────────────────────── */
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

  const mono10: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    color: 'var(--fg-faint)',
  }

  const pctAtivos = fPct(stats.ativos, stats.total)

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <p style={mono10}>Base de clientes</p>
          <h1
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 26,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.02em',
              marginTop: 4,
            }}
          >
            Clientes
          </h1>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        {/* Total */}
        <div style={{ ...card, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, var(--c-gold), #D4AF6A)',
            }}
          />
          <div style={{ padding: '22px 24px' }}>
            <p style={kpiLabel}>Total de Clientes</p>
            <p style={kpiValue}>{stats.total.toLocaleString('pt-BR')}</p>
            <span style={kpiPill}>base completa</span>
          </div>
        </div>

        {/* Ativos */}
        <div style={card}>
          <div style={{ padding: '22px 24px' }}>
            <p style={kpiLabel}>Ativos</p>
            <p style={kpiValue}>{stats.ativos.toLocaleString('pt-BR')}</p>
            <span style={{ ...kpiPill, background: 'var(--pos-bg)', color: 'var(--pos-fg)' }}>
              {pctAtivos} do total
            </span>
          </div>
        </div>

        {/* Inativos */}
        <div style={card}>
          <div style={{ padding: '22px 24px' }}>
            <p style={kpiLabel}>Inativos</p>
            <p style={kpiValue}>{stats.inativos.toLocaleString('pt-BR')}</p>
            <span style={kpiPill}>{fPct(stats.inativos, stats.total)} do total</span>
          </div>
        </div>

        {/* AUM */}
        <div style={card}>
          <div style={{ padding: '22px 24px' }}>
            <p style={kpiLabel}>AUM Total</p>
            <p style={kpiValue}>{fBRL(stats.aum_total)}</p>
            <span style={kpiPill}>posição atual</span>
          </div>
        </div>
      </div>

      {/* ── Tabela com busca + filtros ──────────────────────────────────── */}
      <ClientesTable clientes={clientes} isAdmin={isAdmin} />
    </div>
  )
}
