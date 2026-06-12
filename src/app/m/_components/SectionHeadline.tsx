'use client'
import type { ReactNode } from 'react'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const T = {
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
}

interface SectionHeadlineProps {
  eyebrow: string
  titulo: ReactNode
}

export function SectionHeadline({ eyebrow, titulo }: SectionHeadlineProps) {
  return (
    <div style={{ padding: '32px 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span
          style={{
            display: 'inline-block',
            width: 28,
            height: 2,
            background: T.gold,
          }}
        />
        <span
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
          }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        style={{
          fontFamily: SANS,
          fontSize: 22,
          fontWeight: 600,
          color: T.text,
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        {titulo}
      </h2>
    </div>
  )
}
