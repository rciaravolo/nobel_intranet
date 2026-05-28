import { requireSession } from '@/lib/auth/session'
import { SettingsClient } from './_components/SettingsClient'

export default async function SettingsPage() {
  const session = await requireSession()
  return (
    <SettingsClient
      user={{
        name: session.name,
        role: session.role,
        initials: session.name
          .trim()
          .split(' ')
          .filter(Boolean)
          .map((p) => p[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      }}
    />
  )
}
