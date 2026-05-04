'use client'

import { useMemo, useState } from 'react'

export type Cliente = {
  id_cliente: number
  status: string
  tipo_pessoa: string
  net_em_m: number
  afd_ajustada: number
  nome_assessor: string | null
  equipe: string | null
  nome_cliente: string | null
  suitability: string | null
  email_cliente: string | null
  telefone: string | null
}

type Props = { clientes: Cliente[]; isAdmin: boolean }

function fBRL(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (v >= 1_000_000)     return `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (v >= 1_000)         return `R$ ${Math.round(v / 1_000)}K`
  return `R$ ${v.toFixed(0)}`
}

function initials(nome: string | null): string {
  if (!nome) return '?'
  const parts = nome.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

const SUIT_COLOR: Record<string, { bg: string; fg: string }> = {
  'Conservador':      { bg: '#EFF6FF', fg: '#1D4ED8' },
  'Moderado':         { bg: '#FFFBEB', fg: '#92400E' },
  'Agressivo':        { bg: '#FEF2F2', fg: '#991B1B' },
  'Super Agressivo':  { bg: '#FDF4FF', fg: '#7E22CE' },
}

const AVATAR_COLORS = ['#2D5FA0','#B8963E','#10B981','#8B5CF6','#EF4444','#F97316','#06B6D4']
function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]!
}

type Filter = 'todos' | 'ativos' | 'inativos' | 'pf' | 'pj'

export function ClientesTable({ clientes, isAdmin }: Props) {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<Filter>('ativos')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return clientes.filter((c) => {
      if (filter === 'ativos'   && c.status !== 'ATIVO')   return false
      if (filter === 'inativos' && c.status !== 'INATIVO') return false
      if (filter === 'pf' && c.tipo_pessoa !== 'PF') return false
      if (filter === 'pj' && c.tipo_pessoa !== 'PJ') return false
      if (!q) return true
      return (
        (c.nome_cliente ?? '').toLowerCase().includes(q) ||
        (c.email_cliente ?? '').toLowerCase().includes(q) ||
        String(c.id_cliente).includes(q)
      )
    })
  }, [clientes, search, filter])

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'todos',    label: 'Todos'    },
    { key: 'ativos',   label: 'Ativos'   },
    { key: 'inativos', label: 'Inativos' },
    { key: 'pf',       label: 'PF'       },
    { key: 'pj',       label: 'PJ'       },
  ]

  const mono9: React.CSSProperties = { fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase' }

  return (
    <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="1.5" width="13" height="13"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              fontFamily: 'var(--f-text)', fontSize: 13, color: 'var(--fg)',
              background: 'var(--bg-elev)', border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)', outline: 'none',
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '.10em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: 'var(--r-md)',
                border: '1px solid',
                cursor: 'pointer',
                background: filter === key ? 'var(--fg)' : 'transparent',
                color:      filter === key ? 'var(--bg)' : 'var(--fg-mute)',
                borderColor: filter === key ? 'var(--fg)' : 'var(--line)',
                transition: 'all .15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <span style={{ ...mono9, color: 'var(--fg-faint)', marginLeft: 'auto' }}>
          {filtered.length.toLocaleString('pt-BR')} cliente{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Cliente', 'Tipo', 'Status', 'AUM', 'Suitability', ...(isAdmin ? ['Assessor'] : [])].map((h) => (
                <th key={h} style={{
                  ...mono9, color: 'var(--fg-faint)', fontWeight: 500,
                  padding: '8px 16px', textAlign: h === 'AUM' ? 'right' : 'left',
                  borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 300).map((c, i) => {
              const nome    = c.nome_cliente ?? `Cliente ${c.id_cliente}`
              const ini     = initials(c.nome_cliente)
              const color   = avatarColor(c.id_cliente)
              const isAtivo = c.status === 'ATIVO'
              const suit    = SUIT_COLOR[c.suitability ?? '']
              const isPJ    = c.tipo_pessoa === 'PJ'

              return (
                <tr key={c.id_cliente} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}
                  className="news-item">
                  {/* Cliente */}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {ini}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', lineHeight: 1.3 }}>{nome}</p>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--fg-faint)', letterSpacing: '.06em', marginTop: 1 }}>
                          #{c.id_cliente}{c.email_cliente ? ` · ${c.email_cliente}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      ...mono9, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 4,
                      background: isPJ ? '#FFF7ED' : '#EFF6FF',
                      color:      isPJ ? '#C2410C' : '#1D4ED8',
                    }}>
                      {isPJ ? 'PJ' : 'PF'}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      ...mono9, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 4,
                      background: isAtivo ? 'var(--pos-bg)' : 'var(--bg-deep)',
                      color:      isAtivo ? 'var(--pos-fg)' : 'var(--fg-faint)',
                    }}>
                      {isAtivo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>

                  {/* AUM */}
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                      {fBRL(c.net_em_m)}
                    </span>
                  </td>

                  {/* Suitability */}
                  <td style={{ padding: '10px 16px' }}>
                    {c.suitability && c.suitability !== 'Não Preenchido' && suit ? (
                      <span style={{
                        ...mono9, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 4,
                        background: suit.bg, color: suit.fg,
                      }}>
                        {c.suitability}
                      </span>
                    ) : (
                      <span style={{ ...mono9, color: 'var(--fg-faint)' }}>—</span>
                    )}
                  </td>

                  {/* Assessor (apenas admin/master) */}
                  {isAdmin && (
                    <td style={{ padding: '10px 16px' }}>
                      <p style={{ fontSize: 12, color: 'var(--fg-mute)' }}>{c.nome_assessor ?? '—'}</p>
                      {c.equipe && (
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--fg-faint)', letterSpacing: '.06em', marginTop: 1 }}>{c.equipe}</p>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '.06em' }}>
            Nenhum cliente encontrado
          </div>
        )}
        {filtered.length > 300 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--bg)', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.06em', textAlign: 'center' }}>
            Exibindo 300 de {filtered.length.toLocaleString('pt-BR')} resultados — refine a busca para ver mais
          </div>
        )}
      </div>
    </div>
  )
}
