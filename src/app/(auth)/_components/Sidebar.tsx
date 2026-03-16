'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  {
    section: 'Principal',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: '/relatorios',
        label: 'Relatórios',
        badge: 3,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        href: '/carteiras',
        label: 'Carteiras',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
          </svg>
        ),
      },
      {
        href: '/clientes',
        label: 'Clientes',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        href: '/analises',
        label: 'Análises',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Operacional',
    items: [
      {
        href: '/documentos',
        label: 'Documentos',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
      },
      {
        href: '/agenda',
        label: 'Agenda',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        href: '/comunicados',
        label: 'Comunicados',
        badge: 7,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
          </svg>
        ),
      },
      {
        href: '/automacoes',
        label: 'Automações',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        background: '#0C0C0C',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Image
          src="/logo-dark.png"
          alt="Nobel Capital"
          width={160}
          height={34}
          priority
          style={{ height: 34, width: 'auto' }}
        />
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, #D4A96A 0%, transparent 100%)',
            marginTop: 14,
            opacity: 0.5,
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map((group) => (
          <div key={group.section}>
            <p
              style={{
                fontSize: 9,
                letterSpacing: '0.18em',
                color: '#555',
                textTransform: 'uppercase',
                padding: '14px 12px 6px',
                fontWeight: 500,
              }}
            >
              {group.section}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    marginBottom: 2,
                    position: 'relative',
                    background: active ? 'rgba(184,150,62,0.12)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 2,
                        height: 18,
                        background: '#B8963E',
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      opacity: active ? 1 : 0.4,
                      flexShrink: 0,
                      color: active ? '#B8963E' : '#fff',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: '#B8963E',
                        color: '#0A0A0A',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 20,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, rgba(184,150,62,0.2) 0%, transparent 100%)',
                margin: '8px 12px',
              }}
            />
          </div>
        ))}

        {/* Config */}
        <Link
          href="/configuracoes"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          <div style={{ width: 16, height: 16, opacity: 0.4, color: '#fff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Configurações</span>
        </Link>
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8963E 0%, #8B6914 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              flexShrink: 0,
              fontFamily: 'var(--font-lora, serif)',
            }}
          >
            RB
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Rafael Brandão</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Admin · Nobel Capital</div>
          </div>
          <div style={{ marginLeft: 'auto', opacity: 0.25 }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              width="14"
              height="14"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </div>
        </button>
      </div>
    </aside>
  )
}
