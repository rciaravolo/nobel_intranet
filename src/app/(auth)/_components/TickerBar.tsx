import type { TickerItem } from '@/../../server/src/lib/ticker'

const FALLBACK: TickerItem[] = [
  { name: 'IBOV',    value: '—', change: '—',         up: null },
  { name: 'USD/BRL', value: '—', change: '—',         up: null },
  { name: 'CDI',     value: '—', change: 'a.a.',      up: null },
  { name: 'IPCA',    value: '—', change: 'acum. 12m', up: null },
  { name: 'S&P 500', value: '—', change: '—',         up: null },
  { name: 'BTC',     value: '—', change: '—',         up: null },
]

export function TickerBar({ tickers = FALLBACK }: { tickers?: TickerItem[] }) {
  const items = tickers.length > 0 ? tickers : FALLBACK

  return (
    <div
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        padding: '5px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {items.map((t, i) => (
        <div
          key={t.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            flexShrink: 0,
          }}
        >
          {i > 0 && (
            <div style={{ width: 1, height: 10, background: 'var(--line-strong)', margin: '0 20px' }} />
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                fontWeight: 500,
                color: 'var(--fg-faint)',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
              }}
            >
              {t.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--fg)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {t.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                fontWeight: 400,
                color:
                  t.up === true
                    ? 'var(--c-positive)'
                    : t.up === false
                      ? 'var(--c-negative)'
                      : 'var(--c-gold)',
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
