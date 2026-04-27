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
  'Renda Fixa': '#3B82F6', 'Fundos': '#8B5CF6', 'Previdência': '#10B981',
  'Renda Variável': '#F59E0B', 'COE': '#EF4444', 'Fundo Imobiliário': '#06B6D4',
  'Off-Shore': '#6366F1', 'Precatorio': '#84CC16', 'Saldo em Conta': '#94A3B8',
  'XP Internacional': '#F97316', 'Compromissadas': '#EC4899', 'Disney': '#A78BFA',
}
const cor = (p: string) => PRODUTO_COLOR[p] ?? '#B8963E'

/* ─── Formatação ─────────────────────────────────────────────────────────── */

function fBRL(val: number): string {
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (val >= 1_000)     return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
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
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData]       = useState<ClienteData | null>(null)
  const [erro, setErro]       = useState<string | null>(null)
  const [filtro, setFiltro]   = useState<string>('Todos')

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
      const json = await res.json() as { data?: ClienteData; error?: string }
      if (!res.ok || !json.data) { setErro(json.error ?? 'Cliente não encontrado'); return }
      if (json.data.posicoes.length === 0) { setErro('Nenhuma posição encontrada para este ID.'); return }
      setData(json.data)
    } catch {
      setErro('Erro ao buscar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 10,
    border: '1px solid rgba(184,150,62,0.12)',
    boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
  }

  const produtos = data ? ['Todos', ...data.breakdown.map(b => b.produto)] : []
  const posicoesFiltradas = data
    ? (filtro === 'Todos' ? data.posicoes : data.posicoes.filter(p => p.produto === filtro))
    : []

  return (
    <div style={{ marginTop: 24 }}>

      {/* ── Título da seção ── */}
      <div style={{ ...card }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid rgba(184,150,62,0.09)', background: '#FDFAF5' }}>
          <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>
            Busca de Carteira por Cliente
          </span>
        </div>

        {/* ── Formulário de busca ── */}
        <div style={{ padding: '20px' }}>
          <form onSubmit={buscar} style={{ display: 'flex', gap: 10, maxWidth: 460 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ID do cliente (ex: 5667)"
              style={{
                flex: 1, padding: '9px 14px', fontSize: 13,
                border: '1px solid rgba(184,150,62,0.25)', borderRadius: 6,
                background: '#FDFAF5', color: '#1A1209', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{
                padding: '9px 20px', fontSize: 13, fontWeight: 600,
                background: loading ? 'rgba(184,150,62,0.4)' : '#1A1209',
                color: '#F6F3ED', border: 'none', borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
          </form>

          {erro && (
            <p style={{ marginTop: 12, fontSize: 13, color: '#dc2626' }}>{erro}</p>
          )}
        </div>

        {/* ── Resultado ── */}
        {data && (
          <>
            {/* Resumo do cliente */}
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(184,150,62,0.05)', borderRadius: 8, border: '1px solid rgba(184,150,62,0.12)', minWidth: 140 }}>
                <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,18,9,0.38)', marginBottom: 4 }}>Cliente</p>
                <p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-lora, serif)', color: '#1A1209' }}>#{data.id_cliente}</p>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(184,150,62,0.05)', borderRadius: 8, border: '1px solid rgba(184,150,62,0.12)', minWidth: 140 }}>
                <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,18,9,0.38)', marginBottom: 4 }}>Patrimônio</p>
                <p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-lora, serif)', color: '#1A1209' }}>{fBRL(data.aum)}</p>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(184,150,62,0.05)', borderRadius: 8, border: '1px solid rgba(184,150,62,0.12)', minWidth: 140 }}>
                <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,18,9,0.38)', marginBottom: 4 }}>Posições</p>
                <p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-lora, serif)', color: '#1A1209' }}>{data.posicoes.length}</p>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(184,150,62,0.05)', borderRadius: 8, border: '1px solid rgba(184,150,62,0.12)', minWidth: 140 }}>
                <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(26,18,9,0.38)', marginBottom: 4 }}>Classes</p>
                <p style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-lora, serif)', color: '#1A1209' }}>{data.breakdown.length}</p>
              </div>
            </div>

            {/* Mini breakdown */}
            <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.breakdown.map(b => (
                <div
                  key={b.produto}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 20,
                    background: `${cor(b.produto)}15`,
                    border: `1px solid ${cor(b.produto)}30`,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: cor(b.produto) }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#1A1209' }}>{b.produto}</span>
                  <span style={{ fontSize: 11, color: cor(b.produto), fontWeight: 600 }}>
                    {fPct(b.total, data.aum)}
                  </span>
                </div>
              ))}
            </div>

            {/* Filtro por produto */}
            <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {produtos.map(p => (
                <button
                  key={p}
                  onClick={() => setFiltro(p)}
                  style={{
                    padding: '4px 12px', fontSize: 11, borderRadius: 20,
                    border: `1px solid ${filtro === p ? '#1A1209' : 'rgba(26,18,9,0.12)'}`,
                    background: filtro === p ? '#1A1209' : 'transparent',
                    color: filtro === p ? '#F6F3ED' : 'rgba(26,18,9,0.5)',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: filtro === p ? 600 : 400,
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
                  <tr style={{ background: '#FDFAF5', borderTop: '1px solid rgba(184,150,62,0.09)', borderBottom: '1px solid rgba(184,150,62,0.09)' }}>
                    {['Produto', 'Sub-Produto', 'Ativo', 'Emissor', 'Vencimento', 'Qtd.', 'Net'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Net' || h === 'Qtd.' ? 'right' : 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(26,18,9,0.38)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posicoesFiltradas.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(184,150,62,0.06)' }}>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: cor(p.produto), flexShrink: 0, display: 'inline-block' }} />
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#1A1209' }}>{p.produto}</span>
                        </span>
                      </td>
                      <td style={{ padding: '9px 12px', color: 'rgba(26,18,9,0.55)', fontSize: 11 }}>{p.sub_produto}</td>
                      <td style={{ padding: '9px 12px', color: '#1A1209', fontSize: 11, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ativo}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(26,18,9,0.5)', fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.emissor ?? '—'}</td>
                      <td style={{ padding: '9px 12px', color: 'rgba(26,18,9,0.5)', fontSize: 11, whiteSpace: 'nowrap' }}>{fData(p.data_vencimento)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', color: 'rgba(26,18,9,0.55)', fontSize: 11 }}>{p.quantidade.toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: '#1A1209', fontSize: 12, whiteSpace: 'nowrap' }}>{fBRL(p.net)}</td>
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
