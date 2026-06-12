'use client'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const T = {
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  border: 'rgba(255,255,255,0.07)',
}

interface TabPillsProps<T extends string> {
  options: readonly T[]
  active: T
  onChange: (v: T) => void
}

export function TabPills<T extends string>({ options, active, onChange }: TabPillsProps<T>) {
  return (
    <div style={{ borderBottom: `1px solid ${T.border}`, padding: '0 16px' }}>
      <div
        style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {options.map((o) => {
          const on = active === o
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: on ? 700 : 500,
                color: on ? T.text : T.muted,
                background: 'none',
                border: 'none',
                borderBottom: on ? `2px solid ${T.gold}` : '2px solid transparent',
                padding: '12px 0 14px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                letterSpacing: '-0.005em',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}
