'use client'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  success: '#3dba6e',
  danger: '#e05252',
}

type Tone = 'ink' | 'gold' | 'red' | 'green'

const toneColor: Record<Tone, string> = {
  ink: T.text,
  gold: T.gold,
  red: T.danger,
  green: T.success,
}

interface StackedKpiProps {
  label: string
  value: string
  tone?: Tone
}

export function StackedKpi({ label, value, tone = 'ink' }: StackedKpiProps) {
  return (
    <div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: T.muted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 500,
          color: toneColor[tone],
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
    </div>
  )
}
