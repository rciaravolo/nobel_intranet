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
  borderMed: 'rgba(255,255,255,0.12)',
}

type Tone = 'ink' | 'gold' | 'red' | 'green'

const toneColor: Record<Tone, string> = {
  ink: T.text,
  gold: T.gold,
  red: T.danger,
  green: T.success,
}

interface LineCardProps {
  label: string
  valor: string
  sub: string
  tone?: Tone
  highlight?: boolean
}

export function LineCard({ label, valor, sub, tone = 'ink', highlight }: LineCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderRadius: 12,
        padding: '14px 16px',
        background: T.card,
        border: `${highlight ? 1.5 : 1}px solid ${highlight ? T.borderMed : T.border}`,
      }}
    >
      <div style={{ flex: 1 }}>
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
            fontFamily: SANS,
            fontSize: 11,
            color: T.muted,
          }}
        >
          {sub}
        </div>
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 22,
          fontWeight: 500,
          color: toneColor[tone],
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {valor}
      </div>
    </div>
  )
}
