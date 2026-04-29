import { ArquivarButton } from '@/components/features/comunicados/ArquivarButton'
import { comunicadosApi } from '@/lib/api/comunicados'
import { getSessionUser, podeEditarComunicado } from '@/lib/auth/cf-session'
/**
 * /comunicados/[id] — Página de detalhe de comunicado.
 * Server Component: faz fetch pelo ID, exibe conteúdo Markdown e banners de status.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  try {
    const comunicado = await comunicadosApi.get(id)
    return { title: `${comunicado.titulo} — INTRA Nobel Capital` }
  } catch {
    return { title: 'Comunicado — INTRA Nobel Capital' }
  }
}

export default async function ComunicadoDetailPage({ params }: Props) {
  const { id } = await params

  let comunicado: Awaited<ReturnType<typeof comunicadosApi.get>>
  try {
    comunicado = await comunicadosApi.get(id)
  } catch {
    notFound()
  }

  const user = await getSessionUser()

  const agora = new Date()
  const expirado = comunicado.dataExpiracao !== null && new Date(comunicado.dataExpiracao) < agora

  const arquivado = !comunicado.ativo

  const podeEditar = podeEditarComunicado(user, comunicado.autorEmail)

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(comunicado.criadoEm))

  const dataExpiracaoFormatada = comunicado.dataExpiracao
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(comunicado.dataExpiracao))
    : null

  // Iniciais do autor para o avatar
  const iniciais = comunicado.autorNome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)', marginBottom: 20 }}
      >
        <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
          Início
        </Link>
        {' / '}
        <Link href="/comunicados" style={{ color: 'inherit', textDecoration: 'none' }}>
          Comunicados
        </Link>
        {' / '}
        <span style={{ color: '#1A1209' }}>
          {comunicado.titulo.length > 40 ? `${comunicado.titulo.slice(0, 40)}…` : comunicado.titulo}
        </span>
      </nav>

      {/* Banner: Comunicado arquivado */}
      {arquivado && (
        <div
          role="alert"
          style={{
            padding: '10px 16px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 13,
            color: '#374151',
            marginBottom: 16,
          }}
        >
          Este comunicado foi arquivado.
        </div>
      )}

      {/* Banner: Comunicado expirado */}
      {expirado && !arquivado && (
        <div
          role="alert"
          style={{
            padding: '10px 16px',
            background: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: 6,
            fontSize: 13,
            color: '#713f12',
            marginBottom: 16,
          }}
        >
          Este comunicado expirou em {dataExpiracaoFormatada} e não está mais na listagem ativa.
        </div>
      )}

      {/* Card principal */}
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(184,150,62,0.12)',
          borderRadius: 10,
          padding: '32px 36px',
          boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
        }}
      >
        {/* Categoria */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#B8963E',
              background: 'rgba(184,150,62,0.1)',
              padding: '3px 8px',
              borderRadius: 3,
            }}
          >
            {comunicado.categoria}
          </span>
        </div>

        {/* Título */}
        <h1
          style={{
            fontFamily: 'var(--font-lora, serif)',
            fontSize: 26,
            fontWeight: 600,
            color: '#1A1209',
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          {comunicado.titulo}
        </h1>

        {/* Autor e data */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(184,150,62,0.1)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8963E, #D4A96A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {iniciais}
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>
              {comunicado.autorNome}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', marginLeft: 8 }}>
              {dataFormatada}
            </span>
          </div>
        </div>

        {/* Conteúdo Markdown */}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: 'rgba(26,18,9,0.8)',
            wordBreak: 'break-word',
          }}
        >
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{comunicado.conteudo}</ReactMarkdown>
        </div>

        {/* Ações: Editar / Arquivar — só para quem tem permissão */}
        {podeEditar && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid rgba(184,150,62,0.1)',
            }}
          >
            <Link
              href={`/comunicados/${comunicado.id}/editar`}
              style={{
                padding: '8px 18px',
                background: '#1A1209',
                color: '#F6F3ED',
                borderRadius: 5,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Editar
            </Link>
            <ArquivarButton comunicadoId={comunicado.id} />
          </div>
        )}
      </div>

      {/* Voltar */}
      <div style={{ marginTop: 20 }}>
        <Link
          href="/comunicados"
          style={{
            fontSize: 12,
            color: 'rgba(26,18,9,0.45)',
            textDecoration: 'none',
          }}
        >
          ← Comunicados
        </Link>
      </div>
    </div>
  )
}
