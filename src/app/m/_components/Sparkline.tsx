'use client'
import { useMemo } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  stroke?: number
  showArea?: boolean
}

let _id = 0
const nextId = () => `spark-${++_id}`

export function Sparkline({
  data,
  width = 320,
  height = 80,
  color = '#C9973F',
  stroke = 2,
  showArea = true,
}: SparklineProps) {
  const gradId = useMemo(nextId, [])

  if (!data || data.length < 2) return <svg width={width} height={height} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = width / (data.length - 1)
  const pts: [number, number][] = data.map((v, i) => [
    i * stepX,
    height - ((v - min) / span) * height * 0.82 - height * 0.09,
  ])
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${d} L${width},${height} L0,${height} Z`
  const last = pts[pts.length - 1]!

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {showArea && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradId})`} />
        </>
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={stroke + 1.5} fill={color} />
      <circle cx={last[0]} cy={last[1]} r={stroke + 5} fill={color} opacity={0.2} />
    </svg>
  )
}
