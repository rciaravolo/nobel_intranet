'use client'
import { useMobileTheme } from '../../_components/MobileShell'
import type { MobileUser } from '../../_lib/types'
import { useOnepageData } from '../_hooks/useOnepageData'
import { OnePageScreen } from './OnePageScreen'

interface Props {
  user: MobileUser
}

export function OnePageClient({ user }: Props) {
  const { theme, toggleTheme } = useMobileTheme()
  const data = useOnepageData(user)
  return <OnePageScreen data={data} theme={theme} onToggleTheme={toggleTheme} />
}
