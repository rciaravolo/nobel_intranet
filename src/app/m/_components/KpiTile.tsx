'use client'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  success: '#3dba6e',
  danger: '#e05252',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
}

type Tone = 'ink' | 'gold' | 'red' | 'green'

const toneColor: Record<Tone, string> = {
  ink: T.text,
  gold: T.gold,
  red: T.danger,
  green: T.success,
}

interface KpiTileProps {
  eyebrow: string
  value: string | number
  sub: string
  tone?: Tone
}

export function KpiTile({ eyebrow, value, sub, tone = 'ink' }: KpiTileProps) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '12px 12px 14px',
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: T.muted,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 18,
          fontWeight: 500,
          color: toneColor[tone],
          lineHeight: 1,
          marginTop: 6,
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 11,
          color: T.muted,
          marginTop: 5,
        }}
      >
        {sub}
      </div>
    </div>
  )
}
