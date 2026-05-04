import { requireSession } from '@/lib/auth/session'

export default async function AutomacoesPage() {
  await requireSession()
  return (
    <ComingSoon
      title="Automações"
      desc="Central de automações internas: robôs de coleta de dados, envio de relatórios e integração com sistemas XP."
      icon="⚡"
      items={[
        'XPerformance — coleta automática de dados',
        'Envio de relatórios mensais por e-mail',
        'Integração com sistemas internos XP',
        'Alertas de captação e resgates',
        'Logs e monitoramento de execução',
      ]}
    />
  )
}

function ComingSoon({
  title,
  desc,
  icon,
  items,
}: { title: string; desc: string; icon: string; items: string[] }) {
  return (
    <div style={{ maxWidth: 700, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 20 }}>{icon}</div>
      <span
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--c-gold)',
          background: 'color-mix(in oklch, var(--c-gold) 10%, transparent)',
          padding: '4px 12px',
          borderRadius: 20,
        }}
      >
        Em desenvolvimento
      </span>
      <h1
        style={{
          fontFamily: 'var(--f-text)',
          fontSize: 32,
          fontWeight: 600,
          color: 'var(--fg)',
          letterSpacing: '-.02em',
          margin: '18px 0 12px',
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--fg-mute)', lineHeight: 1.7, marginBottom: 36 }}>
        {desc}
      </p>
      <div
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '28px 32px',
          textAlign: 'left',
          boxShadow: 'var(--e-float)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--fg-faint)',
            marginBottom: 16,
          }}
        >
          Funcionalidades planejadas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: 'var(--fg)',
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--c-gold)',
                  flexShrink: 0,
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
