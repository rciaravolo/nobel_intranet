'use client'
import type { ReactNode } from 'react'
import { BottomTabs } from './BottomTabs'
import { ThemeProvider, useMobileTheme } from './ThemeProvider'
import '../styles/mobile.css'

function Shell({ children, role }: { children: ReactNode; role: string }) {
  const { theme } = useMobileTheme()
  return (
    <div className={`nobel-mobile relative h-full w-full${theme === 'dark' ? ' dark' : ''}`}>
      {children}
      <BottomTabs role={role} />
    </div>
  )
}

export function MobileShell({ children, role }: { children: ReactNode; role: string }) {
  return (
    <ThemeProvider>
      <Shell role={role}>{children}</Shell>
    </ThemeProvider>
  )
}

export { useMobileTheme } from './ThemeProvider'
