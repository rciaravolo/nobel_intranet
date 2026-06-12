'use client'

interface DonutSegment {
  pct: number
  color: string
}

interface DonutProps {
  items: DonutSegment[]
  size?: number
  thickness?: number
  gap?: number
}

export function Donut({ items, size = 180, thickness = 22, gap = 0.012 }: DonutProps) {
  const total = items.reduce((s, i) => s + i.pct, 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  let acc = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={thickness}
      />
      {/* Segments */}
      {total > 0 &&
        items.map((it, i) => {
          const frac = it.pct / total
          const len = circ * Math.max(frac - gap, 0)
          const offset = -acc * circ
          acc += frac
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={`hsl(${it.color})`}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          )
        })}
    </svg>
  )
}
