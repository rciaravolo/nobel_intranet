/**
 * /comunicados — Página de listagem de comunicados.
 * Server Component: faz fetch inicial no servidor e hidrata o Client Component.
 */
import Link from 'next/link'
import { comunicadosApi } from '@/lib/api/comunicados'
import { getSessionUser, podeCriarComunicado } from '@/lib/auth/cf-session'
import { ComunicadosList } from '@/components/features/comunicados/ComunicadosList'

export const metadata = {
  title: 'Comunicados — INTRA Nobel Capital',
}

export default async function ComunicadosPage() {
  const [comunicados, user] = await Promise.all([
    comunicadosApi.list(),
    getSessionUser(),
  ])

  const podeNovo = podeCriarComunicado(user)

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div>
          <nav aria-label="Breadcrumb" style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)', marginBottom: 4 }}>
            <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
              Início
            </Link>
            {' / '}
            <span style={{ color: '#1A1209' }}>Comunicados</span>
          </nav>
          <h1
            style={{
              fontFamily: 'var(--font-lora, serif)',
              fontSize: 24,
              fontWeight: 600,
              color: '#1A1209',
            }}
          >
            Comunicados
          </h1>
        </div>

        {/* Botão "+ Novo comunicado" — visível apenas para RH / Diretoria */}
        {podeNovo && (
          <Link
            href="/comunicados/novo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: '#1A1209',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#F6F3ED',
              textDecoration: 'none',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="13"
              height="13"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo comunicado
          </Link>
        )}
      </div>

      {/* Lista com filtros — Client Component */}
      <ComunicadosList initialData={comunicados} podeNovo={podeNovo} />
    </div>
  )
}
