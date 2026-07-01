'use client'

import { useState } from 'react'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export type Categoria = {
  slug: string
  label: string
  receita: number
}

type Cliente = { id: string | number; nome: string | null; receita: number }
type Assessor = { id: string; nome: string; receita: number; clientes: Cliente[] }
type Equipe = { equipe: string; total: number; assessores: Assessor[] }
type DrillPayload = { categoria: string; label: string; total: number; equipes: Equipe[] }

const DRILLABLE = new Set(['rv', 'rf', 'coe', 'cambio', 'oferta_fundos'])

/* ─── Formatters ─────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1).replace('.', ',')}K`
  return `R$ ${v.toFixed(0)}`
}

function pct(v: number, total: number): string {
  if (total === 0) return '—'
  return `${((v / total) * 100).toFixed(1).replace('.', ',')}%`
}

/* ─── KPI Card ───────────────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  sub,
  onClick,
  active,
}: {
  label: string
  value: string
  sub?: string | undefined
  onClick?: (() => void) | undefined
  active?: boolean | undefined
}) {
  const centerSpan: React.CSSProperties = {
    display:   'block',
    width:     '100%',
    textAlign: 'center',
  }
  const clickable = !!onClick
  return (
    <div
      className="ds-stat"
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } } : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        gap:            8,
        flex:           1,
        minWidth:       140,
        cursor:         clickable ? 'pointer' : 'default',
        borderColor:    active ? 'var(--c-gold)' : undefined,
        outline:        active ? '1px solid var(--c-gold)' : undefined,
        outlineOffset:  active ? '-1px' : undefined,
      }}
    >
      <span className="lbl" style={{ ...centerSpan, marginBottom: 0 }}>{label}</span>
      <span className="num" style={centerSpan}>{value}</span>
      {sub && <span className="sub" style={centerSpan}>{sub}</span>}
    </div>
  )
}

/* ─── Drill Panel ────────────────────────────────────────────────────────── */

function DrillPanel({
  drill,
  loading,
  onClose,
}: {
  drill: DrillPayload | null
  loading: boolean
  onClose: () => void
}) {
  const [expandedEquipes, setExpandedEquipes] = useState<Set<string>>(new Set())
  const [expandedAssessores, setExpandedAssessores] = useState<Set<string>>(new Set())

  const toggleEquipe = (equipe: string) => {
    setExpandedEquipes((prev) => {
      const next = new Set(prev)
      if (next.has(equipe)) next.delete(equipe)
      else next.add(equipe)
      return next
    })
  }

  const toggleAssessor = (key: string) => {
    setExpandedAssessores((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div
      style={{
        background:   'var(--bg-elev)',
        border:       '1px solid var(--line)',
        borderRadius: 12,
        boxShadow:    'var(--e-float)',
        overflow:     'hidden',
        marginBottom: 32,
      }}
    >
      {/* Header */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '14px 20px',
          borderBottom:   '1px solid var(--line)',
          background:     'var(--bg-deep)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: 'var(--f-text)', fontSize: 14, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
            {drill?.label ?? '...'}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--fg-faint)' }}>
            Detalhamento por equipe
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {drill && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-mute)' }}>
              Total <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{fBRL(drill.total)}</span>
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              padding:     4,
              color:       'var(--fg-faint)',
              display:     'flex',
              alignItems:  'center',
              borderRadius: 4,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-faint)' }}>
          Carregando…
        </div>
      )}

      {!loading && drill && drill.equipes.length === 0 && (
        <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-faint)' }}>
          Sem receita registrada para esta categoria no período.
        </div>
      )}

      {!loading && drill && drill.equipes.length > 0 && (
        <div>
          {drill.equipes.map((eq) => {
            const isEqExpanded = expandedEquipes.has(eq.equipe)
            return (
              <div key={eq.equipe} style={{ borderBottom: '1px solid var(--line)' }}>
                {/* Equipe row */}
                <button
                  type="button"
                  onClick={() => toggleEquipe(eq.equipe)}
                  style={{
                    all:            'unset',
                    width:          '100%',
                    display:        'flex',
                    alignItems:     'center',
                    gap:            12,
                    padding:        '12px 20px',
                    cursor:         'pointer',
                    boxSizing:      'border-box',
                    background:     isEqExpanded ? 'var(--bg-deep)' : 'transparent',
                    transition:     'background .15s',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    width="12"
                    height="12"
                    style={{
                      color:      'var(--fg-mute)',
                      transform:  isEqExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform .15s',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span style={{ flex: 1, fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 500, color: 'var(--fg)', letterSpacing: '-.01em' }}>
                    {eq.equipe}
                  </span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-mute)', minWidth: 60, textAlign: 'right' }}>
                    {drill.total > 0 ? pct(eq.total, drill.total) : ''}
                  </span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 500, color: 'var(--fg)', minWidth: 90, textAlign: 'right' }}>
                    {fBRL(eq.total)}
                  </span>
                </button>

                {/* Assessores */}
                {isEqExpanded && (
                  <div style={{ background: 'var(--bg-elev)' }}>
                    {eq.assessores.map((a) => {
                      const asKey = `${eq.equipe}::${a.id}`
                      const isAsExpanded = expandedAssessores.has(asKey)
                      const hasClientes = a.clientes.length > 0
                      return (
                        <div key={asKey} style={{ borderTop: '1px solid var(--line)' }}>
                          {/* Assessor row */}
                          <button
                            type="button"
                            onClick={() => { if (hasClientes) toggleAssessor(asKey) }}
                            disabled={!hasClientes}
                            style={{
                              all:        'unset',
                              width:      '100%',
                              display:    'flex',
                              alignItems: 'center',
                              gap:        12,
                              padding:    '9px 20px 9px 40px',
                              cursor:     hasClientes ? 'pointer' : 'default',
                              boxSizing:  'border-box',
                              background: isAsExpanded ? 'var(--bg-deep)' : 'transparent',
                              transition: 'background .15s',
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              width="10"
                              height="10"
                              style={{
                                color:      hasClientes ? 'var(--fg-mute)' : 'transparent',
                                transform:  isAsExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform .15s',
                                flexShrink: 0,
                              }}
                              aria-hidden="true"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em', minWidth: 60 }}>
                              {a.id}
                            </span>
                            <span style={{ flex: 1, fontFamily: 'var(--f-text)', fontSize: 12, color: 'var(--fg)' }}>
                              {a.nome}
                            </span>
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-mute)', minWidth: 60, textAlign: 'right' }}>
                              {drill.total > 0 ? pct(a.receita, drill.total) : ''}
                            </span>
                            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg)', minWidth: 90, textAlign: 'right' }}>
                              {fBRL(a.receita)}
                            </span>
                          </button>

                          {/* Clientes */}
                          {isAsExpanded && hasClientes && (
                            <div style={{ background: 'var(--bg-deep)' }}>
                              {a.clientes.map((c) => (
                                <div
                                  key={`${asKey}::${c.id}`}
                                  style={{
                                    display:    'flex',
                                    alignItems: 'center',
                                    gap:        12,
                                    padding:    '7px 20px 7px 88px',
                                    borderTop:  '1px solid var(--line)',
                                  }}
                                >
                                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em', minWidth: 70 }}>
                                    {c.id}
                                  </span>
                                  <span style={{ flex: 1, fontFamily: 'var(--f-text)', fontSize: 11, color: 'var(--fg-mute)' }}>
                                    {c.nome ?? '—'}
                                  </span>
                                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', minWidth: 60, textAlign: 'right' }}>
                                    {a.receita > 0 ? pct(c.receita, a.receita) : ''}
                                  </span>
                                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-mute)', minWidth: 90, textAlign: 'right' }}>
                                    {fBRL(c.receita)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Client ─────────────────────────────────────────────────────────────── */

export function PJ1Client({
  categorias,
  total,
  mesLabel,
}: {
  categorias: Categoria[]
  total: number
  mesLabel: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [drill, setDrill] = useState<DrillPayload | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCardClick(slug: string) {
    if (selected === slug) {
      setSelected(null)
      setDrill(null)
      return
    }
    setSelected(slug)
    setDrill(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/performance/pj1/drill?categoria=${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const json = (await res.json()) as { data: DrillPayload }
        setDrill(json.data)
      }
    } catch {
      // fica sem drill; usuário fecha e tenta de novo
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Total */}
      <div
        className="grid-kpi"
        style={{ gridTemplateColumns: '1fr', marginBottom: 14 }}
      >
        <KpiCard label="Receita Total PJ1" value={fBRL(total)} sub={mesLabel || undefined} />
      </div>

      {/* Categorias */}
      <div
        className="grid-kpi"
        style={{ gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 24 }}
      >
        {categorias.map((cat) => {
          const clickable = DRILLABLE.has(cat.slug)
          return (
            <KpiCard
              key={cat.slug}
              label={cat.label}
              value={fBRL(cat.receita)}
              sub={total > 0 ? `${pct(cat.receita, total)} do total` : undefined}
              onClick={clickable ? () => handleCardClick(cat.slug) : undefined}
              active={selected === cat.slug}
            />
          )
        })}
      </div>

      {/* Drill inline */}
      {selected && (
        <DrillPanel
          drill={drill}
          loading={loading}
          onClose={() => { setSelected(null); setDrill(null) }}
        />
      )}
    </>
  )
}
