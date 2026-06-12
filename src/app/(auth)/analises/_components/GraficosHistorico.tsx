'use client'

import { useState } from 'react'

type MesHistorico = {
  mes: number
  label: string
  custodia: { v25: number | null; v26: number | null }
  captacao: { v25: number | null; v26: number | null }
  roa: { v25: number | null; v26: number | null }
  receita: { v25: number | null; v26: number | null }
}

/* ─── Formatadores ───────────────────────────────────────────────────────── */

function fC(v: number | null): string {
  if (v == null) return ''
  const abs = Math.abs(v)
  const s = v < 0 ? '−' : ''
  if (abs >= 1e9) return `${s}${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${s}${(abs / 1e6).toFixed(0)}M`
  if (abs >= 1e3) return `${s}${(abs / 1e3).toFixed(0)}K`
  return `${s}${abs.toFixed(0)}`
}

/* ─── Constantes de layout ───────────────────────────────────────────────── */

const VW   = 1060
const VH   = 200
const P    = { top: 32, right: 12, bottom: 30, left: 12 }
const iW   = VW - P.left - P.right   // 1036
const iH   = VH - P.top  - P.bottom  // 138
const SLOTS = 12
const SLOT  = iW / SLOTS             // ~86.3

// Bar geometry (per slot)
const B25_X  = 4   // v25 bar offset inside slot
const B26_X  = 46  // v26 bar offset inside slot
const B_W    = 34  // bar width
const B25_CX = B25_X + B_W / 2  // center of v25 bar = 21
const B26_CX = B26_X + B_W / 2  // center of v26 bar = 63

/* ─── Estilos ────────────────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elev)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 1px 4px var(--n-50)',
}

const cardHeaderStyle: React.CSSProperties = {
  background: 'var(--bg-deep)',
  padding: '12px 20px',
  borderBottom: '1px solid var(--line)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--f-text)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '-.01em',
  color: 'var(--fg)',
}

/* ─── Pill de filtro de ano ──────────────────────────────────────────────── */

function YearPill({
  label,
  color,
  active,
  onClick,
}: {
  label: string
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        opacity: active ? 1 : 0.28,
        transition: 'opacity .15s ease',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 11,
          height: 11,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--fg-mute)',
          letterSpacing: '.04em',
        }}
      >
        {label}
      </span>
    </button>
  )
}

/* ─── Gráfico 1: Custódia ────────────────────────────────────────────────── */

function ChartCustodia({ rows, compact }: { rows: MesHistorico[]; compact?: boolean }) {
  const [vis, setVis] = useState({ y25: true, y26: true })
  const fSize = compact ? 14 : 11

  const maxVal = Math.max(
    ...(vis.y25 ? rows.map((r) => r.custodia.v25 ?? 0) : [0]),
    ...(vis.y26 ? rows.map((r) => r.custodia.v26 ?? 0) : [0]),
    1,
  )

  const bTop = (v: number) => P.top + iH - (v / maxVal) * iH
  const bH   = (v: number) => (v / maxVal) * iH

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <span style={titleStyle}>Custódia</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <YearPill label="2025" color="var(--line-strong)" active={vis.y25} onClick={() => setVis((v) => ({ ...v, y25: !v.y25 }))} />
          <YearPill label="2026" color="var(--color-b-500)" active={vis.y26} onClick={() => setVis((v) => ({ ...v, y26: !v.y26 }))} />
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="auto" style={{ display: 'block' }}>
          {rows.map((r, i) => {
            const x0 = P.left + i * SLOT
            return (
              <g key={r.mes}>
                {vis.y25 && r.custodia.v25 != null && (
                  <>
                    <rect x={x0 + B25_X} y={bTop(r.custodia.v25)} width={B_W} height={bH(r.custodia.v25)} rx={3} style={{ fill: 'var(--line-strong)' }} />
                    <text x={x0 + B25_CX} y={bTop(r.custodia.v25) - 5} textAnchor="middle" fontSize={fSize} fontWeight={500} style={{ fill: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>
                      {fC(r.custodia.v25)}
                    </text>
                  </>
                )}
                {vis.y26 && r.custodia.v26 != null && (
                  <>
                    <rect x={x0 + B26_X} y={bTop(r.custodia.v26)} width={B_W} height={bH(r.custodia.v26)} rx={3} style={{ fill: 'var(--color-b-500)' }} />
                    <text x={x0 + B26_CX} y={bTop(r.custodia.v26) - 5} textAnchor="middle" fontSize={fSize} fontWeight={500} style={{ fill: 'var(--fg-mute)', fontFamily: 'var(--f-mono)' }}>
                      {fC(r.custodia.v26)}
                    </text>
                  </>
                )}
                <text x={x0 + SLOT / 2} y={VH - 6} textAnchor="middle" fontSize={fSize} style={{ fill: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>
                  {r.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ─── Gráfico 2: Captação Líquida ────────────────────────────────────────── */

function ChartCaptacao({ rows, compact }: { rows: MesHistorico[]; compact?: boolean }) {
  const [vis, setVis] = useState({ y25: true, y26: true })
  const fSize = compact ? 14 : 11

  const allVals = [
    ...(vis.y25 ? rows.map((r) => r.captacao.v25 ?? 0) : []),
    ...(vis.y26 ? rows.map((r) => r.captacao.v26 ?? 0) : []),
  ]
  const maxAbs = Math.max(...allVals.map(Math.abs), 1)
  const hasNeg = allVals.some((v) => v < 0)
  const zeroY  = hasNeg ? P.top + iH / 2 : P.top + iH
  const range  = hasNeg ? iH / 2 : iH

  const bTop = (v: number) => v >= 0 ? zeroY - (v / maxAbs) * range : zeroY
  const bH   = (v: number) => (Math.abs(v) / maxAbs) * range
  const lblY = (v: number) => v >= 0 ? bTop(v) - 5 : bTop(v) + bH(v) + 13

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <span style={titleStyle}>Captação Líquida</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <YearPill label="2025" color="var(--line-strong)" active={vis.y25} onClick={() => setVis((v) => ({ ...v, y25: !v.y25 }))} />
          <YearPill label="2026" color="var(--color-b-500)" active={vis.y26} onClick={() => setVis((v) => ({ ...v, y26: !v.y26 }))} />
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="auto" style={{ display: 'block' }}>
          <line x1={P.left} y1={zeroY} x2={P.left + iW} y2={zeroY} strokeWidth={1} style={{ stroke: 'var(--line-strong)' }} />
          {rows.map((r, i) => {
            const x0 = P.left + i * SLOT
            return (
              <g key={r.mes}>
                {vis.y25 && r.captacao.v25 != null && (
                  <>
                    <rect x={x0 + B25_X} y={bTop(r.captacao.v25)} width={B_W} height={bH(r.captacao.v25)} rx={3} style={{ fill: 'var(--line-strong)' }} />
                    <text x={x0 + B25_CX} y={lblY(r.captacao.v25)} textAnchor="middle" fontSize={fSize} fontWeight={500} style={{ fill: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>
                      {fC(r.captacao.v25)}
                    </text>
                  </>
                )}
                {vis.y26 && r.captacao.v26 != null && (
                  <>
                    <rect
                      x={x0 + B26_X}
                      y={bTop(r.captacao.v26)}
                      width={B_W}
                      height={bH(r.captacao.v26)}
                      rx={3}
                      style={{ fill: r.captacao.v26 >= 0 ? 'var(--color-b-500)' : 'var(--color-negative)' }}
                    />
                    <text x={x0 + B26_CX} y={lblY(r.captacao.v26)} textAnchor="middle" fontSize={fSize} fontWeight={500} style={{ fill: 'var(--fg-mute)', fontFamily: 'var(--f-mono)' }}>
                      {fC(r.captacao.v26)}
                    </text>
                  </>
                )}
                <text x={x0 + SLOT / 2} y={VH - 6} textAnchor="middle" fontSize={fSize} style={{ fill: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>
                  {r.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ─── Gráfico 3: Receita ─────────────────────────────────────────────────── */

function ChartReceita({ rows, compact }: { rows: MesHistorico[]; compact?: boolean }) {
  const [vis, setVis] = useState({ y25: true, y26: true })
  const fSize = compact ? 14 : 11

  const maxVal = Math.max(
    ...(vis.y25 ? rows.map((r) => r.receita.v25 ?? 0) : [0]),
    ...(vis.y26 ? rows.map((r) => r.receita.v26 ?? 0) : [0]),
    1,
  )

  const bTop = (v: number) => P.top + iH - (v / maxVal) * iH
  const bH   = (v: number) => (v / maxVal) * iH

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <span style={titleStyle}>Receita</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <YearPill label="2025" color="var(--line-strong)" active={vis.y25} onClick={() => setVis((v) => ({ ...v, y25: !v.y25 }))} />
          <YearPill label="2026" color="var(--color-b-500)" active={vis.y26} onClick={() => setVis((v) => ({ ...v, y26: !v.y26 }))} />
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="auto" style={{ display: 'block' }}>
          {rows.map((r, i) => {
            const x0 = P.left + i * SLOT
            return (
              <g key={r.mes}>
                {vis.y25 && r.receita.v25 != null && (
                  <>
                    <rect x={x0 + B25_X} y={bTop(r.receita.v25)} width={B_W} height={bH(r.receita.v25)} rx={3} style={{ fill: 'var(--line-strong)' }} />
                    <text x={x0 + B25_CX} y={bTop(r.receita.v25) - 5} textAnchor="middle" fontSize={fSize} fontWeight={500} style={{ fill: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>
                      {fC(r.receita.v25)}
                    </text>
                  </>
                )}
                {vis.y26 && r.receita.v26 != null && (
                  <>
                    <rect x={x0 + B26_X} y={bTop(r.receita.v26)} width={B_W} height={bH(r.receita.v26)} rx={3} style={{ fill: 'var(--color-b-500)' }} />
                    <text x={x0 + B26_CX} y={bTop(r.receita.v26) - 5} textAnchor="middle" fontSize={fSize} fontWeight={500} style={{ fill: 'var(--fg-mute)', fontFamily: 'var(--f-mono)' }}>
                      {fC(r.receita.v26)}
                    </text>
                  </>
                )}
                <text x={x0 + SLOT / 2} y={VH - 6} textAnchor="middle" fontSize={fSize} style={{ fill: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>
                  {r.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────────────────── */

type GraficosHistoricoProps = {
  histRows: MesHistorico[]
  filterLabel?: string
  filterType?: string
  layout?: '1col' | '2col'
}

export function GraficosHistorico({ histRows, filterLabel, filterType: _filterType, layout = '1col' }: GraficosHistoricoProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            color: 'var(--fg-faint)',
            letterSpacing: '.10em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Visão Gráfica
        </p>
        {filterLabel && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              background: 'color-mix(in oklch, var(--color-b-500) 10%, transparent)',
              color: 'var(--color-b-500)',
              border: '1px solid color-mix(in oklch, var(--color-b-500) 25%, transparent)',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            <span style={{ color: 'var(--color-b-500)', lineHeight: 1 }}>•</span>
            {filterLabel}
          </span>
        )}
      </div>

      {layout === '2col' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ChartCustodia rows={histRows} compact />
            <ChartCaptacao rows={histRows} compact />
          </div>
          <ChartReceita rows={histRows} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ChartCustodia rows={histRows} />
          <ChartCaptacao rows={histRows} />
          <ChartReceita rows={histRows} />
        </div>
      )}
    </div>
  )
}
