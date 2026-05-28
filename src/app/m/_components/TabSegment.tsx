'use client'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'

const T = {
  text: '#eceef4',
  muted: '#6b7588',
  bg: '#000',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
}

interface TabSegmentProps<T extends string> {
  options: readonly T[]
  active: T
  onChange: (v: T) => void
}

export function TabSegment<T extends string>({ options, active, onChange }: TabSegmentProps<T>) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        borderRadius: 9999,
        padding: 4,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${T.border}`,
      }}
    >
      {options.map((o) => {
        const isActive = active === o
        return (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(o)}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 9999,
              border: 'none',
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.01em',
              background: isActive ? T.text : 'transparent',
              color: isActive ? T.bg : T.muted,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}
