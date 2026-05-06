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

const PAGE_SIZE = 100

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

/* ─── Design tokens ──────────────────────────────────────────────────────── */

const SUIT_STYLE: Record<string, React.CSSProperties> = {
  'Conservador':     { background: 'color-mix(in oklch, var(--color-b-500) 12%, var(--bg-elev))', color: 'var(--color-b-500)'    },
  'Moderado':        { background: 'color-mix(in oklch, var(--c-gold) 15%, var(--bg-elev))',      color: 'var(--c-gold)'         },
  'Agressivo':       { background: 'var(--color-negative-bg)',                                     color: 'var(--color-negative)' },
  'Super Agressivo': { background: 'color-mix(in oklch, #8B5CF6 12%, var(--bg-elev))',            color: '#8B5CF6'               },
}

const AVATAR_COLORS = ['#2D5FA0', '#B8963E', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4']
function avatarColor(id: number): string { return AVATAR_COLORS[id % AVATAR_COLORS.length]! }

/* ─── Tipos de filtro ────────────────────────────────────────────────────── */

type StatusFilter = 'todos' | 'ativos' | 'inativos'
type TipoFilter   = 'todos' | 'pf'    | 'pj'

/* ─── Export CSV ─────────────────────────────────────────────────────────── */

function exportCSV(clientes: Cliente[], isAdmin: boolean) {
  const headers = [
    'Código', 'Nome', 'Email', 'Telefone', 'Tipo', 'Status',
    'AUM (R$)', 'Suitability',
    ...(isAdmin ? ['Assessor', 'Equipe'] : []),
  ]
  const rows = clientes.map((c) => [
    c.id_cliente,
    c.nome_cliente ?? '',
    c.email_cliente ?? '',
    c.telefone ?? '',
    c.tipo_pessoa,
    c.status,
    c.net_em_m.toFixed(2).replace('.', ','),
    c.suitability ?? '',
    ...(isAdmin ? [c.nome_assessor ?? '', c.equipe ?? ''] : []),
  ])

  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`
  const csv = '﻿' + [headers, ...rows].map((r) => r.map(escape).join(';')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clientes-nobel-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function ClientesTable({ clientes, isAdmin }: Props) {
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('ativos')
  const [tipoFilter, setTipoFilter]       = useState<TipoFilter>('todos')
  const [page, setPage]                   = useState(1)
  const [hoveredId, setHoveredId]         = useState<number | null>(null)

  /* Reset page ao mudar qualquer filtro */
  function setStatus(v: StatusFilter) { setStatusFilter(v); setPage(1) }
  function setTipo(v: TipoFilter)     { setTipoFilter(v);   setPage(1) }
  function setQuery(v: string)        { setSearch(v);        setPage(1) }

  /* Filtros compostos */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return clientes.filter((c) => {
      if (statusFilter === 'ativos'   && c.status !== 'ATIVO')   return false
      if (statusFilter === 'inativos' && c.status !== 'INATIVO') return false
      if (tipoFilter   === 'pf'       && c.tipo_pessoa !== 'PF') return false
      if (tipoFilter   === 'pj'       && c.tipo_pessoa !== 'PJ') return false
      if (!q) return true
      return (
        (c.nome_cliente  ?? '').toLowerCase().includes(q) ||
        (c.email_cliente ?? '').toLowerCase().includes(q) ||
        (c.nome_assessor ?? '').toLowerCase().includes(q) ||
        String(c.id_cliente).includes(q)
      )
    })
  }, [clientes, search, statusFilter, tipoFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
      background:  active ? 'var(--fg)'      : 'transparent',
      color:       active ? 'var(--bg)'      : 'var(--fg-mute)',
      borderColor: active ? 'var(--fg)'      : 'var(--line)',
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
            onChange={(e) => setQuery(e.target.value)}
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
            <button key={key} onClick={() => setStatus(key)} style={pillBtn(statusFilter === key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'var(--line)' }} />

        {/* Filtro Tipo */}
        <div style={{ display: 'flex', gap: 3 }}>
          {TIPO_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setTipo(key)} style={pillBtn(tipoFilter === key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'var(--line)' }} />

        {/* Export */}
        <button
          onClick={() => exportCSV(filtered, isAdmin)}
          title="Exportar lista filtrada para Excel (.csv)"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: '.10em', textTransform: 'uppercase',
            padding: '5px 12px', borderRadius: 6,
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--color-positive)',
            cursor: 'pointer',
            transition: 'all .12s',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
            <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/>
          </svg>
          Excel
        </button>

        <span style={{ ...mono9, color: 'var(--fg-faint)', marginLeft: 'auto' }}>
          {filtered.length.toLocaleString('pt-BR')} cliente{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Tabela ───────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)' }}>
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
            {paginated.map((c, i) => {
              const nome    = c.nome_cliente ?? `Cliente ${c.id_cliente}`
              const ini     = initials(c.nome_cliente)
              const color   = avatarColor(c.id_cliente)
              const isAtivo = c.status === 'ATIVO'
              const isPJ    = c.tipo_pessoa === 'PJ'
              const suit    = SUIT_STYLE[c.suitability ?? '']
              const isLast  = i === paginated.length - 1
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
                      background: isAtivo ? 'var(--color-positive-bg)' : 'var(--bg-deep)',
                      color:      isAtivo ? 'var(--color-positive)'    : 'var(--fg-faint)',
                    }}>
                      {isAtivo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>

                  {/* AUM */}
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600,
                      color: c.net_em_m > 0 ? 'var(--fg)' : 'var(--fg-faint)',
                      fontFeatureSettings: '"tnum"',
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
                      <p style={{ fontFamily: 'var(--f-text)', fontSize: 12, color: 'var(--fg-mute)', whiteSpace: 'nowrap' }}>
                        {c.nome_assessor ?? '—'}
                      </p>
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
              <p style={{ fontFamily: 'var(--f-text)', fontSize: 12, color: 'var(--fg-faint)' }}>
                Tente ajustar os filtros ou a busca
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Paginação ────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid var(--line)',
          background: 'var(--bg-deep)',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {/* Info */}
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)',
            letterSpacing: '.10em', textTransform: 'uppercase',
          }}>
            {((currentPage - 1) * PAGE_SIZE + 1).toLocaleString('pt-BR')}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length).toLocaleString('pt-BR')}
            {' '}de{' '}
            {filtered.length.toLocaleString('pt-BR')}
          </span>

          {/* Controles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Anterior */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid var(--line)',
                background: 'transparent',
                color: currentPage === 1 ? 'var(--fg-faint)' : 'var(--fg-mute)',
                cursor: currentPage === 1 ? 'default' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Anterior
            </button>

            {/* Páginas numéricas */}
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true
                  return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                })
                .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('…')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === '…' ? (
                    <span key={`ellipsis-${idx}`} style={{
                      fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)',
                      padding: '5px 4px', lineHeight: 1,
                    }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      style={{
                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
                        padding: '5px 9px', borderRadius: 6,
                        border: '1px solid',
                        cursor: 'pointer',
                        minWidth: 30,
                        background:  currentPage === p ? 'var(--fg)'   : 'transparent',
                        color:       currentPage === p ? 'var(--bg)'   : 'var(--fg-mute)',
                        borderColor: currentPage === p ? 'var(--fg)'   : 'var(--line)',
                      }}
                    >
                      {p}
                    </button>
                  )
                )
              }
            </div>

            {/* Próxima */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid var(--line)',
                background: 'transparent',
                color: currentPage === totalPages ? 'var(--fg-faint)' : 'var(--fg-mute)',
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
              }}
            >
              Próxima
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
