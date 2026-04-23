'use client'

import { usePathname } from 'next/navigation'
import type { SessionPayload } from '@/lib/auth/session'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/relatorios':   'Relatórios',
  '/carteiras':    'Carteiras',
  '/clientes':     'Clientes',
  '/analises':     'Análises',
  '/documentos':   'Documentos',
  '/agenda':       'Agenda',
  '/comunicados':  'Comunicados',
  '/automacoes':   'Automações',
  '/configuracoes':'Configurações',
}

const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
const DAYS   = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

function formatDate() {
  const now = new Date()
  return `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`
}

interface Props { session: SessionPayload }

export function Topbar({ session }: Props) {
  const pathname = usePathname()
  const title    = PAGE_TITLES[pathname] ?? 'INTRA'
  const initials = session.name.split(' ').map((n) => n[0]).slice(0, 2).join('')

  return (
    <header
      style={{
        height: 60,
        background: '#FDFAF5',
        borderBottom: '1px solid rgba(184,150,62,0.13)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1
          style={{
            fontFamily: 'var(--font-lora, serif)',
            fontSize: 17,
            fontWeight: 500,
            color: '#1A1209',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </h1>
        <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.3)' }}>— {formatDate()}</span>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#F6F3ED',
          border: '1px solid rgba(184,150,62,0.18)',
          borderRadius: 6,
          padding: '8px 14px',
          width: 220,
          cursor: 'text',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(26,18,9,0.3)" strokeWidth="1.5" width="13" height="13">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ fontSize: 13, color: 'rgba(26,18,9,0.3)' }}>Buscar...</span>
      </div>

      {/* Notifications */}
      <button
        style={{
          width: 34,
          height: 34,
          borderRadius: 6,
          border: '1px solid rgba(184,150,62,0.18)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(26,18,9,0.5)" strokeWidth="1.5" width="15" height="15">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 6,
            height: 6,
            background: '#B8963E',
            borderRadius: '50%',
            border: '1.5px solid #FDFAF5',
          }}
        />
      </button>

      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #B8963E 0%, #8B6914 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--font-lora, serif)',
          flexShrink: 0,
        }}
        title={session.name}
      >
        {initials}
      </div>
    </header>
  )
}
