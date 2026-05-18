'use client'

import type { SessionPayload } from '@/lib/auth/session'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/* ─── Colors ──────────────────────────────────────────────────────────────── */
const C = {
  bg: '#0C0C0C',
  border: 'rgba(255,255,255,0.06)',
  gold: '#B8963E',
  goldDim: 'rgba(184,150,62,0.12)',
  white: '#FFFFFF',
  textMute: 'rgba(255,255,255,0.5)',
  textFaint: '#8A8A8A',
  hover: 'rgba(255,255,255,0.05)',
}

/* ─── Navigation config ───────────────────────────────────────────────────── */
type NavGroup = { section: string; adminOnly?: boolean; items: { href: string; label: string; icon: React.ReactNode; badge?: number }[] }
const NAV: NavGroup[] = [
  {
    section: 'Principal',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: '/analises',
        label: 'Onepage',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
      {
        href: '/carteiras',
        label: 'Carteiras',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
          </svg>
        ),
      },
      {
        href: '/clientes',
        label: 'Clientes',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        href: '/relatorios',
        label: 'Relatórios',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 3h18v18H3z M3 9h18 M9 3v18" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Gerencial',
    adminOnly: true,
    items: [
      {
        href: '/pnl',
        label: 'PnL',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 4 4 4-6" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Gestão',
    items: [
      {
        href: '/configuracoes',
        label: 'Configurações',
        icon: (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },
    ],
  },
]

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
interface Props {
  session: SessionPayload
}

export function Sidebar({ session }: Props) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const pathname = usePathname()

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])
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
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${C.border}`,
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── Logo ────────────────────────────────────────────── */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '28px 24px 20px',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expandir menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* Collapsed: just the N emblem */}
            <div
              style={{
                width: 32,
                height: 32,
                border: `2px solid ${C.gold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.white,
                  lineHeight: 1,
                }}
              >
                N
              </span>
            </div>
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-lockup-ivory.png"
                alt="Nobel Capital"
                style={{ height: 48, width: 'auto', display: 'block' }}
              />
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                title="Recolher menu"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: C.textFaint,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  marginTop: 4,
                  transition: 'color .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.white }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textFaint }}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
            {/* Gold gradient divider */}
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, ${C.gold} 0%, transparent 100%)`,
                marginTop: 14,
                opacity: 0.7,
              }}
            />
          </>
        )}
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.filter((group) => !group.adminOnly || session.role === 'admin' || session.role === 'master').map((group, gi) => (
          <div key={group.section}>
            {!collapsed && (
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: C.textFaint,
                  textTransform: 'uppercase',
                  padding: gi === 0 ? '8px 0 8px' : '16px 0 8px',
                  fontWeight: 500,
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
                    padding: collapsed ? '9px 0' : '9px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    marginBottom: 2,
                    position: 'relative',
                    background: active ? C.goldDim : 'transparent',
                    borderLeft:
                      active && !collapsed ? `2px solid ${C.gold}` : '2px solid transparent',
                    transition: 'background .15s',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = C.hover
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      color: active ? C.gold : C.textMute,
                      opacity: active ? 1 : 1,
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Label + Badge (expanded only) */}
                  {!collapsed && (
                    <>
                      <span
                        style={{
                          fontSize: 13,
                          color: active ? C.white : C.textMute,
                          fontWeight: active ? 500 : 400,
                          whiteSpace: 'nowrap',
                          flex: 1,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {item.label}
                      </span>
                      {'badge' in item && typeof item.badge === 'number' && item.badge > 0 ? (
                        <span
                          style={{
                            background: C.gold,
                            color: '#0A0A0A',
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 20,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {item.badge as number}
                        </span>
                      ) : null}
                    </>
                  )}
                </Link>
              )
            })}

            {/* Gold gradient section divider */}
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, ${C.gold} 0%, transparent 100%)`,
                margin: collapsed ? '10px 4px' : '8px 0 2px',
                opacity: 0.3,
              }}
            />
          </div>
        ))}
      </nav>

      {/* ── User footer ─────────────────────────────────────── */}
      <div
        style={{
          padding: '12px',
          borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? `${session.name} — clique para sair` : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '10px 12px',
            borderRadius: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background .15s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.gold} 0%, #8B6914 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: C.white,
              flexShrink: 0,
              fontFamily: 'var(--f-display)',
              letterSpacing: '0.05em',
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
                    color: C.white,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '0.01em',
                  }}
                >
                  {session.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.textFaint,
                    marginTop: 1,
                  }}
                >
                  {session.role}
                </div>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke={C.textFaint}
                strokeWidth="1.5"
                width="14"
                height="14"
                style={{ flexShrink: 0, opacity: 0.3 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
