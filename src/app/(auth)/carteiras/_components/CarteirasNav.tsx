'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { key: 'geral', label: 'Visão Geral', accent: null },
  { key: 'rf', label: 'Renda Fixa', accent: '#2D5FA0' },
  { key: 'rv', label: 'Renda Variável', accent: '#C29404' },
] as const

export function CarteirasNav() {
  const searchParams = useSearchParams()
  const active = searchParams.get('tab') ?? 'geral'

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        marginBottom: 'var(--s-4)',
        padding: '3px',
        background: 'var(--bg-deep)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        width: 'fit-content',
      }}
    >
      {TABS.map(({ key, label, accent }) => {
        const isActive = active === key
        const href = key === 'geral' ? '/carteiras' : `/carteiras?tab=${key}`
        return (
          <Link
            key={key}
            href={href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: 'var(--f-text)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--bg)' : 'var(--fg-mute)',
              background: isActive ? 'var(--fg)' : 'transparent',
              borderRadius: 7,
              padding: '6px 16px',
              textDecoration: 'none',
              letterSpacing: '-.01em',
              transition: 'all .1s',
              whiteSpace: 'nowrap',
            }}
          >
            {accent && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: isActive ? 'var(--bg)' : accent,
                  flexShrink: 0,
                  opacity: isActive ? 0.7 : 1,
                }}
              />
            )}
            {label}
          </Link>
        )
      })}
    </div>
  )
}
