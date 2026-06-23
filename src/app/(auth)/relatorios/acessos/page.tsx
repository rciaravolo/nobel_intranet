import { getRelatorioAcessos } from '@/lib/api/admin'
import type { RelatorioAcessos } from '@/lib/api/admin'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDataRelativa(isoString: string): string {
  const data = new Date(isoString)
  const agora = new Date()
  const diffDias = Math.floor((agora.getTime() - data.getTime()) / 86400000)
  if (diffDias === 0) return 'Hoje'
  if (diffDias === 1) return 'Ontem'
  if (diffDias < 7) return `${diffDias} dias atrás`
  if (diffDias < 30) return `${Math.floor(diffDias / 7)} sem. atrás`
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    master: 'Master',
    admin: 'Admin',
    lider: 'Líder',
    assessor: 'Assessor',
  }
  return map[role.toLowerCase()] ?? role
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  desc,
}: {
  label: string
  value: number
  desc: string
}) {
  return (
    <div
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--f-text)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--fg-faint)',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 32,
          fontWeight: 600,
          color: 'var(--fg)',
          lineHeight: 1.1,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--f-text)',
          fontSize: 12,
          color: 'var(--fg-faint)',
        }}
      >
        {desc}
      </span>
    </div>
  )
}

type StatusBadgeProps = {
  acessouHoje: number
  diasUltimos7: number
  diasUltimos30: number
}

function StatusBadge({ acessouHoje, diasUltimos7, diasUltimos30 }: StatusBadgeProps) {
  if (acessouHoje === 1) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.04em',
          fontFamily: 'var(--f-mono)',
          background: 'var(--pos-bg)',
          color: 'var(--pos-fg)',
        }}
      >
        Hoje
      </span>
    )
  }
  if (diasUltimos7 > 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.04em',
          fontFamily: 'var(--f-mono)',
          background: 'rgba(45,95,160,0.10)',
          color: '#2D5FA0',
        }}
      >
        7d
      </span>
    )
  }
  if (diasUltimos30 > 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.04em',
          fontFamily: 'var(--f-mono)',
          background: 'rgba(217,119,6,0.10)',
          color: '#b45309',
        }}
      >
        30d
      </span>
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.04em',
        fontFamily: 'var(--f-mono)',
        background: 'var(--bg-deep)',
        color: 'var(--fg-faint)',
      }}
    >
      Inativo
    </span>
  )
}

// ── Table ────────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--f-text)',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--fg-faint)',
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  padding: '10px 16px',
  textAlign: 'left',
  borderBottom: '1px solid var(--line)',
  whiteSpace: 'nowrap',
  background: 'var(--bg-deep)',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid var(--line)',
  verticalAlign: 'middle',
}

function TabelaUsuarios({ usuarios }: { usuarios: RelatorioAcessos['usuarios'] }) {
  if (usuarios.length === 0) {
    return (
      <div
        style={{
          padding: '60px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--fg-faint)"
          strokeWidth="1.2"
          width="36"
          height="36"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--fg-mute)',
            maxWidth: 380,
            lineHeight: 1.5,
          }}
        >
          Nenhum acesso registrado ainda. Os dados aparecerão conforme os usuários acessam o
          sistema.
        </p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Usuário</th>
            <th style={thStyle}>Cargo</th>
            <th style={thStyle}>Último Acesso</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>7 dias</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>30 dias</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, idx) => (
            <tr
              key={u.email}
              style={{
                background:
                  idx % 2 === 0
                    ? 'transparent'
                    : 'color-mix(in oklch, var(--bg-deep) 40%, transparent)',
              }}
            >
              {/* Usuário */}
              <td style={tdStyle}>
                <div
                  style={{
                    fontFamily: 'var(--f-text)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--fg)',
                    marginBottom: 2,
                  }}
                >
                  {u.nome}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    color: 'var(--fg-faint)',
                    letterSpacing: '.01em',
                  }}
                >
                  {u.email}
                </div>
              </td>
              {/* Cargo */}
              <td style={tdStyle}>
                <span
                  style={{
                    fontFamily: 'var(--f-text)',
                    fontSize: 12,
                    color: 'var(--fg-mute)',
                    textTransform: 'capitalize',
                  }}
                >
                  {getRoleLabel(u.role)}
                </span>
              </td>
              {/* Último Acesso */}
              <td style={tdStyle}>
                <span
                  style={{
                    fontFamily: 'var(--f-text)',
                    fontSize: 13,
                    color: 'var(--fg)',
                  }}
                >
                  {formatDataRelativa(u.ultimoAcesso)}
                </span>
              </td>
              {/* 7 dias */}
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 13,
                    color: 'var(--fg)',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {u.diasUltimos7}
                  <span style={{ color: 'var(--fg-faint)', marginLeft: 1 }}>d</span>
                </span>
              </td>
              {/* 30 dias */}
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 13,
                    color: 'var(--fg)',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {u.diasUltimos30}
                  <span style={{ color: 'var(--fg-faint)', marginLeft: 1 }}>d</span>
                </span>
              </td>
              {/* Total */}
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 13,
                    color: 'var(--fg)',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {u.totalDias}
                  <span style={{ color: 'var(--fg-faint)', marginLeft: 1 }}>d</span>
                </span>
              </td>
              {/* Status */}
              <td style={{ ...tdStyle, textAlign: 'center' }}>
                <StatusBadge
                  acessouHoje={u.acessouHoje}
                  diasUltimos7={u.diasUltimos7}
                  diasUltimos30={u.diasUltimos30}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AcessosPage() {
  const session = await requireSession()

  if (session.role !== 'master' && session.role !== 'admin') {
    redirect('/dashboard')
  }

  let relatorio: RelatorioAcessos | null = null
  let erro: string | null = null

  try {
    relatorio = await getRelatorioAcessos(session.role)
  } catch (e) {
    erro = e instanceof Error ? e.message : 'Erro desconhecido'
  }

  const resumo = relatorio?.resumo ?? {
    ativosHoje: 0,
    ativosUltimos7Dias: 0,
    ativosUltimos30Dias: 0,
    totalUsuarios: 0,
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 12,
            color: 'var(--fg-faint)',
            marginBottom: 4,
          }}
        >
          Relatórios · Monitoramento de uso da plataforma
        </p>
        <h1
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-.02em',
          }}
        >
          Controle de Acessos
        </h1>
      </div>

      {/* KPI grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <KpiCard label="Ativos Hoje" value={resumo.ativosHoje} desc="usuários com acesso hoje" />
        <KpiCard
          label="Ativos 7 dias"
          value={resumo.ativosUltimos7Dias}
          desc="acessos nos últimos 7 dias"
        />
        <KpiCard
          label="Ativos 30 dias"
          value={resumo.ativosUltimos30Dias}
          desc="acessos nos últimos 30 dias"
        />
        <KpiCard
          label="Total Usuários"
          value={resumo.totalUsuarios}
          desc="usuários com registro de acesso"
        />
      </div>

      {/* Main table card */}
      <div
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: 'var(--e-float)',
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: '13px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Usuários
          </span>
          {relatorio && (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                color: 'var(--fg-faint)',
                letterSpacing: '.04em',
              }}
            >
              {relatorio.usuarios.length} registro{relatorio.usuarios.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Content */}
        {erro ? (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--neg-fg)"
              strokeWidth="1.4"
              width="32"
              height="32"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p
              style={{
                fontFamily: 'var(--f-text)',
                fontSize: 13,
                color: 'var(--fg-mute)',
              }}
            >
              Não foi possível carregar os dados de acesso.
            </p>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                color: 'var(--fg-faint)',
                letterSpacing: '.02em',
              }}
            >
              {erro}
            </p>
          </div>
        ) : (
          <TabelaUsuarios usuarios={relatorio?.usuarios ?? []} />
        )}
      </div>
    </div>
  )
}
