'use client'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const T = {
  text: '#eceef4',
  muted: '#6b7588',
  border: 'rgba(255,255,255,0.07)',
}

interface ScreenHeaderProps {
  title: string
  eyebrow?: string
  onBack: () => void
  action?: ReactNode
}

export function ScreenHeader({ title, eyebrow, onBack, action }: ScreenHeaderProps) {
  return (
    <header
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 44px)',
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${T.border}`,
            cursor: 'pointer',
            color: T.muted,
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Voltar"
        >
          <ChevronLeft size={18} color={T.muted} />
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          {eyebrow && (
            <div
              style={{
                fontFamily: SANS,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: T.muted,
                marginBottom: 2,
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              fontFamily: SANS,
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.1,
              color: T.text,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
        </div>
        {action}
      </div>
    </header>
  )
}
