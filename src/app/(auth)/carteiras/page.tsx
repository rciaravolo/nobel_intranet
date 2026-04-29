import { requireSession } from '@/lib/auth/session'
import { BuscaCliente } from './_components/BuscaCliente'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type AlocacaoItem = { produto: string; total: number; clientes: number }

type CarteirasPayload = {
  aum: number
  dataRef: string | null
  alocacao: AlocacaoItem[]
}

/* ─── Cores por produto ──────────────────────────────────────────────────── */

const PRODUTO_COLOR: Record<string, string> = {
  'Renda Fixa': '#3B82F6',
  Fundos: '#8B5CF6',
  Previdência: '#10B981',
  'Renda Variável': '#F59E0B',
  COE: '#EF4444',
  'Fundo Imobiliário': '#06B6D4',
  'Off-Shore': '#6366F1',
  Precatorio: '#84CC16',
  'Saldo em Conta': '#94A3B8',
  'XP Internacional': '#F97316',
  Compromissadas: '#EC4899',
  Disney: '#A78BFA',
}

function produtoColor(produto: string): string {
  return PRODUTO_COLOR[produto] ?? '#B8963E'
}

/* ─── Formatação ─────────────────────────────────────────────────────────── */

function formatBRL(val: number): string {
  if (val >= 1_000_000_000) return `R$ ${(val / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (val >= 1_000) return `R$ ${Math.round(val / 1_000)}K`
  return `R$ ${val.toFixed(0)}`
}

function formatPct(val: number): string {
  return `${val.toFixed(1).replace('.', ',')}%`
}

function formatDataRef(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getCarteiras(): Promise<CarteirasPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/carteiras`, {
      next: { revalidate: 3600 },
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data: CarteirasPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Estilos base ───────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid rgba(184,150,62,0.12)',
  boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function CarteirasPage() {
  const [, data] = await Promise.all([requireSession(), getCarteiras()])

  const alocacao = data?.alocacao ?? []
  const aum = data?.aum ?? 0
  const _totalClientes = [...new Set(alocacao.flatMap(() => []))].length

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.38)', marginBottom: 5 }}>
            Posição em {formatDataRef(data?.dataRef ?? null)}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-lora, serif)',
              fontSize: 26,
              fontWeight: 500,
              color: '#1A1209',
            }}
          >
            Carteiras
          </h1>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid-kpi" style={{ marginBottom: 24 }}>
        <div style={{ ...card, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'linear-gradient(90deg, #B8963E, #D4A96A)',
            }}
          />
          <div style={{ padding: '16px 18px' }}>
            <p
              style={{
                fontSize: 10,
                color: 'rgba(26,18,9,0.38)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8,
              }}
            >
              AUM Total
            </p>
            <p
              style={{
                fontFamily: 'var(--font-lora, serif)',
                fontSize: 26,
                fontWeight: 600,
                color: '#1A1209',
                marginBottom: 6,
                lineHeight: 1,
              }}
            >
              {formatBRL(aum)}
            </p>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(26,18,9,0.4)',
                padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(26,18,9,0.05)',
              }}
            >
              {alocacao.length} classes de ativos
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '16px 18px' }}>
            <p
              style={{
                fontSize: 10,
                color: 'rgba(26,18,9,0.38)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8,
              }}
            >
              Maior Alocação
            </p>
            <p
              style={{
                fontFamily: 'var(--font-lora, serif)',
                fontSize: 26,
                fontWeight: 600,
                color: '#1A1209',
                marginBottom: 6,
                lineHeight: 1,
              }}
            >
              {alocacao[0]?.produto ?? '—'}
            </p>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(26,18,9,0.4)',
                padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(26,18,9,0.05)',
              }}
            >
              {aum > 0 ? formatPct(((alocacao[0]?.total ?? 0) / aum) * 100) : '—'} do portfólio
            </span>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '16px 18px' }}>
            <p
              style={{
                fontSize: 10,
                color: 'rgba(26,18,9,0.38)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8,
              }}
            >
              Renda Fixa + Fundos
            </p>
            <p
              style={{
                fontFamily: 'var(--font-lora, serif)',
                fontSize: 26,
                fontWeight: 600,
                color: '#1A1209',
                marginBottom: 6,
                lineHeight: 1,
              }}
            >
              {aum > 0
                ? formatPct(
                    (alocacao
                      .filter((a) => a.produto === 'Renda Fixa' || a.produto === 'Fundos')
                      .reduce((s, a) => s + a.total, 0) /
                      aum) *
                      100,
                  )
                : '—'}
            </p>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(26,18,9,0.4)',
                padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(26,18,9,0.05)',
              }}
            >
              conservador + moderado
            </span>
          </div>
        </div>
      </div>

      {/* ── Alocação por classe ── */}
      <div style={card}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 12px',
            borderBottom: '1px solid rgba(184,150,62,0.09)',
            background: '#FDFAF5',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-lora, serif)',
              fontSize: 14,
              fontWeight: 500,
              color: '#1A1209',
            }}
          >
            Alocação por Classe de Ativo
          </span>
          <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)' }}>{formatBRL(aum)} total</span>
        </div>

        <div style={{ padding: '8px 0' }}>
          {alocacao.map((item, i) => {
            const pct = aum > 0 ? (item.total / aum) * 100 : 0
            const color = produtoColor(item.produto)
            return (
              <div
                key={item.produto}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 110px 90px',
                  alignItems: 'center',
                  gap: 16,
                  padding: '10px 20px',
                  borderBottom:
                    i < alocacao.length - 1 ? '1px solid rgba(184,150,62,0.06)' : 'none',
                }}
              >
                {/* Produto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#1A1209',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.produto}
                  </span>
                </div>

                {/* Barra */}
                <div
                  style={{
                    height: 6,
                    background: 'rgba(26,18,9,0.06)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 3,
                      opacity: 0.85,
                    }}
                  />
                </div>

                {/* Valor */}
                <span
                  style={{ fontSize: 13, fontWeight: 500, color: '#1A1209', textAlign: 'right' }}
                >
                  {formatBRL(item.total)}
                </span>

                {/* % + clientes */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color, display: 'block' }}>
                    {formatPct(pct)}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)' }}>
                    {item.clientes.toLocaleString('pt-BR')} clientes
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Bloco 3: Busca por cliente — oculto por hora ── */}
      {false && <BuscaCliente />}
    </div>
  )
}
