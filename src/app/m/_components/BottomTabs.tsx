'use client'
import { BarChart2, Coins, Home, type LucideIcon, TrendingUp } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const COLOR_ACTIVE = '#C9A961'
const COLOR_INACTIVE = '#6b7588'
const ACTIVE_CHIP_BG = 'rgba(201, 169, 97, 0.16)'

interface TabDef {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

const BASE_TABS: TabDef[] = [
  { id: 'onepage', label: 'Onepage', icon: Home, href: '/m/onepage' },
  { id: 'captacao', label: 'Captação', icon: Coins, href: '/m/captacao' },
  { id: 'receita', label: 'Receita', icon: TrendingUp, href: '/m/receita' },
]

const PNL_TAB: TabDef = { id: 'pnl', label: 'PnL', icon: BarChart2, href: '/m/pnl' }

export function BottomTabs({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const tabs = role === 'admin' || role === 'master' ? [...BASE_TABS, PNL_TAB] : BASE_TABS

  return (
    <nav
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'max(env(safe-area-inset-bottom), 16px)',
        zIndex: 30,
        display: 'flex',
        gap: 4,
        padding: 6,
        background: 'rgba(20, 22, 26, 0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 28,
        boxShadow:
          '0 8px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      }}
    >
      {tabs.map(({ id, label, icon: Icon, href }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)
        const color = isActive ? COLOR_ACTIVE : COLOR_INACTIVE
        return (
          <button
            key={id}
            type="button"
            onClick={() => router.push(href)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 4px 6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color,
              WebkitTapHighlightColor: 'transparent',
              transition: 'color 0.18s ease',
            }}
            aria-pressed={isActive}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5px 14px',
                borderRadius: 18,
                background: isActive ? ACTIVE_CHIP_BG : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} color={color} />
            </span>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
