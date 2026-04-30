'use client'

import { useState } from 'react'

type ClienteReceita = { id_cliente: number; nome_cliente: string | null; valor: number }

type DeepDiveReceita = {
  produto: string
  label: string
  clientes: ClienteReceita[]
}

type ReceitaProduto = { produto: string; receita: number }

type Props = {
  porProduto: ReceitaProduto[]
  receitaTotal: number
  filterType?: string
  filterValue?: string
}

const PRODUTO_SLUG: Record<string, string> = {
  'Renda Variável': 'rv',
  'Renda Fixa': 'rf',
  COE: 'coe',
  Câmbio: 'cambio',
  'Fee Fixo': 'feefixo',
  Seguros: 'seguros',
  Consórcio: 'consorcio',
  Dominion: 'dominion',
  'Oferta de Fundos': 'oferta_fundos',
}

const RECEITA_COLOR: Record<string, string> = {
  'Renda Variável': '#F59E0B',
  'Renda Fixa': '#3B82F6',
  COE: '#EF4444',
  Câmbio: '#06B6D4',
  'Fee Fixo': '#8B5CF6',
  Seguros: '#10B981',
  Consórcio: '#F97316',
  Dominion: '#6366F1',
  'Oferta de Fundos': '#EC4899',
}

function fBRL(val: number): string {
  const abs = Math.abs(val)
  const pre = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(val: number, total: number): string {
  return total > 0 ? `${((val / total) * 100).toFixed(1).replace('.', ',')}%` : '—'
}

function rColor(p: string): string {
  return RECEITA_COLOR[p] ?? '#B8963E'
}

/* ─── Table cell styles ──────────────────────────────────────────────────── */

const thHead: React.CSSProperties = {
  fontFamily: 'var(--f-mono)',
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--fg-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  padding: '0 0 8px 0',
  textAlign: 'right',
  borderBottom: '1px solid var(--line)',
}

const tdBase: React.CSSProperties = {
  padding: '9px 0',
  verticalAlign: 'middle',
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BlocoReceita({ porProduto, receitaTotal, filterType, filterValue }: Props) {
  const [produtoAberto, setProdutoAberto] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [cache, setCache] = useState<Record<string, DeepDiveReceita>>({})
  const [erro, setErro] = useState<string | null>(null)

  async function handleClick(produto: string) {
    if (produtoAberto === produto) {
      setProdutoAberto(null)
      return
    }
    setProdutoAberto(produto)
    if (cache[produto]) return

    const slug = PRODUTO_SLUG[produto]
    if (!slug) return

    setLoading(produto)
    setErro(null)
    try {
      const qs = new URLSearchParams()
      if (filterType) qs.set('filter_type', filterType)
      if (filterValue) qs.set('filter_value', filterValue)
      const url = `/api/performance/deepdive/receita/${slug}${qs.size ? `?${qs}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { data: DeepDiveReceita }
      setCache((prev) => ({ ...prev, [produto]: json.data }))
    } catch {
      setErro(produto)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-elev)',
        borderRadius: 12,
        marginBottom: 20,
        border: '1px solid var(--line)',
        boxShadow: 'var(--e-float)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-deep)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
            <rect x="0" y="8" width="3" height="6" rx="1" fill="var(--c-gold)" opacity="0.5" />
            <rect x="5" y="5" width="3" height="9" rx="1" fill="var(--c-gold)" opacity="0.7" />
            <rect x="10" y="1" width="4" height="13" rx="1" fill="var(--c-gold)" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Receita por Produto
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--fg)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fBRL(receitaTotal)}
          </span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 9,
              color: 'var(--fg-faint)',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}
          >
            total
          </span>
          <span
            style={{ width: 1, height: 12, background: 'var(--line-strong)', display: 'inline-block' }}
          />
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              color: 'var(--fg-faint)',
              letterSpacing: '.04em',
            }}
          >
            clique para detalhar
          </span>
        </div>
      </div>

      {/* ── Linhas de produto ── */}
      <div>
        {porProduto.map((item, i) => {
          const pct = receitaTotal > 0 ? (item.receita / receitaTotal) * 100 : 0
          const color = rColor(item.produto)
          const isOpen = produtoAberto === item.produto
          const isLoading = loading === item.produto
          const hasErro = erro === item.produto
          const deepdive = cache[item.produto]
          const isLast = i === porProduto.length - 1

          return (
            <div key={item.produto}>
              {/* Linha clicável */}
              <button
                type="button"
                onClick={() => handleClick(item.produto)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 96px 68px 28px',
                  alignItems: 'center',
                  gap: 16,
                  padding: '13px 20px',
                  width: '100%',
                  textAlign: 'left',
                  outline: 'none',
                  cursor: 'pointer',
                  border: 'none',
                  borderLeft: `3px solid ${isOpen ? color : 'transparent'}`,
                  borderBottom: !isLast && !isOpen ? '1px solid var(--line)' : 'none',
                  background: isOpen
                    ? `color-mix(in oklch, ${color} 4%, var(--bg-elev))`
                    : 'transparent',
                  transition: 'background .15s ease, border-color .15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) e.currentTarget.style.background = 'var(--bg-deep)'
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Nome do produto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                      boxShadow: `0 0 0 2px color-mix(in oklch, ${color} 20%, transparent)`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--f-text)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--fg)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.produto}
                  </span>
                </div>

                {/* Barra */}
                <div
                  style={{
                    height: 6,
                    background: `color-mix(in oklch, ${color} 12%, var(--bg-deep))`,
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 99,
                      opacity: 0.85,
                      transition: 'width .4s ease',
                    }}
                  />
                </div>

                {/* Valor */}
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--fg)',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fBRL(item.receita)}
                </span>

                {/* Percentual */}
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fPct(item.receita, receitaTotal)}
                </span>

                {/* Chevron */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isOpen ? color : 'var(--fg-faint)',
                    transition: 'color .15s ease',
                  }}
                >
                  {isLoading ? (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: `1.5px solid ${color}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                  ) : (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      width="14"
                      height="14"
                      aria-hidden="true"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform .2s ease',
                      }}
                    >
                      <polyline points="4,6 8,10 12,6" />
                    </svg>
                  )}
                </div>
              </button>

              {/* ── Painel deepdive ── */}
              {isOpen && (
                <div
                  style={{
                    background: 'var(--bg-deep)',
                    borderLeft: `3px solid ${color}`,
                    borderTop: `1px solid color-mix(in oklch, ${color} 15%, var(--line))`,
                    borderBottom: !isLast ? '1px solid var(--line)' : 'none',
                    padding: '16px 20px 20px 24px',
                  }}
                >
                  {isLoading && (
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--fg-faint)',
                        textAlign: 'center',
                        padding: '12px 0',
                      }}
                    >
                      Carregando…
                    </p>
                  )}
                  {hasErro && (
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--color-negative)',
                        padding: '4px 0',
                      }}
                    >
                      Erro ao carregar detalhes. Tente novamente.
                    </p>
                  )}
                  {deepdive && (
                    <>
                      {/* Deepdive title */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 3,
                            height: 12,
                            borderRadius: 2,
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--f-mono)',
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '.12em',
                            color,
                          }}
                        >
                          Top clientes — {deepdive.label}
                        </span>
                      </div>

                      {/* Tabela */}
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ ...thHead, textAlign: 'left', width: 28 }}>#</th>
                            <th style={{ ...thHead, textAlign: 'left' }}>Cliente</th>
                            <th style={{ ...thHead, textAlign: 'right' }}>Receita</th>
                            <th style={{ ...thHead, textAlign: 'right', width: 100 }}>% produto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deepdive.clientes.map((cli, idx) => {
                            const totalProd = deepdive.clientes.reduce((s, c) => s + c.valor, 0)
                            const pctCli = totalProd > 0 ? (cli.valor / totalProd) * 100 : 0
                            return (
                              <tr
                                key={cli.id_cliente}
                                style={{ borderTop: '1px solid var(--line)' }}
                              >
                                {/* Rank */}
                                <td
                                  style={{
                                    ...tdBase,
                                    width: 28,
                                    fontFamily: 'var(--f-mono)',
                                    fontSize: 10,
                                    color: 'var(--fg-faint)',
                                    paddingRight: 8,
                                  }}
                                >
                                  {idx + 1}
                                </td>

                                {/* Nome */}
                                <td style={{ ...tdBase, paddingRight: 16 }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--f-text)',
                                      fontSize: 12,
                                      fontWeight: 500,
                                      color: 'var(--fg)',
                                      display: 'block',
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {cli.nome_cliente ?? `Cliente ${cli.id_cliente}`}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: 'var(--f-mono)',
                                      fontSize: 10,
                                      color: 'var(--fg-faint)',
                                    }}
                                  >
                                    #{cli.id_cliente}
                                  </span>
                                </td>

                                {/* Receita */}
                                <td
                                  style={{
                                    ...tdBase,
                                    textAlign: 'right',
                                    fontFamily: 'var(--f-mono)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color,
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {fBRL(cli.valor)}
                                </td>

                                {/* % + mini-bar */}
                                <td style={{ ...tdBase, textAlign: 'right', width: 100, paddingLeft: 16 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-end',
                                      gap: 4,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontFamily: 'var(--f-mono)',
                                        fontSize: 11,
                                        color: 'var(--fg-mute)',
                                        fontVariantNumeric: 'tabular-nums',
                                      }}
                                    >
                                      {fPct(cli.valor, totalProd)}
                                    </span>
                                    <div
                                      style={{
                                        width: 64,
                                        height: 3,
                                        background: `color-mix(in oklch, ${color} 12%, var(--bg-deep))`,
                                        borderRadius: 99,
                                      }}
                                    >
                                      <div
                                        style={{
                                          height: '100%',
                                          width: `${pctCli}%`,
                                          background: color,
                                          borderRadius: 99,
                                          opacity: 0.65,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
