'use client'
import {
  Bell,
  ChevronRight,
  Settings as Cog,
  Eye,
  Grid3x3,
  Lock,
  LogOut,
  type LucideIcon,
  Moon,
  RefreshCw,
  Sun,
  User as UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from '../../_components/Avatar'
import { useMobileTheme } from '../../_components/MobileShell'
import { ScreenHeader } from '../../_components/ScreenHeader'
import type { MobileUser } from '../../_lib/types'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'

const T = {
  bg: '#000',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  danger: '#e05252',
  iconBg: 'rgba(255,255,255,0.06)',
}

interface Props {
  user: MobileUser
}

export function SettingsClient({ user }: Props) {
  const router = useRouter()
  const { theme, toggleTheme } = useMobileTheme()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        background: T.bg,
        color: T.text,
        paddingBottom: 60,
      }}
    >
      <ScreenHeader
        title="Configurações"
        eyebrow="PERFIL DO ASSESSOR"
        onBack={() => router.back()}
      />

      {/* Profile card */}
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderRadius: 12,
            padding: '20px 18px',
            background: T.card,
            border: `1px solid ${T.border}`,
          }}
        >
          <Avatar initials={user.initials} size={64} ring={T.gold} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 22,
                fontWeight: 500,
                color: T.text,
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 12,
                color: T.muted,
                marginTop: 2,
              }}
            >
              {user.role} · Nobel Capital
            </div>
          </div>
        </div>
      </div>

      <SettingsGroup label="PREFERÊNCIAS">
        <Row
          icon={theme === 'dark' ? Moon : Sun}
          title="Tema"
          value={theme === 'dark' ? 'Escuro' : 'Claro'}
          onTap={toggleTheme}
        />
        <Row icon={Bell} title="Notificações" value="Push, e-mail" />
        <RowToggle icon={Eye} title="Ocultar valores em público" />
        <Row icon={Grid3x3} title="Tela inicial" value="Onepage" isLast />
      </SettingsGroup>

      <SettingsGroup label="CONTA">
        <Row icon={UserIcon} title="Dados pessoais" />
        <Row icon={Lock} title="Senha e biometria" />
        <Row icon={RefreshCw} title="Sincronização XP" value="Há 2 min" />
        <Row icon={Cog} title="Avançado" isLast />
      </SettingsGroup>

      <SettingsGroup>
        <Row icon={LogOut} title="Sair" tone="red" onTap={handleLogout} isLast />
      </SettingsGroup>

      <div
        style={{
          padding: '24px 16px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 11, color: T.muted }}>
          Nobel Capital · Intranet Mobile
        </div>
        <div style={{ fontFamily: SANS, fontSize: 10, color: T.muted, marginTop: 2 }}>
          versão 1.0.0
        </div>
      </div>
    </div>
  )
}

// ─── SettingsGroup ────────────────────────────────────────────────────────────
function SettingsGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 16px 0' }}>
      {label && (
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          overflow: 'hidden',
          borderRadius: 12,
          background: T.card,
          border: `1px solid ${T.border}`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function Row({
  icon: Icon,
  title,
  value,
  isLast,
  onTap,
  tone,
}: {
  icon: LucideIcon
  title: string
  value?: string
  isLast?: boolean
  onTap?: () => void
  tone?: 'red'
}) {
  const isDestructive = tone === 'red'
  const rowColor = isDestructive ? T.danger : T.text

  return (
    <button
      type="button"
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : `1px solid rgba(255,255,255,0.05)`,
        padding: '13px 14px',
        cursor: 'pointer',
        color: rowColor,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: isDestructive ? 'rgba(224,82,82,0.12)' : T.iconBg,
          flexShrink: 0,
        }}
      >
        <Icon
          size={16}
          color={isDestructive ? T.danger : T.muted}
        />
      </div>
      <span
        style={{
          flex: 1,
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 500,
          color: rowColor,
        }}
      >
        {title}
      </span>
      {value && (
        <span
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: T.muted,
          }}
        >
          {value}
        </span>
      )}
      {!isDestructive && <ChevronRight size={14} color={T.muted} />}
    </button>
  )
}

// ─── RowToggle ────────────────────────────────────────────────────────────────
function RowToggle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  const [on, setOn] = useState(true)
  return (
    <button
      type="button"
      onClick={() => setOn((o) => !o)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
        padding: '13px 14px',
        cursor: 'pointer',
        color: T.text,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: T.iconBg,
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={T.muted} />
      </div>
      <span
        style={{
          flex: 1,
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 500,
          color: T.text,
        }}
      >
        {title}
      </span>
      {/* Toggle switch */}
      <div
        style={{
          position: 'relative',
          width: 42,
          height: 24,
          borderRadius: 9999,
          background: on ? T.gold : 'rgba(255,255,255,0.15)',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: 'white',
            transition: 'left 0.2s',
          }}
        />
      </div>
    </button>
  )
}
