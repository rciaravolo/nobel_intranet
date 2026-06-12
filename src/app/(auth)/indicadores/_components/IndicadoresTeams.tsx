'use client'

import { useState } from 'react'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export type EquipeUnificada = {
  equipe:   string
  cap_mtd:  number
  cap_meta: number
  cap_pct:  number | null
  cap_ytd:  number
  rec_mtd:  number
  rec_meta: number
  rec_pct:  number | null
}

type AssessorDrill = {
  id:       string
  nome:     string
  cap_mtd:  number
  cap_meta: number
  cap_pct:  number | null
  rec_mtd:  number
}

type DrillState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; assessores: AssessorDrill[] }
  | { status: 'error' }

type Props = {
  equipes: EquipeUnificada[]
  total:   EquipeUnificada
  mesISO:  string
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

/* ─── Estilos compartilhados ─────────────────────────────────────────────── */

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

/* ─── ProgressBar ────────────────────────────────────────────────────────── */

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

/* ─── SkeletonRows ───────────────────────────────────────────────────────── */

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <tr key={i} style={{ background: 'var(--bg-deep)' }}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} style={{ ...tdBase, borderBottom: '1px solid var(--line)' }}>
              <div
                style={{
                  height: 10, borderRadius: 4,
                  background: 'color-mix(in oklch, var(--fg) 8%, transparent)',
                  width: ci === 0 ? 120 : 60,
                  marginLeft: ci === 0 ? 40 : 'auto',
                  marginRight: ci === 0 ? undefined : 0,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/* ─── Componente principal ───────────────────────────────────────────────── */

export function IndicadoresTeams({ equipes, total, mesISO }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [drillData, setDrillData] = useState<Record<string, DrillState>>({})

  function getMesLabel(iso: string): string {
    return new Date(`${iso}-15`).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric', timeZone: 'UTC',
    })
  }

  async function toggle(equipe: string) {
    const isOpen = expanded.has(equipe)

    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(equipe)) next.delete(equipe)
      else next.add(equipe)
      return next
    })

    // Se estamos abrindo e ainda não carregamos o drill, faz o fetch lazy
    if (!isOpen && (!drillData[equipe] || drillData[equipe].status === 'idle' || drillData[equipe].status === 'error')) {
      setDrillData((prev) => ({ ...prev, [equipe]: { status: 'loading' } }))
      try {
        const res = await fetch(`/api/pnl/indicadores/drill?equipe=${encodeURIComponent(equipe)}`)
        if (!res.ok) throw new Error(`status ${res.status}`)
        const json = (await res.json()) as {
          data: { equipe: string; mesISO: string; assessores: AssessorDrill[] }
        }
        setDrillData((prev) => ({
          ...prev,
          [equipe]: { status: 'loaded', assessores: json.data.assessores },
        }))
      } catch {
        setDrillData((prev) => ({ ...prev, [equipe]: { status: 'error' } }))
      }
    }
  }

  const COL_COUNT = 8 // Equipe | Cap MTD | Cap Meta | % Cap | Cap YTD | Rec MTD | Rec Meta | % Rec

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
          Indicadores por Equipe
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
          {mesISO ? `MTD vs Meta — ${getMesLabel(mesISO)}` : 'MTD vs Meta'}
        </span>
      </div>

      {/* Tabela unificada */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left', minWidth: 150 }}>Equipe</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Cap MTD</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Cap Meta</th>
              <th style={{ ...thBase, textAlign: 'right', minWidth: 130 }}>% Cap</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Cap YTD</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Rec MTD</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Rec Meta</th>
              <th style={{ ...thBase, textAlign: 'right', minWidth: 130 }}>% Rec</th>
            </tr>
          </thead>
          <tbody>
            {equipes.map((row) => {
              const isOpen = expanded.has(row.equipe)
              const color  = EQUIPE_COLORS[row.equipe] ?? 'var(--fg-faint)'
              const drill  = drillData[row.equipe] ?? { status: 'idle' }

              return (
                <>
                  {/* Row da equipe */}
                  <tr
                    key={row.equipe}
                    onClick={() => toggle(row.equipe)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        'color-mix(in oklch, var(--fg) 3%, transparent)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    {/* Equipe */}
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
                        <div
                          style={{
                            width: 8, height: 8,
                            borderRadius: 2,
                            background:   color,
                            flexShrink:   0,
                          }}
                        />
                        {row.equipe}
                      </div>
                    </td>

                    {/* Cap MTD */}
                    <td
                      style={{
                        ...tdBase,
                        textAlign: 'right',
                        color: row.cap_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                      }}
                    >
                      {fBRL(row.cap_mtd)}
                    </td>

                    {/* Cap Meta */}
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)' }}>
                      {fBRL(row.cap_meta)}
                    </td>

                    {/* % Cap */}
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      <ProgressBar pct={row.cap_pct} />
                    </td>

                    {/* Cap YTD */}
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)', fontSize: 12 }}>
                      {fBRL(row.cap_ytd)}
                    </td>

                    {/* Rec MTD */}
                    <td
                      style={{
                        ...tdBase,
                        textAlign: 'right',
                        color: row.rec_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                      }}
                    >
                      {fBRL(row.rec_mtd)}
                    </td>

                    {/* Rec Meta */}
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)' }}>
                      {fBRL(row.rec_meta)}
                    </td>

                    {/* % Rec */}
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      <ProgressBar pct={row.rec_pct} />
                    </td>
                  </tr>

                  {/* Rows de assessores (quando expandido) */}
                  {isOpen && drill.status === 'loading' && (
                    <SkeletonRows cols={COL_COUNT} />
                  )}

                  {isOpen && drill.status === 'error' && (
                    <tr style={{ background: 'var(--bg-deep)' }}>
                      <td
                        colSpan={COL_COUNT}
                        style={{
                          ...tdBase,
                          textAlign:   'center',
                          fontSize:    12,
                          color:       'var(--fg-faint)',
                          paddingLeft: 40,
                        }}
                      >
                        Erro ao carregar assessores. Clique novamente para tentar.
                      </td>
                    </tr>
                  )}

                  {isOpen && drill.status === 'loaded' && drill.assessores.map((a) => (
                    <tr key={a.id} style={{ background: 'var(--bg-deep)' }}>
                      {/* Nome */}
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

                      {/* Cap MTD */}
                      <td
                        style={{
                          ...tdBase,
                          textAlign: 'right',
                          fontSize:  12,
                          color:     a.cap_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                        }}
                      >
                        {fBRL(a.cap_mtd)}
                      </td>

                      {/* Cap Meta */}
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12, color: 'var(--fg-faint)' }}>
                        {a.cap_meta > 0 ? fBRL(a.cap_meta) : '—'}
                      </td>

                      {/* % Cap */}
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12 }}>
                        {a.cap_pct != null
                          ? <ProgressBar pct={a.cap_pct} />
                          : <span style={{ color: 'var(--fg-faint)' }}>—</span>
                        }
                      </td>

                      {/* Cap YTD — não disponível no drill */}
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12, color: 'var(--fg-faint)' }}>
                        —
                      </td>

                      {/* Rec MTD */}
                      <td
                        style={{
                          ...tdBase,
                          textAlign: 'right',
                          fontSize:  12,
                          color:     a.rec_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                        }}
                      >
                        {fBRL(a.rec_mtd)}
                      </td>

                      {/* Rec Meta — não disponível no drill */}
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12, color: 'var(--fg-faint)' }}>
                        —
                      </td>

                      {/* % Rec — não disponível no drill */}
                      <td style={{ ...tdBase, textAlign: 'right', fontSize: 12, color: 'var(--fg-faint)' }}>
                        —
                      </td>
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
                  textAlign:    'left',
                  fontFamily:   'var(--f-text)',
                  fontWeight:   700,
                  fontSize:     13,
                  borderBottom: 'none',
                }}
              >
                Total
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:    'right',
                  fontWeight:   700,
                  borderBottom: 'none',
                  color:        total.cap_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                }}
              >
                {fBRL(total.cap_mtd)}
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:    'right',
                  borderBottom: 'none',
                  color:        'var(--fg-mute)',
                }}
              >
                {fBRL(total.cap_meta)}
              </td>
              <td style={{ ...tdBase, textAlign: 'right', borderBottom: 'none' }}>
                <ProgressBar pct={total.cap_pct} />
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:    'right',
                  borderBottom: 'none',
                  color:        'var(--fg-mute)',
                  fontSize:     12,
                }}
              >
                {fBRL(total.cap_ytd)}
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:    'right',
                  fontWeight:   700,
                  borderBottom: 'none',
                  color:        total.rec_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)',
                }}
              >
                {fBRL(total.rec_mtd)}
              </td>
              <td
                style={{
                  ...tdBase,
                  textAlign:    'right',
                  borderBottom: 'none',
                  color:        'var(--fg-mute)',
                }}
              >
                {fBRL(total.rec_meta)}
              </td>
              <td style={{ ...tdBase, textAlign: 'right', borderBottom: 'none' }}>
                <ProgressBar pct={total.rec_pct} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
