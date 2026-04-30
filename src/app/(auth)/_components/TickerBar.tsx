import type { TickerItem } from '@/../../server/src/lib/ticker'

const FALLBACK: TickerItem[] = [
  { name: 'IBOV', value: '—', change: '—', up: null },
  { name: 'PETR4', value: '—', change: '—', up: null },
  { name: 'VALE3', value: '—', change: '—', up: null },
  { name: 'BBAS3', value: '—', change: '—', up: null },
  { name: 'USD/BRL', value: '—', change: '—', up: null },
  { name: 'EUR/BRL', value: '—', change: '—', up: null },
  { name: 'CDI', value: '—', change: 'a.a.', up: null },
  { name: 'IPCA', value: '—', change: 'acum. 12m', up: null },
  { name: 'S&P 500', value: '—', change: '—', up: null },
  { name: 'BTC', value: '—', change: '—', up: null },
]

export function TickerBar({ tickers = FALLBACK }: { tickers?: TickerItem[] }) {
  const items = tickers.length > 0 ? tickers : FALLBACK

  return (
    <div
      style={{
        background: '#0A0A0A',
        padding: '8px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {items.map((t, i) => (
        <div
          key={t.name}
          style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}
        >
          {i > 0 && (
            <div
              style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 32px' }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.08em',
              }}
            >
              {t.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                fontWeight: 600,
                color: '#ffffff',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {t.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                fontWeight: 500,
                color:
                  t.up === true
                    ? '#4ade80'
                    : t.up === false
                      ? '#f87171'
                      : '#f59e0b',
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
