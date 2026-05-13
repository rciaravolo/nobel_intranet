type TickerItem = { name: string; value: string; change: string; up: boolean | null }

const FALLBACK: TickerItem[] = [
  { name: 'IBOV',    value: '—', change: '—',        up: null },
  { name: 'PETR4',   value: '—', change: '—',        up: null },
  { name: 'VALE3',   value: '—', change: '—',        up: null },
  { name: 'BBAS3',   value: '—', change: '—',        up: null },
  { name: 'USD/BRL', value: '—', change: '—',        up: null },
  { name: 'EUR/BRL', value: '—', change: '—',        up: null },
  { name: 'CDI',     value: '—', change: 'a.a.',     up: null },
  { name: 'IPCA',    value: '—', change: 'acum. 12m',up: null },
  { name: 'S&P 500', value: '—', change: '—',        up: null },
  { name: 'BTC',     value: '—', change: '—',        up: null },
]

function TickerItem({ t, sep }: { t: TickerItem; sep: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      {sep && (
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.12)', margin: '0 28px' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
          {t.name}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {t.value}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500, color: t.up === true ? '#4ade80' : t.up === false ? '#f87171' : '#f59e0b' }}>
          {t.change}
        </span>
      </div>
    </div>
  )
}

export function TickerBar({ tickers = FALLBACK }: { tickers?: TickerItem[] }) {
  const items = tickers.length > 0 ? tickers : FALLBACK
  // Duplicar para loop contínuo sem gap visível
  const doubled = [...items, ...items]

  return (
    <div
      style={{
        background: '#0A0A0A',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          align-items: center;
          animation: ticker-scroll 40s linear infinite;
          will-change: transform;
          padding: 0 28px;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="ticker-track">
        {doubled.map((t, i) => (
          <TickerItem key={`${t.name}-${i}`} t={t} sep={i > 0} />
        ))}
      </div>
    </div>
  )
}
