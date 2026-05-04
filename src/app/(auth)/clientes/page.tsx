import { requireSession } from '@/lib/auth/session'
import { ClientesTable, type Cliente } from './_components/ClientesTable'

type ClientesPayload = {
  clientes: Cliente[]
  stats: { total: number; ativos: number; inativos: number; aum_total: number }
}

function fBRL(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000)         return `R$ ${Math.round(v / 1_000)}K`
  return `R$ ${v.toFixed(0)}`
}

async function getClientes(email: string, role: string, equipe?: string): Promise<ClientesPayload | null> {
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

export default async function ClientesPage() {
  const session = await requireSession()
  const data    = await getClientes(session.email, session.role, session.equipe)

  const stats   = data?.stats   ?? { total: 0, ativos: 0, inativos: 0, aum_total: 0 }
  const clientes = data?.clientes ?? []
  const isAdmin  = session.role === 'admin' || session.role === 'master'

  const mono10: React.CSSProperties = { fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-faint)' }
  const card: React.CSSProperties   = { background: 'var(--bg-elev)', border: '1px solid var(--line)', padding: '18px 20px' }

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <p style={mono10}>Base de clientes</p>
          <h1 style={{ fontFamily: 'var(--f-text)', fontSize: 26, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.02em', marginTop: 4 }}>
            Clientes
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
        {[
          { label: 'Total de Clientes', value: stats.total.toLocaleString('pt-BR'),   accent: 'var(--color-b-500)' },
          { label: 'Ativos',            value: stats.ativos.toLocaleString('pt-BR'),  accent: 'var(--pos-fg)'      },
          { label: 'Inativos',          value: stats.inativos.toLocaleString('pt-BR'),accent: 'var(--fg-faint)'    },
          { label: 'AUM Total',         value: fBRL(stats.aum_total),                 accent: 'var(--c-gold)'      },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ ...card, position: 'relative' }}>
            <p style={mono10}>{label}</p>
            <p style={{ fontFamily: 'var(--f-text)', fontSize: 28, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-.02em', lineHeight: 1, margin: '10px 0 0' }}>
              <span style={{ color: accent }}>{value}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <ClientesTable clientes={clientes} isAdmin={isAdmin} />
    </div>
  )
}
