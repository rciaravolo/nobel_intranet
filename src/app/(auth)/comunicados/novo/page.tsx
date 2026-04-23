/**
 * /comunicados/novo — Página de criação de comunicado.
 * Server Component: verifica permissão antes de renderizar o formulário.
 */
import Link from 'next/link'
import { getSessionUser, podeCriarComunicado } from '@/lib/auth/cf-session'
import { ComunicadoForm } from '@/components/features/comunicados/ComunicadoForm'

export const metadata = {
  title: 'Novo comunicado — INTRA Nobel Capital',
}

export default async function NovoComunicadoPage() {
  const user = await getSessionUser()
  const temPermissao = podeCriarComunicado(user)

  if (!temPermissao) {
    return (
      <div style={{ maxWidth: 600 }}>
        <nav
          aria-label="Breadcrumb"
          style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)', marginBottom: 24 }}
        >
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
            Início
          </Link>
          {' / '}
          <Link href="/comunicados" style={{ color: 'inherit', textDecoration: 'none' }}>
            Comunicados
          </Link>
          {' / '}
          <span style={{ color: '#1A1209' }}>Novo comunicado</span>
        </nav>

        <div
          role="alert"
          style={{
            padding: '32px 36px',
            background: '#fff',
            border: '1px solid rgba(184,150,62,0.12)',
            borderRadius: 10,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: 'rgba(26,18,9,0.7)',
              lineHeight: 1.6,
            }}
          >
            Você não tem permissão para criar comunicados.
            <br />
            Entre em contato com o RH.
          </p>
          <Link
            href="/comunicados"
            style={{
              display: 'inline-block',
              marginTop: 20,
              fontSize: 12,
              color: 'rgba(26,18,9,0.45)',
              textDecoration: 'none',
            }}
          >
            ← Voltar para Comunicados
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)', marginBottom: 24 }}
      >
        <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
          Início
        </Link>
        {' / '}
        <Link href="/comunicados" style={{ color: 'inherit', textDecoration: 'none' }}>
          Comunicados
        </Link>
        {' / '}
        <span style={{ color: '#1A1209' }}>Novo comunicado</span>
      </nav>

      <h1
        style={{
          fontFamily: 'var(--font-lora, serif)',
          fontSize: 22,
          fontWeight: 600,
          color: '#1A1209',
          marginBottom: 24,
        }}
      >
        Novo comunicado
      </h1>

      <ComunicadoForm />
    </div>
  )
}
