import { PageGreeting } from '../_components/PageGreeting'
import { requireSession } from '@/lib/auth/session'

export default async function RelatoriosPage() {
  const session = await requireSession()

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label="Nobel Capital" />


      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          gap: 16,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--fg-faint)"
          strokeWidth="1.2"
          width="40"
          height="40"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-.01em',
          }}
        >
          Página em construção
        </p>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            color: 'var(--fg-faint)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}
        >
          em breve
        </p>
      </div>
    </div>
  )
}
