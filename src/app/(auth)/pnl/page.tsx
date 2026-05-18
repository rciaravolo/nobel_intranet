import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'

export default async function PnLPage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/dashboard')
  }

  return (
    <div style={{ maxWidth: 1340 }}>
      <PageGreeting name={session.name} label="Resultado gerencial" />

      <div
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 12,
          border: '1px solid var(--line)',
          boxShadow: 'var(--e-float)',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginTop: 8,
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--fg-faint)"
          strokeWidth="1.2"
          width="36"
          height="36"
        >
          <path d="M3 3v18h18" />
          <path d="M7 16l4-4 4 4 4-6" />
        </svg>
        <p
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-.01em',
          }}
        >
          PnL — Em construção
        </p>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 12,
            color: 'var(--fg-faint)',
            letterSpacing: '.04em',
          }}
        >
          Conteúdo gerencial em breve.
        </p>
      </div>
    </div>
  )
}
