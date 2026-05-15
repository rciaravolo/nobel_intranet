'use client'

import type { SessionPayload } from '@/lib/auth/session'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/relatorios': 'Relatórios',
  '/carteiras': 'Carteiras',
  '/clientes': 'Clientes',
  '/analises': 'Onepage',
  '/documentos': 'Documentos',
  '/agenda': 'Agenda',
  '/comunicados': 'Comunicados',
  '/automacoes': 'Automações',
  '/configuracoes': 'Configurações',
}

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]
const DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

function formatDate() {
  const now = new Date()
  return `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`
}

interface Props {
  session: SessionPayload
}

export function Topbar({ session }: Props) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'INTRA'
  const _initials = session.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <header
      style={{
        height: 64,
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Title + date */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <h1
          style={{
            fontFamily: 'var(--font-lora, var(--f-display), serif)',
            fontSize: 18,
            fontWeight: 500,
            color: '#0A0A0A',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </h1>
        <span style={{ fontSize: 12, color: '#8A8A8A', marginLeft: 4 }}>— {formatDate()}</span>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#F5F4F0',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 8,
          padding: '8px 14px',
          width: 220,
          cursor: 'text',
          transition: 'border-color .15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#D4AF6A'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,0.08)'
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8A8A8A"
          strokeWidth="1.5"
          width="14"
          height="14"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={{ fontSize: 13, color: '#B0B0B0' }}>Buscar...</span>
      </div>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notificações"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'border-color .15s, background .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F5F4F0'
          e.currentTarget.style.borderColor = '#B8963E'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3D3D3D"
          strokeWidth="1.5"
          width="16"
          height="16"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {/* gold dot */}
        <div
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 7,
            height: 7,
            background: '#B8963E',
            borderRadius: '50%',
            border: '1.5px solid #FFFFFF',
          }}
        />
      </button>

      {/* User icon button */}
      <button
        type="button"
        aria-label={session.name}
        title={session.name}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-color .15s, background .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F5F4F0'
          e.currentTarget.style.borderColor = '#B8963E'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3D3D3D"
          strokeWidth="1.5"
          width="16"
          height="16"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 10-16 0" />
        </svg>
      </button>
    </header>
  )
}
