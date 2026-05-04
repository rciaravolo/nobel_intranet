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

/* ─── Formatters ─────────────────────────────────────────────────────────── */

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

/* ─── Cores via CSS vars (sem hardcode de brand colors) ──────────────────── */

const SUIT_STYLE: Record<string, React.CSSProperties> = {
  'Conservador':     { background: 'color-mix(in oklch, var(--color-b-500) 12%, var(--bg-elev))', color: 'var(--color-b-500)' },
  'Moderado':        { background: 'color-mix(in oklch, var(--c-gold) 15%, var(--bg-elev))',      color: 'var(--c-gold)'       },
  'Agressivo':       { background: 'var(--neg-bg)',                                                color: 'var(--neg-fg)'       },
  'Super Agressivo': { background: 'color-mix(in oklch, #8B5CF6 12%, var(--bg-elev))',            color: '#8B5CF6'             },
}

const AVATAR_COLORS = ['#2D5FA0', '#B8963E', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4']
function avatarColor(id: number): string { return AVATAR_COLORS[id % AVATAR_COLORS.length]! }

/* ─── Tipos de filtro separados ──────────────────────────────────────────── */

type StatusFilter = 'todos' | 'ativos' | 'inativos'
type TipoFilter   = 'todos' | 'pf'    | 'pj'

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function ClientesTable({ clientes, isAdmin }: Props) {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativos')
  const [tipoFilter, setTipoFilter]   = useState<TipoFilter>('todos')
  const [hoveredId, setHoveredId]     = useState<number | null>(null)

  /* Filtros compostos — status E tipo são independentes */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return clientes.filter((c) => {
      if (statusFilter === 'ativos'   && c.status !== 'ATIVO')   return false
      if (statusFilter === 'inativos' && c.status !== 'INATIVO') return false
      if (tipoFilter   === 'pf'       && c.tipo_pessoa !== 'PF') return false
      if (tipoFilter   === 'pj'       && c.tipo_pessoa !== 'PJ') return false
      if (!q) return true
      return (
        (c.nome_cliente   ?? '').toLowerCase().includes(q) ||
        (c.email_cliente  ?? '').toLowerCase().includes(q) ||
        (c.nome_assessor  ?? '').toLowerCase().includes(q) ||
        String(c.id_cliente).includes(q)
      )
    })
  }, [clientes, search, statusFilter, tipoFilter])

  /* ─── Estilos base ───────────────────────────────────────────────────── */

  const mono9: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 9,
    letterSpacing: '.12em', textTransform: 'uppercase',
  }

  function pillBtn(active: boolean): React.CSSProperties {
    return {
      fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
      letterSpacing: '.10em', textTransform: 'uppercase',
      padding: '5px 12px', borderRadius: 6,
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all .12s',
      background:   active ? 'var(--fg)'   : 'transparent',
      color:        active ? 'var(--bg)'   : 'var(--fg-mute)',
      borderColor:  active ? 'var(--fg)'   : 'var(--line)',
    }
  }

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'todos',    label: 'Todos'    },
    { key: 'ativos',   label: 'Ativos'   },
    { key: 'inativos', label: 'Inativos' },
  ]

  const TIPO_FILTERS: { key: TipoFilter; label: string }[] = [
    { key: 'todos', label: 'PF + PJ' },
    { key: 'pf',    label: 'PF'      },
    { key: 'pj',    label: 'PJ'      },
  ]

  const COLS = ['Cliente', 'Tipo', 'Status', 'AUM', 'Suitability', ...(isAdmin ? ['Assessor'] : [])]

  return (
    <div style={{
      background: 'var(--bg-elev)',
      border: '1px solid var(--line)',
      borderRadius: 12,
      boxShadow: 'var(--e-float)',
      overflow: 'hidden',
    }}>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg-deep)',
        flexWrap: 'wrap',
      }}>

        {/* Busca */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="1.5"
            width="13" height="13"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, assessor ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              fontFamily: 'var(--f-text)', fontSize: 13, color: 'var(--fg)',
              background: 'var(--bg-elev)', border: '1px solid var(--line)',
              borderRadius: 6, outline: 'none',
            }}
          />
        </div>

        {/* Filtro Status */}
        <div style={{ display: 'flex', gap: 3 }}>
          {STATUS_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)} style={pillBtn(statusFilter === key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'var(--line)' }} />

        {/* Filtro Tipo */}
        <div style={{ display: 'flex', gap: 3 }}>
          {TIPO_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setTipoFilter(key)} style={pillBtn(tipoFilter === key)}>
              {label}
            </button>
          ))}
        </div>

        <span style={{ ...mono9, color: 'var(--fg-faint)', marginLeft: 'auto' }}>
          {filtered.length.toLocaleString('pt-BR')} cliente{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Tabela ───────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {COLS.map((h) => (
                <th key={h} style={{
                  ...mono9, color: 'var(--fg-faint)', fontWeight: 500,
                  padding: '9px 16px',
                  textAlign: h === 'AUM' ? 'right' : 'left',
                  borderBottom: '1px solid var(--line)',
                  whiteSpace: 'nowrap',
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
              const isPJ    = c.tipo_pessoa === 'PJ'
              const suit    = SUIT_STYLE[c.suitability ?? '']
              const isLast  = i === Math.min(filtered.length, 300) - 1
              const hovered = hoveredId === c.id_cliente

              return (
                <tr
                  key={c.id_cliente}
                  onMouseEnter={() => setHoveredId(c.id_cliente)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--line)',
                    background: hovered
                      ? 'color-mix(in oklch, var(--c-gold) 3%, var(--bg-elev))'
                      : 'transparent',
                    transition: 'background .12s',
                  }}
                >
                  {/* Cliente */}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: color, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {ini}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 500, color: 'var(--fg)',
                          lineHeight: 1.3, whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280,
                        }}>
                          {nome}
                        </p>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--fg-faint)', letterSpacing: '.06em', marginTop: 2 }}>
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
                      background: isPJ
                        ? 'color-mix(in oklch, var(--c-gold) 15%, var(--bg-elev))'
                        : 'color-mix(in oklch, var(--color-b-500) 12%, var(--bg-elev))',
                      color: isPJ ? 'var(--c-gold)' : 'var(--color-b-500)',
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
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600,
                      color: c.net_em_m > 0 ? 'var(--fg)' : 'var(--fg-faint)',
                    }}>
                      {c.net_em_m > 0 ? fBRL(c.net_em_m) : '—'}
                    </span>
                  </td>

                  {/* Suitability */}
                  <td style={{ padding: '10px 16px' }}>
                    {suit && c.suitability && c.suitability !== 'Não Preenchido' ? (
                      <span style={{ ...mono9, fontWeight: 600, padding: '2px 8px', borderRadius: 4, ...suit }}>
                        {c.suitability}
                      </span>
                    ) : (
                      <span style={{ ...mono9, color: 'var(--fg-faint)' }}>—</span>
                    )}
                  </td>

                  {/* Assessor — apenas admin/master */}
                  {isAdmin && (
                    <td style={{ padding: '10px 16px' }}>
                      <p style={{ fontSize: 12, color: 'var(--fg-mute)', whiteSpace: 'nowrap' }}>{c.nome_assessor ?? '—'}</p>
                      {c.equipe && (
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--fg-faint)', letterSpacing: '.06em', marginTop: 2 }}>
                          {c.equipe}
                        </p>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Estado vazio */}
        {filtered.length === 0 && (
          <div style={{
            padding: '56px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="1.2" width="32" height="32">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Nenhum cliente encontrado
            </p>
            {search && (
              <p style={{ fontSize: 12, color: 'var(--fg-faint)' }}>
                Tente ajustar os filtros ou a busca
              </p>
            )}
          </div>
        )}

        {/* Aviso de truncamento */}
        {filtered.length > 300 && (
          <div style={{
            padding: '11px 20px', borderTop: '1px solid var(--line)',
            background: 'var(--bg-deep)',
            fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)',
            letterSpacing: '.06em', textAlign: 'center',
          }}>
            Exibindo 300 de {filtered.length.toLocaleString('pt-BR')} resultados — refine a busca para ver mais
          </div>
        )}
      </div>
    </div>
  )
}
