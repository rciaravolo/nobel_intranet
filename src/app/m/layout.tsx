import { requireSession } from '@/lib/auth/session'
import type { Metadata, Viewport } from 'next'
import { MobileShell } from './_components/MobileShell'

export const metadata: Metadata = {
  title: 'Nobel Capital',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  await requireSession()

  return (
    <div style={{ height: '100dvh', overflow: 'hidden' }}>
      <MobileShell>{children}</MobileShell>
    </div>
  )
}
