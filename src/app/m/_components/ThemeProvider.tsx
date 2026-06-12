'use client'
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import type { Theme } from '../_lib/types'

interface ThemeCtx {
  theme: Theme
  toggleTheme: () => void
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('nobel-mobile-theme') as Theme | null
    if (saved) {
      setTheme(saved)
    } else {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(sysDark ? 'dark' : 'light')
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('nobel-mobile-theme', next)
      return next
    })
  }

  return <Ctx.Provider value={{ theme, toggleTheme }}>{children}</Ctx.Provider>
}

export const useMobileTheme = (): ThemeCtx => useContext(Ctx)
