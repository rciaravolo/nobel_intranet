import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'

export default async function SaudeClientePage() {
  const session = await requireSession()

  const allowedRoles = ['admin', 'master', 'lider', 'assessor']
  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard')
  }

  return (
    <div style={{ maxWidth: 1400 }}>
      <PageGreeting name={session.name} label="Saúde do Cliente" />

      <div
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          boxShadow: 'var(--e-float)',
          padding: '48px 32px',
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--fg-faint)',
            textTransform: 'uppercase',
            letterSpacing: '.10em',
            marginBottom: 14,
          }}
        >
          Em construção
        </p>
        <p
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 16,
            color: 'var(--fg-mute)',
            lineHeight: 1.5,
          }}
        >
          O painel de saúde do cliente será disponibilizado em breve.
        </p>
      </div>
    </div>
  )
}
