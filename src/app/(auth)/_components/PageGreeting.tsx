type Props = {
  name: string
  label?: string
  right?: React.ReactNode
}

export function PageGreeting({ name, label, right }: Props) {
  const firstName = name.split(' ')[0]
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="page-header">
      <div>
        {label && (
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--fg-faint)',
              marginBottom: 4,
            }}
          >
            {label}
          </p>
        )}
        <h1
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 26,
            fontWeight: 600,
            color: 'var(--fg)',
            lineHeight: 1.15,
            letterSpacing: '-.02em',
          }}
        >
          {saudacao},{' '}
          <span
            style={{
              fontFamily: 'var(--f-display)',
              fontStyle: 'italic',
              color: 'var(--c-gold)',
              fontWeight: 400,
            }}
          >
            {firstName}
          </span>{' '}
          <span style={{ color: 'var(--c-gold)', fontSize: 18 }}>♦</span>
        </h1>
      </div>
      {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>}
    </div>
  )
}
