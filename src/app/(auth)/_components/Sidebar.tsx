'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { SessionPayload } from '@/lib/auth/session'

/* ─── Navigation config ───────────────────────────────────────────────────── */
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
        href: '/analises',
        label: 'Onepage',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
        href: '/relatorios',
        label: 'Relatórios',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Operacional',
    items: [
      {
        href: '/comunicados',
        label: 'Comunicados',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        ),
      },
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
    ],
  },
]

/* ─── Nobel monogram ──────────────────────────────────────────────────────── */
function NobelMono({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '1.5px solid var(--c-gold)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* vertical hairline */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          bottom: '10%',
          left: '50%',
          width: 1,
          background: 'var(--c-gold)',
          transform: 'translateX(-50%)',
          opacity: 0.5,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 500,
          fontSize: size * 0.76,
          lineHeight: 1,
          color: 'var(--fg)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        N
      </span>
    </div>
  )
}

/* ─── Nobel wordmark ──────────────────────────────────────────────────────── */
function NobelWordmark({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const lvl1 = size === 'sm' ? 15 : 20
  const lvl2 = size === 'sm' ? 8 : 10
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 500,
          fontSize: lvl1,
          letterSpacing: '.30em',
          lineHeight: 1,
          color: 'var(--fg)',
          paddingBottom: 5,
          borderBottom: '1px solid var(--c-gold)',
          textIndent: '.30em',
        }}
      >
        NOBEL
      </span>
      <span
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 400,
          fontSize: lvl2,
          letterSpacing: '.34em',
          lineHeight: 1,
          color: 'var(--fg-mute)',
          textIndent: '.34em',
        }}
      >
        CAPITAL
      </span>
    </div>
  )
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
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
        background: 'var(--bg-elev)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--line)',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── Logo / header ───────────────────────────────────── */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '20px 20px 18px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 68,
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Expandir menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <NobelMono size={32} />
          </button>
        ) : (
          <>
            {/* Nobel lockup: monogram + wordmark */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
              <NobelMono size={30} />
              <NobelWordmark size="sm" />
            </div>
            {/* Collapse button */}
            <button
              onClick={() => setCollapsed(true)}
              title="Recolher menu"
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-2)',
                cursor: 'pointer',
                color: 'var(--fg-faint)',
                flexShrink: 0,
                marginLeft: 6,
                transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--line-strong)'
                e.currentTarget.style.color = 'var(--fg-mute)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.color = 'var(--fg-faint)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: '.20em',
                  color: 'var(--fg-faint)',
                  textTransform: 'uppercase',
                  padding: '14px 8px 6px',
                  fontFamily: 'var(--f-mono)',
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
                    padding: collapsed ? '9px 0' : '7px 8px',
                    borderRadius: 'var(--r-2)',
                    textDecoration: 'none',
                    marginBottom: 1,
                    position: 'relative',
                    background: active ? 'var(--fg)' : 'transparent',
                    transition: 'background .12s',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--bg)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      flexShrink: 0,
                      color: active ? 'var(--bg)' : 'var(--fg-faint)',
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Label (expanded only) */}
                  {!collapsed && (
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: 'var(--f-text)',
                        color: active ? 'var(--bg)' : 'var(--fg-mute)',
                        fontWeight: active ? 500 : 400,
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Section divider */}
            <div
              style={{
                height: 1,
                background: 'var(--line)',
                margin: collapsed ? '10px 8px' : '8px 8px 2px',
              }}
            />
          </div>
        ))}
      </nav>

      {/* ── User footer ─────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 8px',
          borderTop: '1px solid var(--line)',
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
            padding: collapsed ? '8px 0' : '8px 8px',
            borderRadius: 'var(--r-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background .12s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--line)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-b-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              flexShrink: 0,
              fontFamily: 'var(--f-mono)',
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
                    fontFamily: 'var(--f-text)',
                    color: 'var(--fg)',
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
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    color: 'var(--fg-faint)',
                    marginTop: 2,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {session.role}
                </div>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--fg-faint)"
                strokeWidth="1.5"
                width="12"
                height="12"
                style={{ flexShrink: 0 }}
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
