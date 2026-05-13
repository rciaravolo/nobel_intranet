'use client'

import { useEffect, useState } from 'react'

type Props = {
  name: string
  label?: string
  right?: React.ReactNode
}

function getSaudacao(hora: number) {
  if (hora >= 3 && hora < 12) return 'Bom dia'
  if (hora >= 12 && hora < 19) return 'Boa tarde'
  return 'Boa noite' // 19h–02h59
}

export function PageGreeting({ name, label, right }: Props) {
  const firstName = name.split(' ')[0]
  const [saudacao, setSaudacao] = useState<string | null>(null)

  useEffect(() => {
    setSaudacao(getSaudacao(new Date().getHours()))
  }, [])

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
            minHeight: '1.15em',
          }}
        >
          {saudacao ? (
            <>
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
            </>
          ) : (
            <span style={{ opacity: 0 }}>—</span>
          )}
        </h1>
      </div>
      {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>}
    </div>
  )
}
