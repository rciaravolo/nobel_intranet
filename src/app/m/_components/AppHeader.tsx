'use client'
import { Moon, Sun } from 'lucide-react'
import type { MobileUser, Theme } from '../_lib/types'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const T = {
  muted: '#6b7588',
  gold: '#C9973F',
  border: 'rgba(255,255,255,0.07)',
}

interface AppHeaderProps {
  user: MobileUser
  theme: Theme
  onToggleTheme: () => void
  onOpenProfile: () => void
}

export function AppHeader({ user, theme, onToggleTheme, onOpenProfile }: AppHeaderProps) {
  const initials = user.initials || user.name.slice(0, 2).toUpperCase()

  return (
    <header
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 44px)',
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <img
        src="/logo-lockup-ivory.png"
        alt="Nobel Capital"
        style={{ height: 30, width: 'auto', objectFit: 'contain' }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onToggleTheme}
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
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={16} color={T.muted} /> : <Moon size={16} color={T.muted} />}
        </button>
        <button
          type="button"
          onClick={onOpenProfile}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: T.gold,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.02em',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Abrir perfil"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
