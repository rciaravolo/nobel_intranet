import { apiFetch } from '@/lib/api/fetch'
type TickerPayload = { tickers: { name: string; value: string; change: string; up: boolean | null }[]; atualizadoEm: string }
import { requireSession } from '@/lib/auth/session'
import { Sidebar } from './_components/Sidebar'
import { TickerBar } from './_components/TickerBar'

async function getTicker() {
  try {
    const res = await apiFetch(`/ticker`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = (await res.json()) as { data: TickerPayload }
    return json.data.tickers ?? []
  } catch {
    return []
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [session, tickers] = await Promise.all([requireSession(), getTicker()])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F4F0' }}>
      <Sidebar session={session} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TickerBar tickers={tickers} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
