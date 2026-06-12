'use client'
import { BarChart2, Coins, Home, TrendingUp, type LucideIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const COLOR_ACTIVE = '#C9A961'
const COLOR_INACTIVE = '#6b7588'

interface TabDef {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

const BASE_TABS: TabDef[] = [
  { id: 'onepage',  label: 'Onepage',  icon: Home,       href: '/m/onepage' },
  { id: 'captacao', label: 'Captação', icon: Coins,      href: '/m/captacao' },
  { id: 'receita',  label: 'Receita',  icon: TrendingUp, href: '/m/receita' },
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
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        display: 'flex',
        gap: 4,
        padding: '8px 16px',
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
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
              gap: 2,
              padding: '6px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color,
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-pressed={isActive}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.6} color={color} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
