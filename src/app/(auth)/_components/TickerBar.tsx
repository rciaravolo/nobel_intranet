import type { TickerItem } from '@/../../server/src/lib/ticker'

const FALLBACK: TickerItem[] = [
  { name: 'IBOV',    value: '—', change: '—',        up: null },
  { name: 'USD/BRL', value: '—', change: '—',        up: null },
  { name: 'CDI',     value: '—', change: 'a.a.',     up: null },
  { name: 'IPCA',    value: '—', change: 'acum. 12m', up: null },
  { name: 'S&P 500', value: '—', change: '—',        up: null },
  { name: 'BTC',     value: '—', change: '—',        up: null },
]

export function TickerBar({ tickers = FALLBACK }: { tickers?: TickerItem[] }) {
  const items = tickers.length > 0 ? tickers : FALLBACK

  return (
    <div
      style={{
        background: '#F0EBE0',
        borderBottom: '1px solid rgba(184,150,62,0.15)',
        padding: '5px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {items.map((t, i) => (
        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
          {i > 0 && (
            <div style={{ width: 1, height: 12, background: 'rgba(184,150,62,0.25)' }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(26,18,9,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t.name}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1209', fontVariantNumeric: 'tabular-nums' }}>
              {t.value}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: t.up === true ? '#16a34a' : t.up === false ? '#dc2626' : '#B8963E',
              }}
            >
              {t.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
