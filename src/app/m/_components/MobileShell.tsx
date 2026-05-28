'use client'
import type { ReactNode } from 'react'
import { BottomTabs } from './BottomTabs'
import { ThemeProvider, useMobileTheme } from './ThemeProvider'
import '../styles/mobile.css'

function Shell({ children }: { children: ReactNode }) {
  const { theme } = useMobileTheme()
  return (
    <div className={`nobel-mobile relative h-full w-full${theme === 'dark' ? ' dark' : ''}`}>
      {children}
      <BottomTabs />
    </div>
  )
}

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Shell>{children}</Shell>
    </ThemeProvider>
  )
}

export { useMobileTheme } from './ThemeProvider'
