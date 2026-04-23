import { requireSession } from '@/lib/auth/session'
import { Sidebar } from './_components/Sidebar'
import { Topbar } from './_components/Topbar'
import { TickerBar } from './_components/TickerBar'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F6F3ED' }}>
      <Sidebar session={session} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TickerBar />
        <Topbar session={session} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
