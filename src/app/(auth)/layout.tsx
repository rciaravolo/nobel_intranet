import { requireSession } from '@/lib/auth/session'
import { Sidebar } from './_components/Sidebar'
import { Topbar } from './_components/Topbar'
import { TickerBar } from './_components/TickerBar'
import type { TickerPayload } from '@/../../server/src/lib/ticker'

async function getTicker() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return []
  try {
    const res = await fetch(`${apiUrl}/ticker`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json() as { data: TickerPayload }
    return json.data.tickers ?? []
  } catch {
    return []
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [session, tickers] = await Promise.all([
    requireSession(),
    getTicker(),
  ])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F6F3ED' }}>
      <Sidebar session={session} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TickerBar tickers={tickers} />
        <Topbar session={session} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
