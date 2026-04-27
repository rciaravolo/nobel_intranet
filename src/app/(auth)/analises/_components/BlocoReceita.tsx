'use client'

import { useState } from 'react'

type ClienteReceita = { id_cliente: number; nome_cliente: string | null; valor: number }

type DeepDiveReceita = {
  produto: string
  label:   string
  clientes: ClienteReceita[]
}

type ReceitaProduto = { produto: string; receita: number }

type Props = {
  porProduto:   ReceitaProduto[]
  receitaTotal: number
}

const PRODUTO_SLUG: Record<string, string> = {
  'Renda Variável':   'rv',
  'Renda Fixa':       'rf',
  'COE':              'coe',
  'Câmbio':           'cambio',
  'Fee Fixo':         'feefixo',
  'Seguros':          'seguros',
  'Consórcio':        'consorcio',
  'Dominion':         'dominion',
  'Oferta de Fundos': 'oferta_fundos',
}

const RECEITA_COLOR: Record<string, string> = {
  'Renda Variável':   '#F59E0B',
  'Renda Fixa':       '#3B82F6',
  'COE':              '#EF4444',
  'Câmbio':           '#06B6D4',
  'Fee Fixo':         '#8B5CF6',
  'Seguros':          '#10B981',
  'Consórcio':        '#F97316',
  'Dominion':         '#6366F1',
  'Oferta de Fundos': '#EC4899',
}

function fBRL(val: number): string {
  const abs = Math.abs(val)
  const pre = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(val: number, total: number): string {
  return total > 0 ? `${((val / total) * 100).toFixed(1).replace('.', ',')}%` : '—'
}

function rColor(p: string): string {
  return RECEITA_COLOR[p] ?? '#B8963E'
}

export function BlocoReceita({ porProduto, receitaTotal }: Props) {
  const [produtoAberto, setProdutoAberto] = useState<string | null>(null)
  const [loading, setLoading]             = useState<string | null>(null)
  const [cache, setCache]                 = useState<Record<string, DeepDiveReceita>>({})
  const [erro, setErro]                   = useState<string | null>(null)

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
      const res = await fetch(`/api/performance/deepdive/receita/${slug}`)
      if (!res.ok) throw new Error()
      const json = await res.json() as { data: DeepDiveReceita }
      setCache(prev => ({ ...prev, [produto]: json.data }))
    } catch {
      setErro(produto)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 10, marginBottom: 20,
      border: '1px solid rgba(184,150,62,0.12)',
      boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(184,150,62,0.09)', background: '#FDFAF5',
        borderRadius: '10px 10px 0 0',
      }}>
        <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>
          Receita por Produto
        </span>
        <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)' }}>
          {fBRL(receitaTotal)} total · clique para detalhar
        </span>
      </div>

      {/* Linhas */}
      <div style={{ padding: '8px 0' }}>
        {porProduto.map((item, i) => {
          const pct      = receitaTotal > 0 ? (item.receita / receitaTotal) * 100 : 0
          const color    = rColor(item.produto)
          const isOpen   = produtoAberto === item.produto
          const isLoading = loading === item.produto
          const hasErro  = erro === item.produto
          const deepdive = cache[item.produto]

          return (
            <div key={item.produto}>
              {/* Linha clicável */}
              <div
                onClick={() => handleClick(item.produto)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 100px 60px 22px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 16px',
                  borderBottom: (!isOpen && i < porProduto.length - 1) ? '1px solid rgba(184,150,62,0.06)' : 'none',
                  cursor: 'pointer',
                  borderLeft: isOpen ? `3px solid ${color}` : '3px solid transparent',
                  background: isOpen ? `rgba(${hexToRgb(color)}, 0.03)` : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isOpen) e.currentTarget.style.background = 'rgba(184,150,62,0.03)'
                }}
                onMouseLeave={e => {
                  if (!isOpen) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>{item.produto}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(26,18,9,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, opacity: 0.85 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1209', textAlign: 'right' }}>
                  {fBRL(item.receita)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color, textAlign: 'right' }}>
                  {fPct(item.receita, receitaTotal)}
                </span>
                <span style={{ fontSize: 12, color: isOpen ? color : 'rgba(26,18,9,0.25)', textAlign: 'center' }}>
                  {isLoading ? '·' : isOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Painel deepdive inline */}
              {isOpen && (
                <div style={{
                  background: '#FDFAF5',
                  borderTop: `1px solid rgba(${hexToRgb(color)}, 0.12)`,
                  borderBottom: i < porProduto.length - 1 ? '1px solid rgba(184,150,62,0.06)' : 'none',
                  padding: '16px 24px 20px',
                }}>
                  {isLoading && (
                    <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.38)', textAlign: 'center', padding: '8px 0' }}>
                      Carregando…
                    </p>
                  )}
                  {hasErro && (
                    <p style={{ fontSize: 12, color: '#dc2626' }}>
                      Erro ao carregar detalhes. Tente novamente.
                    </p>
                  )}
                  {deepdive && (
                    <>
                      <p style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color, marginBottom: 12,
                      }}>
                        Top clientes — {deepdive.label}
                      </p>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textAlign: 'left', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              #
                            </th>
                            <th style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textAlign: 'left', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Cliente
                            </th>
                            <th style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textAlign: 'right', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Receita
                            </th>
                            <th style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textAlign: 'right', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              % do produto
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {deepdive.clientes.map((cli, idx) => {
                            const totalProd = deepdive.clientes.reduce((s, c) => s + c.valor, 0)
                            return (
                              <tr key={cli.id_cliente} style={{ borderTop: '1px solid rgba(184,150,62,0.07)' }}>
                                <td style={{ padding: '7px 8px 7px 0', fontSize: 11, color: 'rgba(26,18,9,0.35)', width: 24 }}>
                                  {idx + 1}
                                </td>
                                <td style={{ padding: '7px 0' }}>
                                  <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1209', display: 'block' }}>
                                    {cli.nome_cliente ?? `Cliente ${cli.id_cliente}`}
                                  </span>
                                  <span style={{ fontSize: 10, color: 'rgba(26,18,9,0.35)' }}>
                                    #{cli.id_cliente}
                                  </span>
                                </td>
                                <td style={{ padding: '7px 0', textAlign: 'right', fontSize: 13, fontWeight: 600, color }}>
                                  {fBRL(cli.valor)}
                                </td>
                                <td style={{ padding: '7px 0', textAlign: 'right', fontSize: 12, color: 'rgba(26,18,9,0.45)' }}>
                                  {fPct(cli.valor, totalProd)}
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
    </div>
  )
}

// Converte hex para rgb para uso em rgba()
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r},${g},${b}`
}
