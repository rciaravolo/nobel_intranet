// Nobel ProgressBar — §7 (sem gradiente)
// File: src/components/nobel/progress-bar.tsx

import { cn } from '@/lib/utils'
import type * as React from 'react'

export interface ProgressBarProps {
  value: number // 0 to 100
  max?: number // default 100
  color?: string // CSS var reference, e.g. 'var(--color-b-500)' or 'var(--c-gold)'
  height?: 'mini' | 'default' | 'large' // 3px, 5px, 8px
  showLabel?: boolean // shows '73%' at the end
  label?: string // text above the bar
  className?: string
}

const heightMap: Record<'mini' | 'default' | 'large', number> = {
  mini: 3,
  default: 5,
  large: 8,
}

export function ProgressBar({
  value,
  max = 100,
  color = 'var(--b-500)',
  height = 'default',
  showLabel = false,
  label,
  className,
}: ProgressBarProps): React.JSX.Element {
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = (clampedValue / max) * 100
  const displayPct = Math.round(percentage)
  const barH = heightMap[height]

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {/* Optional label above */}
      {label && (
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--fg-faint)]">
          {label}
        </span>
      )}

      {/* Track + fill row */}
      <div className="flex items-center gap-2 w-full">
        {/* Track */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            height: `${barH}px`,
            background: 'var(--n-100)',
            borderRadius: 'var(--r-pill)',
          }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          tabIndex={0}
        >
          {/* Fill — no gradient, solid color */}
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: color,
              borderRadius: 'var(--r-pill)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Optional percentage label */}
        {showLabel && (
          <span className="font-mono text-[11px] text-[var(--fg-mute)] tabular-nums shrink-0">
            {displayPct}%
          </span>
        )}
      </div>
    </div>
  )
}
