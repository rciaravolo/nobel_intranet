'use client'

const TICKERS = [
  { name: 'IBOV',    value: '128.457', change: '+0,84%', up: true },
  { name: 'USD/BRL', value: '5,7340',  change: '−0,31%', up: false },
  { name: 'CDI',     value: '10,65%',  change: 'a.a.',   up: null },
  { name: 'IPCA',    value: '4,83%',   change: 'acum. 12m', up: null },
  { name: 'S&P 500', value: '5.614',   change: '−0,17%', up: false },
  { name: 'BTC',     value: '$83.240', change: '+2,14%', up: true },
]

export function TickerBar() {
  return (
    <div
      style={{
        background: '#0C0C0C',
        padding: '6px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {TICKERS.map((t, i) => (
        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
          {i > 0 && (
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
              {t.name}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {t.value}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: t.up === true ? '#4ade80' : t.up === false ? '#f87171' : '#f59e0b',
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
