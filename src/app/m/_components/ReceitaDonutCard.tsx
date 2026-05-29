'use client'
import { fmtBR, fmtCur } from '../_lib/format'
import type { Produto } from '../_lib/types'

const SANS = '"Garet", "Helvetica Neue", sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const T = {
  text: '#eceef4',
  muted: '#6b7588',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
  gold: '#C9A961',
}

// ─── Binary-split treemap layout ──────────────────────────────────────────────
interface Rect { x: number; y: number; w: number; h: number }

function binaryLayout(values: number[], x: number, y: number, w: number, h: number): Rect[] {
  const n = values.length
  if (n === 0) return []
  if (n === 1) return [{ x, y, w, h }]

  const total = values.reduce((s, v) => s + v, 0)
  let splitIdx = 1
  let minDiff = Infinity
  let acc = 0

  for (let i = 0; i < n - 1; i++) {
    acc += values[i] ?? 0
    const diff = Math.abs(acc / total - 0.5)
    if (diff < minDiff) { minDiff = diff; splitIdx = i + 1 }
  }

  const fracA = values.slice(0, splitIdx).reduce((s, v) => s + v, 0) / total

  if (w >= h) {
    const wA = w * fracA
    return [
      ...binaryLayout(values.slice(0, splitIdx), x, y, wA, h),
      ...binaryLayout(values.slice(splitIdx), x + wA, y, w - wA, h),
    ]
  }
  const hA = h * fracA
  return [
    ...binaryLayout(values.slice(0, splitIdx), x, y, w, hA),
    ...binaryLayout(values.slice(splitIdx), x, y + hA, w, h - hA),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ReceitaDonutCardProps {
  produtos: Produto[]
  total: number
  maxRows?: number
}

const VW = 400
const VH = 220
const GAP = 3

export function ReceitaDonutCard({ produtos, total, maxRows = 6 }: ReceitaDonutCardProps) {
  const items = produtos.slice(0, maxRows)
  const rects = binaryLayout(items.map((p) => p.valor), 0, 0, VW, VH)

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 12,
        background: T.card,
        border: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '13px 16px',
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.muted }}>
          Receita por Produto
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: T.gold, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}>
          {fmtCur(total)}
        </span>
      </div>

      {/* ── Treemap ── */}
      <div style={{ padding: '12px 12px 12px' }}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, overflow: 'hidden' }}
          aria-label="Receita por produto"
        >
          <defs>
            <linearGradient id="tm-overlay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.52)" />
            </linearGradient>
          </defs>

          {items.map((p, i) => {
            const r = rects[i]
            if (!r) return null
            const half = GAP / 2
            const tx = r.x + half
            const ty = r.y + half
            const tw = Math.max(r.w - GAP, 0)
            const th = Math.max(r.h - GAP, 0)

            const showName  = tw > 52 && th > 26
            const showValue = tw > 68 && th > 54
            const shortName = tw < 88 && p.nome.length > 9 ? `${p.nome.slice(0, 8)}…` : p.nome

            return (
              <g key={p.nome}>
                {/* Fill */}
                <rect x={tx} y={ty} width={tw} height={th} rx={6} fill={p.color} />
                {/* Gradient overlay for legibility */}
                {showName && (
                  <rect x={tx} y={ty} width={tw} height={th} rx={6} fill="url(#tm-overlay)" />
                )}
                {/* Name */}
                {showName && (
                  <text
                    x={tx + 8}
                    y={ty + 17}
                    fontSize={11}
                    fontFamily={SANS}
                    fontWeight={700}
                    fill="rgba(255,255,255,0.95)"
                    style={{ userSelect: 'none' }}
                  >
                    {shortName}
                  </text>
                )}
                {/* Value + pct anchored to bottom-left */}
                {showValue && (
                  <>
                    <text
                      x={tx + 8}
                      y={ty + th - 16}
                      fontSize={10}
                      fontFamily={MONO}
                      fill="rgba(255,255,255,0.75)"
                      style={{ userSelect: 'none' }}
                    >
                      {fmtCur(p.valor)}
                    </text>
                    <text
                      x={tx + 8}
                      y={ty + th - 5}
                      fontSize={9}
                      fontFamily={MONO}
                      fill="rgba(255,255,255,0.45)"
                      style={{ userSelect: 'none' }}
                    >
                      {fmtBR(p.pct, 1)}%
                    </text>
                  </>
                )}
                {/* Pct only for medium tiles that can't fit both */}
                {showName && !showValue && (
                  <text
                    x={tx + 8}
                    y={ty + th - 7}
                    fontSize={9}
                    fontFamily={MONO}
                    fill="rgba(255,255,255,0.55)"
                    style={{ userSelect: 'none' }}
                  >
                    {fmtBR(p.pct, 1)}%
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

    </div>
  )
}
