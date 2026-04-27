'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { SessionPayload } from '@/lib/auth/session'

const NAV = [
  {
    section: 'Principal',
    items: [
      {
        href: '/dashboard',
        label: 'Início',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
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
        label: 'Onepage',
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
        href: '/comunicados',
        label: 'Comunicados',
        badge: 2,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
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

interface Props {
  session: SessionPayload
}

export function Sidebar({ session }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const initials = session.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{
        width: collapsed ? 64 : 248,
        flexShrink: 0,
        background: '#FDFAF5',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(184,150,62,0.15)',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo / Header */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '20px 16px 16px',
          borderBottom: '1px solid rgba(184,150,62,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 72,
          flexShrink: 0,
          transition: 'padding 0.25s',
        }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Expandir menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8963E, #8B6914)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'var(--font-lora, serif)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            N
          </button>
        ) : (
          <>
            <div style={{ overflow: 'hidden' }}>
              <Image
                src="/logo-light.png"
                alt="Nobel Capital"
                width={140}
                height={30}
                priority
                style={{ height: 30, width: 'auto', display: 'block' }}
              />
              <div
                style={{
                  height: 1,
                  background: 'linear-gradient(90deg, #B8963E 0%, transparent 100%)',
                  marginTop: 10,
                  opacity: 0.3,
                }}
              />
            </div>
            <button
              onClick={() => setCollapsed(true)}
              title="Recolher menu"
              style={{
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(184,150,62,0.07)',
                border: '1px solid rgba(184,150,62,0.15)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'rgba(26,18,9,0.4)',
                flexShrink: 0,
                marginLeft: 8,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,150,62,0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(184,150,62,0.07)')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '8px 10px' : '8px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.filter((g) => g.section !== 'Operacional').map((group) => (
          <div key={group.section}>
            {/* Section label */}
            <div style={{ height: collapsed ? 10 : 0, transition: 'height 0.2s' }} />
            {!collapsed && (
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: 'rgba(26,18,9,0.28)',
                  textTransform: 'uppercase',
                  padding: '12px 10px 5px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {group.section}
              </p>
            )}

            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '9px 0' : '8px 10px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    marginBottom: 1,
                    position: 'relative',
                    background: active ? 'rgba(184,150,62,0.1)' : 'transparent',
                    transition: 'background 0.15s',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                >
                  {/* Active indicator */}
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

                  {/* Icon */}
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      color: active ? '#B8963E' : 'rgba(26,18,9,0.35)',
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Label + badge (expanded only) */}
                  {!collapsed && (
                    <>
                      <span
                        style={{
                          fontSize: 13,
                          color: active ? '#1A1209' : 'rgba(26,18,9,0.5)',
                          fontWeight: active ? 500 : 400,
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            background: '#B8963E',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 20,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Badge dot (collapsed only) */}
                  {collapsed && item.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#B8963E',
                      }}
                    />
                  )}
                </Link>
              )
            })}

            <div
              style={{
                height: 1,
                background: 'rgba(184,150,62,0.09)',
                margin: collapsed ? '8px 4px' : '8px 10px',
              }}
            />
          </div>
        ))}

        {/* Config — oculto por hora */}
        {false && <Link
          href="/configuracoes"
          title={collapsed ? 'Configurações' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '9px 0' : '8px 10px',
            borderRadius: 6,
            textDecoration: 'none',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div style={{ width: 16, height: 16, color: 'rgba(26,18,9,0.3)', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          {!collapsed && (
            <span style={{ fontSize: 13, color: 'rgba(26,18,9,0.45)' }}>Configurações</span>
          )}
        </Link>}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: collapsed ? '10px 10px' : '10px 10px',
          borderTop: '1px solid rgba(184,150,62,0.12)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleLogout}
          title={collapsed ? `${session.name} — clique para sair` : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '9px 10px',
            borderRadius: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background 0.15s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,150,62,0.07)')}
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
            {initials}
          </div>
          {!collapsed && (
            <>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: '#1A1209',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {session.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(26,18,9,0.4)',
                    marginTop: 1,
                    textTransform: 'capitalize',
                  }}
                >
                  {session.role} · Nobel Capital
                </div>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(26,18,9,0.28)"
                  strokeWidth="1.5"
                  width="13"
                  height="13"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </div>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
