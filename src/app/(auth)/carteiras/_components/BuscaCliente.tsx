'use client'

import { useState } from 'react'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type Posicao = {
  produto: string
  sub_produto: string
  ativo: string
  emissor: string | null
  data_vencimento: string | null
  quantidade: number
  net: number
}

type BreakdownItem = { produto: string; total: number }

type ClienteData = {
  id_cliente: string
  aum: number
  posicoes: Posicao[]
  breakdown: BreakdownItem[]
}

/* ─── Cores ──────────────────────────────────────────────────────────────── */

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
const cor = (p: string) => PRODUTO_COLOR[p] ?? '#2D5FA0'

/* ─── Formatação ─────────────────────────────────────────────────────────── */

function fBRL(val: number): string {
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (val >= 1_000)
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  return `R$ ${val.toFixed(2).replace('.', ',')}`
}

function fPct(val: number, total: number): string {
  return total > 0 ? `${((val / total) * 100).toFixed(1).replace('.', ',')}%` : '—'
}

function fData(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function BuscaCliente() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ClienteData | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<string>('Todos')

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    const id = query.trim()
    if (!id) return
    setLoading(true)
    setErro(null)
    setData(null)
    setFiltro('Todos')
    try {
      const res = await fetch(`/api/performance/carteiras?id=${encodeURIComponent(id)}`)
      const json = (await res.json()) as { data?: ClienteData; error?: string }
      if (!res.ok || !json.data) {
        setErro(json.error ?? 'Cliente não encontrado')
        return
      }
      if (json.data.posicoes.length === 0) {
        setErro('Nenhuma posição encontrada para este ID.')
        return
      }
      setData(json.data)
    } catch {
      setErro('Erro ao buscar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: 'var(--bg-elev)',
    borderRadius: 12,
    border: '1px solid var(--line)',
    boxShadow: 'var(--e-float)',
    overflow: 'hidden',
  }

  const monoLabel: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: 'var(--fg-faint)',
  }

  const produtos = data ? ['Todos', ...data.breakdown.map((b) => b.produto)] : []
  const posicoesFiltradas = data
    ? filtro === 'Todos'
      ? data.posicoes
      : data.posicoes.filter((p) => p.produto === filtro)
    : []

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ ...card }}>
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-deep)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Busca de Carteira por Cliente
          </span>
        </div>

        {/* ── Formulário de busca ── */}
        <div style={{ padding: '20px' }}>
          <form onSubmit={buscar} style={{ display: 'flex', gap: 10, maxWidth: 460 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ID do cliente (ex: 5667)"
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: 13,
                fontFamily: 'var(--f-text)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                background: 'var(--bg)',
                color: 'var(--fg)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--f-text)',
                background: loading ? 'var(--fg-faint)' : 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
          </form>

          {erro && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: 'var(--color-negative)',
                fontFamily: 'var(--f-text)',
              }}
            >
              {erro}
            </p>
          )}
        </div>

        {/* ── Resultado ── */}
        {data && (
          <>
            {/* Resumo do cliente */}
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Cliente', value: `#${data.id_cliente}` },
                { label: 'Patrimônio', value: fBRL(data.aum) },
                { label: 'Posições', value: String(data.posicoes.length) },
                { label: 'Classes', value: String(data.breakdown.length) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-deep)',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    minWidth: 140,
                  }}
                >
                  <p style={{ ...monoLabel, marginBottom: 4 }}>{label}</p>
                  <p
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--fg)',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini breakdown */}
            <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.breakdown.map((b) => (
                <div
                  key={b.produto}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: `${cor(b.produto)}15`,
                    border: `1px solid ${cor(b.produto)}30`,
                  }}
                >
                  <div
                    style={{ width: 8, height: 8, borderRadius: 2, background: cor(b.produto) }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--f-text)',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'var(--fg)',
                    }}
                  >
                    {b.produto}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      color: cor(b.produto),
                      fontWeight: 600,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {fPct(b.total, data.aum)}
                  </span>
                </div>
              ))}
            </div>

            {/* Filtro por produto */}
            <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {produtos.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFiltro(p)}
                  style={{
                    padding: '4px 12px',
                    fontSize: 11,
                    fontFamily: 'var(--f-text)',
                    borderRadius: 20,
                    border: `1px solid ${filtro === p ? 'var(--fg)' : 'var(--line)'}`,
                    background: filtro === p ? 'var(--fg)' : 'transparent',
                    color: filtro === p ? 'var(--bg)' : 'var(--fg-mute)',
                    cursor: 'pointer',
                    fontWeight: filtro === p ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Tabela de posições */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--bg-deep)',
                      borderTop: '1px solid var(--line)',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    {[
                      'Produto',
                      'Sub-Produto',
                      'Ativo',
                      'Emissor',
                      'Vencimento',
                      'Qtd.',
                      'Net',
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 12px',
                          textAlign: h === 'Net' || h === 'Qtd.' ? 'right' : 'left',
                          fontFamily: 'var(--f-mono)',
                          fontSize: 9,
                          fontWeight: 500,
                          letterSpacing: '.18em',
                          textTransform: 'uppercase',
                          color: 'var(--fg-faint)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posicoesFiltradas.map((p) => (
                    <tr
                      key={`${p.produto}-${p.ativo}`}
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: cor(p.produto),
                              flexShrink: 0,
                              display: 'inline-block',
                            }}
                          />
                          <span
                            style={{
                              fontFamily: 'var(--f-text)',
                              fontSize: 11,
                              fontWeight: 500,
                              color: 'var(--fg)',
                            }}
                          >
                            {p.produto}
                          </span>
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          fontFamily: 'var(--f-text)',
                          color: 'var(--fg-mute)',
                          fontSize: 11,
                        }}
                      >
                        {p.sub_produto}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          fontFamily: 'var(--f-text)',
                          color: 'var(--fg)',
                          fontSize: 11,
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.ativo}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          fontFamily: 'var(--f-text)',
                          color: 'var(--fg-faint)',
                          fontSize: 11,
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {p.emissor ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          fontFamily: 'var(--f-mono)',
                          color: 'var(--fg-faint)',
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fData(p.data_vencimento)}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          textAlign: 'right',
                          fontFamily: 'var(--f-mono)',
                          color: 'var(--fg-mute)',
                          fontSize: 11,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {p.quantidade.toLocaleString('pt-BR')}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          textAlign: 'right',
                          fontFamily: 'var(--f-mono)',
                          fontWeight: 600,
                          color: 'var(--fg)',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {fBRL(p.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
