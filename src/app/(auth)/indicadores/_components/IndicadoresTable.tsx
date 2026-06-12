'use client'

import { useState } from 'react'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type AssessorRow = {
  id:   string
  nome: string
  mtd:  number
  meta?: number
  pct?:  number | null
  ytd?:  number
}

type EquipeRow = {
  equipe:     string
  mtd:        number
  meta:       number
  pct:        number | null
  ytd:        number
  assessores: AssessorRow[]
}

type Props = {
  title:    string
  subtitle: string
  equipes:  EquipeRow[]
  total:    { mtd: number; meta: number; pct: number | null; ytd: number }
  tipo:     'captacao' | 'receita'
}

/* ─── Cores por equipe ───────────────────────────────────────────────────── */

const EQUIPE_COLORS: Record<string, string> = {
  'SMART':     'var(--color-b-500)',
  'PRIVATE':   'var(--c-gold)',
  'RIO PRETO': '#10B981',
  'BRAVO':     '#8B5CF6',
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fBRL(v: number | null | undefined): string {
  if (v == null) return '—'
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(v: number | null | undefined): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(1).replace('.', ',')}%`
}

/* ─── Estilos compartilhados (mesmos tokens do pnl/page.tsx) ─────────────── */

const cardWrap: React.CSSProperties = {
  background:   'var(--bg-elev)',
  borderRadius: 12,
  border:       '1px solid var(--line)',
  boxShadow:    'var(--e-float)',
  overflow:     'hidden',
  marginBottom: 20,
}

const cardHeader: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '13px 20px',
  borderBottom:   '1px solid var(--line)',
  background:     'var(--bg-deep)',
}

const thBase: React.CSSProperties = {
  fontFamily:    'var(--f-mono)',
  fontSize:      11,
  fontWeight:    600,
  color:         'var(--fg-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
  padding:       '8px 14px',
  borderBottom:  '1px solid var(--line)',
  background:    'var(--bg-deep)',
  whiteSpace:    'nowrap',
}

const tdBase: React.CSSProperties = {
  fontFamily:          'var(--f-mono)',
  fontSize:            13,
  padding:             '9px 14px',
  borderBottom:        '1px solid var(--line)',
  color:               'var(--fg)',
  fontFeatureSettings: '"tnum"',
}

/* ─── Sub-componente: barra de progresso ─────────────────────────────────── */

function ProgressBar({ pct }: { pct: number | null | undefined }) {
  const w = Math.min(100, Math.max(0, (pct ?? 0) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <div
        style={{
          width: 52, height: 4, borderRadius: 2,
          background: 'var(--bg-deep)', overflow: 'hidden', flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '100%', width: `${w}%`,
            background: 'var(--c-gold)', borderRadius: 2,
          }}
        />
      </div>
      <span
        style={{
          minWidth: 42, textAlign: 'right',
          color: pct == null
            ? 'var(--fg-faint)'
            : pct >= 1
              ? 'var(--color-positive)'
              : 'var(--fg)',
        }}
      >
        {fPct(pct)}
      </span>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────────────────── */

export function IndicadoresTable({ title, subtitle, equipes, total, tipo }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(equipe: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(equipe)) next.delete(equipe)
      else next.add(equipe)
      return next
    })
  }

  const showYtd = tipo === 'captacao'

  return (
    <div style={cardWrap}>
      {/* Header */}
      <div style={cardHeader}>
        <span
          style={{
            fontFamily:    'var(--f-text)',
            fontSize:      13,
            fontWeight:    600,
            color:         'var(--fg)',
            letterSpacing: '-.01em',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily:    'var(--f-mono)',
            fontSize:      10,
            color:         'var(--fg-faint)',
            letterSpacing: '.04em',
            textTransform: 'uppercase',
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left', minWidth: 140 }}>Equipe</th>
              <th style={{ ...thBase, textAlign: 'right' }}>MTD</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Meta Mês</th>
              <th style={{ ...thBase, textAlign: 'right', minWidth: 120 }}>% Atingido</th>
              {showYtd && <th style={{ ...thBase, textAlign: 'right' }}>YTD</th>}
            </tr>
          </thead>
          <tbody>
            {equipes.map((row) => {
              const isOpen = expanded.has(row.equipe)
              const color  = EQUIPE_COLORS[row.equipe] ?? 'var(--fg-faint)'

              return (
                <>
                  {/* Row da equipe */}
                  <tr
                    key={row.equipe}
                    onClick={() => toggle(row.equipe)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'color-mix(in oklch, var(--fg) 3%, transparent)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                  >
                    <td
                      style={{
                        ...tdBase,
                        textAlign:  'left',
                        fontFamily: 'var(--f-text)',
                        fontWeight: 600,
                        fontSize:   13,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Chevron */}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="12"
                          height="12"
                          style={{
                            color:      'var(--fg-faint)',
                            flexShrink: 0,
                            transform:  isOpen ? 'rotate(90deg)' : 'none',
                            transition: 'transform .15s',
                          }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        {/* Dot colorido */}
                        <div
                          style={{
                            width:       8,
                            height:      8,
                            borderRadius: 2,
                            background:  color,
                            flexShrink:  0,
                          }}
                        />
                        {row.equipe}
                      </div>
                    </td>
                    <td
                      style={{
                        ...tdBase,
                        textAlign: 'right',
                        color:     row.mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                      }}
                    >
                      {fBRL(row.mtd)}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)' }}>
                      {fBRL(row.meta)}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      <ProgressBar pct={row.pct} />
                    </td>
                    {showYtd && (
                      <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)', fontSize: 12 }}>
                        {fBRL(row.ytd)}
                      </td>
                    )}
                  </tr>

                  {/* Rows de assessores (quando expandido) */}
                  {isOpen && row.assessores.map((a) => (
                    <tr key={a.id} style={{ background: 'var(--bg-deep)' }}>
                      <td
                        style={{
                          ...tdBase,
                          textAlign:   'left',
                          fontFamily:  'var(--f-text)',
                          fontWeight:  400,
                          fontSize:    12,
                          paddingLeft: 40,
                          color:       'var(--fg-mute)',
                        }}
                      >
                        {a.nome}
                      </td>
                      <td
                        style={{
                          ...tdBase,
                          textAlign: 'right',
                          fontSize:  12,
                          color:     a.mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                        }}
                      >
                        {fBRL(a.mtd)}
                      </td>
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12, color: 'var(--fg-faint)' }}>
                        {a.meta != null ? fBRL(a.meta) : '—'}
                      </td>
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12 }}>
                        {a.pct != null ? <ProgressBar pct={a.pct} /> : <span style={{ color: 'var(--fg-faint)' }}>—</span>}
                      </td>
                      {showYtd && (
                        <td style={{ ...tdBase, textAlign: 'right', fontSize: 12, color: 'var(--fg-faint)' }}>
                          {a.ytd != null ? fBRL(a.ytd) : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </>
              )
            })}

            {/* Row total */}
            <tr
              style={{
                background: 'var(--bg-deep)',
                borderTop:  '2px solid var(--line-strong)',
              }}
            >
              <td
                style={{
                  ...tdBase,
                  textAlign:   'left',
                  fontFamily:  'var(--f-text)',
                  fontWeight:  700,
                  fontSize:    13,
                  borderBottom: 'none',
                }}
              >
                Total
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:   'right',
                  fontWeight:  700,
                  borderBottom: 'none',
                  color:        total.mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                }}
              >
                {fBRL(total.mtd)}
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:   'right',
                  borderBottom: 'none',
                  color:        'var(--fg-mute)',
                }}
              >
                {fBRL(total.meta)}
              </td>
              <td style={{ ...tdBase, textAlign: 'right', borderBottom: 'none' }}>
                <ProgressBar pct={total.pct} />
              </td>
              {showYtd && (
                <td
                  style={{
                    ...tdBase,
                    textAlign:   'right',
                    borderBottom: 'none',
                    color:        'var(--fg-mute)',
                    fontSize:    12,
                  }}
                >
                  {fBRL(total.ytd)}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
