'use client'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const T = {
  gold: '#C9973F',
  text: '#eceef4',
  border: 'rgba(255,255,255,0.07)',
}

interface AvatarProps {
  initials: string
  size?: number
  ring?: string
}

export function Avatar({ initials, size = 36, ring }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: T.gold,
        border: ring ? `2px solid ${ring}` : `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: size * 0.38,
        color: '#fff',
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </div>
  )
}
