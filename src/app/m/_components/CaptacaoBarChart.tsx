'use client'
import type { CaptacaoMes } from '../_lib/types'
import { fmtBR } from '../_lib/format'

const T = {
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  success: '#3dba6e',
  danger: '#e05252',
}

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'

interface CaptacaoBarChartProps {
  series: CaptacaoMes[]
  maxAbs?: number
  showValueLabels?: boolean
  height?: number
}

export function CaptacaoBarChart({
  series,
  maxAbs,
  showValueLabels = true,
  height = 100,
}: CaptacaoBarChartProps) {
  const max = maxAbs ?? Math.max(...series.map((m) => Math.abs(m.liq)), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
      {series.map((m, i) => {
        const isLast = i === series.length - 1
        const liq = m.liq
        const h = (Math.abs(liq) / max) * height
        const pos = liq >= 0
        const barColor = pos
          ? isLast
            ? T.gold
            : T.success
          : isLast
            ? T.danger
            : 'rgba(224,82,82,0.5)'

        return (
          <div
            key={`${m.m}-${i}`}
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {showValueLabels && (
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 9,
                  color: pos ? T.success : T.danger,
                  fontWeight: 600,
                  height: 10,
                  opacity: liq === 0 ? 0 : 1,
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {pos ? '+' : '−'}
                {fmtBR(Math.abs(liq), 1)}M
              </span>
            )}
            <div
              style={{
                display: 'flex',
                width: '100%',
                height,
                flexDirection: 'column',
                justifyContent: pos ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  width: '68%',
                  height: h,
                  background: barColor,
                  borderRadius: 3,
                  alignSelf: 'center',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: isLast ? T.text : T.muted,
                fontWeight: isLast ? 700 : 500,
              }}
            >
              {m.m}
            </span>
          </div>
        )
      })}
    </div>
  )
}
