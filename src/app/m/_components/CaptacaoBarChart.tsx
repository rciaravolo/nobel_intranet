'use client'
import { fmtBR } from '../_lib/format'
import type { CaptacaoMes } from '../_lib/types'

const T = {
  text:       '#eceef4',
  muted:      '#6b7588',
  gold:       '#C9A961',
  success:    '#248A47',
  successDim: 'rgba(36,138,71,0.50)',
  danger:     '#D94141',
  dangerDim:  'rgba(217,65,65,0.42)',
  zeroline:   'rgba(255,255,255,0.2)',
}

const SANS = '"Garet", "Helvetica Neue", sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'

interface CaptacaoBarChartProps {
  series: CaptacaoMes[]
  height?: number
  showValueLabels?: boolean
  maxAbs?: number // mantido para compatibilidade de API
}

const VW       = 400  // viewBox width (responsivo via width:100%)
const LABEL_H  = 22   // altura reservada para labels dos meses
const PAD_V    = 18   // padding vertical para labels de valor (cima e baixo)
const BAR_FRAC = 0.52 // largura da barra como fração do slot

export function CaptacaoBarChart({
  series,
  height = 160,
  showValueLabels = true,
}: CaptacaoBarChartProps) {
  if (!series.length) return null

  const rawPos = Math.max(...series.map((m) => Math.max(m.liq, 0)))
  const rawNeg = Math.max(...series.map((m) => Math.max(-m.liq, 0)))

  // Mantém um sliver mínimo no lado oposto para o eixo zero sempre aparecer
  const maxPos = rawPos > 0 ? rawPos : rawNeg * 0.06
  const maxNeg = rawNeg > 0 ? rawNeg : rawPos * 0.06

  const totalRange = maxPos + maxNeg
  const plotH      = height - LABEL_H           // área acima dos labels de mês
  const usableH    = plotH - PAD_V * 2          // área útil para as barras
  const pxPerUnit  = usableH / totalRange
  const zeroY      = PAD_V + maxPos * pxPerUnit // coordenada Y do eixo zero

  const slotW = VW / series.length
  const barW  = slotW * BAR_FRAC

  return (
    <svg
      viewBox={`0 0 ${VW} ${height}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="Captação líquida por mês"
    >
      {/* ── Eixo zero ── */}
      <line
        x1={0}  y1={zeroY}
        x2={VW} y2={zeroY}
        stroke={T.zeroline}
        strokeWidth={1}
      />

      {series.map((m, i) => {
        const isLast = i === series.length - 1
        const liq    = m.liq
        const pos    = liq >= 0
        const absLiq = Math.abs(liq)
        const barH   = absLiq * pxPerUnit
        const barX   = i * slotW + (slotW - barW) / 2
        const barY   = pos ? zeroY - barH : zeroY

        const fill = pos
          ? isLast ? T.gold       : T.successDim
          : isLast ? T.danger     : T.dangerDim

        const labelFill = pos
          ? isLast ? T.gold    : T.success
          : isLast ? T.danger  : T.danger

        // Label acima da barra se positivo, abaixo se negativo
        const labelY = pos ? barY - 5 : barY + barH + 12

        return (
          <g key={`${m.m}-${i}`}>
            {/* Barra */}
            {barH > 0.5 && (
              <rect
                x={barX}
                y={barY}
                width={barW}
                height={barH}
                rx={3}
                fill={fill}
              />
            )}

            {/* Label de valor */}
            {showValueLabels && absLiq > 0 && (
              <text
                x={barX + barW / 2}
                y={labelY}
                textAnchor="middle"
                fontSize={9}
                fontFamily={MONO}
                fontWeight="600"
                fill={labelFill}
              >
                {pos ? '+' : '−'}{fmtBR(absLiq, 1)}M
              </text>
            )}

            {/* Label do mês */}
            <text
              x={barX + barW / 2}
              y={height - 5}
              textAnchor="middle"
              fontSize={10}
              fontFamily={SANS}
              fontWeight={isLast ? '700' : '500'}
              fill={isLast ? T.text : T.muted}
            >
              {m.m.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
