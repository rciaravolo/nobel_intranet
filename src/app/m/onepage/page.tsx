import { requireSession } from '@/lib/auth/session'
import type { MobileUser } from '../_lib/types'
import { OnePageClient } from './_components/OnePageClient'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export default async function OnepagePage() {
  const session = await requireSession()
  const user: MobileUser = {
    name: session.name,
    role: session.role,
    initials: getInitials(session.name),
  }
  return <OnePageClient user={user} />
}
