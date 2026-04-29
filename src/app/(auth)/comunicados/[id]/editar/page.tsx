import { ComunicadoForm } from '@/components/features/comunicados/ComunicadoForm'
import { comunicadosApi } from '@/lib/api/comunicados'
import { getSessionUser, podeEditarComunicado } from '@/lib/auth/cf-session'
/**
 * /comunicados/[id]/editar — Página de edição de comunicado.
 * Server Component: verifica permissão e carrega dados iniciais.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  try {
    const comunicado = await comunicadosApi.get(id)
    return { title: `Editar: ${comunicado.titulo} — INTRA Nobel Capital` }
  } catch {
    return { title: 'Editar comunicado — INTRA Nobel Capital' }
  }
}

export default async function EditarComunicadoPage({ params }: Props) {
  const { id } = await params

  let comunicado: Awaited<ReturnType<typeof comunicadosApi.get>>
  try {
    comunicado = await comunicadosApi.get(id)
  } catch {
    notFound()
  }

  const user = await getSessionUser()

  if (!podeEditarComunicado(user, comunicado.autorEmail)) {
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
          <Link href={`/comunicados/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {comunicado.titulo.length > 30
              ? `${comunicado.titulo.slice(0, 30)}…`
              : comunicado.titulo}
          </Link>
          {' / '}
          <span style={{ color: '#1A1209' }}>Editar</span>
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
          <p style={{ fontSize: 15, color: 'rgba(26,18,9,0.7)', lineHeight: 1.6 }}>
            Você não tem permissão para editar este comunicado.
            <br />
            Entre em contato com o RH.
          </p>
          <Link
            href={`/comunicados/${id}`}
            style={{
              display: 'inline-block',
              marginTop: 20,
              fontSize: 12,
              color: 'rgba(26,18,9,0.45)',
              textDecoration: 'none',
            }}
          >
            ← Voltar para o comunicado
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
        <Link href={`/comunicados/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {comunicado.titulo.length > 30 ? `${comunicado.titulo.slice(0, 30)}…` : comunicado.titulo}
        </Link>
        {' / '}
        <span style={{ color: '#1A1209' }}>Editar</span>
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
        Editar comunicado
      </h1>

      <ComunicadoForm comunicadoInicial={comunicado} />
    </div>
  )
}
