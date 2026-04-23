'use client'

import type { Comunicado, ComunicadoCategoria, CriarComunicadoInput } from '@/lib/api/comunicados'
import { comunicadosApi } from '@/lib/api/comunicados'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { z } from 'zod'

const comunicadoFormSchema = z.object({
  titulo: z
    .string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  categoria: z.enum(['RH', 'Produtos', 'PJ2'] as const, {
    required_error: 'Selecione uma categoria',
  }),
  conteudo: z.string().min(20, 'Conteúdo deve ter no mínimo 20 caracteres'),
  dataExpiracao: z
    .string()
    .optional()
    .refine(
      (v) => {
        if (!v) return true
        return new Date(v) > new Date()
      },
      { message: 'A data de expiração deve ser futura' },
    ),
})

type FormData = z.infer<typeof comunicadoFormSchema>

type Props = {
  comunicadoInicial?: Comunicado
}

export function ComunicadoForm({ comunicadoInicial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const modoEdicao = Boolean(comunicadoInicial)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(comunicadoFormSchema),
    defaultValues: {
      titulo: comunicadoInicial?.titulo ?? '',
      categoria: (comunicadoInicial?.categoria as ComunicadoCategoria) ?? 'RH',
      conteudo: comunicadoInicial?.conteudo ?? '',
      dataExpiracao: comunicadoInicial?.dataExpiracao?.slice(0, 16) ?? '',
    },
  })

  const conteudoAtual = watch('conteudo')

  async function onSubmit(values: FormData) {
    setServerError(null)

    const payload: CriarComunicadoInput = {
      titulo: values.titulo,
      conteudo: values.conteudo,
      categoria: values.categoria,
      dataExpiracao: values.dataExpiracao ? new Date(values.dataExpiracao).toISOString() : null,
    }

    startTransition(async () => {
      try {
        let comunicado: Comunicado
        if (modoEdicao && comunicadoInicial) {
          comunicado = await comunicadosApi.update(comunicadoInicial.id, payload)
        } else {
          comunicado = await comunicadosApi.create(payload)
        }

        setToastMsg(
          modoEdicao ? 'Comunicado atualizado com sucesso!' : 'Comunicado publicado com sucesso!',
        )

        setTimeout(() => {
          router.push(`/comunicados/${comunicado.id}`)
        }, 1200)
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.')
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid rgba(184,150,62,0.25)',
    borderRadius: 6,
    fontSize: 14,
    color: '#1A1209',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#dc2626',
    marginTop: 4,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(26,18,9,0.6)',
    letterSpacing: '0.04em',
    marginBottom: 6,
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(184,150,62,0.12)',
        borderRadius: 10,
        padding: '32px 36px',
        boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
      }}
    >
      {toastMsg && (
        <output
          aria-live="polite"
          style={{
            display: 'block',
            padding: '10px 16px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 6,
            fontSize: 13,
            color: '#166534',
            marginBottom: 20,
          }}
        >
          {toastMsg}
        </output>
      )}

      {serverError && (
        <div
          role="alert"
          style={{
            padding: '10px 16px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 6,
            fontSize: 13,
            color: '#991b1b',
            marginBottom: 20,
          }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Título */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="titulo" style={labelStyle}>
            Título{' '}
            <span aria-hidden="true" style={{ color: '#dc2626' }}>
              *
            </span>
          </label>
          <input
            id="titulo"
            type="text"
            placeholder="Ex: Atualização de política de benefícios"
            {...register('titulo')}
            style={{
              ...inputStyle,
              borderColor: errors.titulo ? '#fca5a5' : 'rgba(184,150,62,0.25)',
            }}
            aria-describedby={errors.titulo ? 'titulo-error' : undefined}
            aria-invalid={Boolean(errors.titulo)}
            maxLength={200}
          />
          {errors.titulo && (
            <p id="titulo-error" style={errorStyle} role="alert">
              {errors.titulo.message}
            </p>
          )}
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="categoria" style={labelStyle}>
            Categoria{' '}
            <span aria-hidden="true" style={{ color: '#dc2626' }}>
              *
            </span>
          </label>
          <select
            id="categoria"
            {...register('categoria')}
            style={{
              ...inputStyle,
              cursor: 'pointer',
              borderColor: errors.categoria ? '#fca5a5' : 'rgba(184,150,62,0.25)',
            }}
            aria-describedby={errors.categoria ? 'categoria-error' : undefined}
            aria-invalid={Boolean(errors.categoria)}
          >
            <option value="RH">RH</option>
            <option value="Produtos">Produtos</option>
            <option value="PJ2">PJ2</option>
          </select>
          {errors.categoria && (
            <p id="categoria-error" style={errorStyle} role="alert">
              {errors.categoria.message}
            </p>
          )}
        </div>

        {/* Conteúdo + Preview Markdown */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="conteudo" style={labelStyle}>
            Conteúdo (Markdown){' '}
            <span aria-hidden="true" style={{ color: '#dc2626' }}>
              *
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <textarea
                id="conteudo"
                placeholder="Escreva o comunicado em Markdown..."
                rows={12}
                {...register('conteudo')}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  borderColor: errors.conteudo ? '#fca5a5' : 'rgba(184,150,62,0.25)',
                }}
                aria-describedby={errors.conteudo ? 'conteudo-error' : undefined}
                aria-invalid={Boolean(errors.conteudo)}
              />
              {errors.conteudo && (
                <p id="conteudo-error" style={errorStyle} role="alert">
                  {errors.conteudo.message}
                </p>
              )}
            </div>

            <div
              aria-label="Preview do conteúdo"
              style={{
                padding: '9px 12px',
                border: '1px solid rgba(184,150,62,0.15)',
                borderRadius: 6,
                fontSize: 14,
                color: 'rgba(26,18,9,0.8)',
                lineHeight: 1.7,
                background: '#fafaf8',
                minHeight: 120,
                wordBreak: 'break-word',
                overflowY: 'auto',
              }}
            >
              {conteudoAtual ? (
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{conteudoAtual}</ReactMarkdown>
              ) : (
                <span style={{ color: 'rgba(26,18,9,0.25)', fontStyle: 'italic' }}>
                  Preview aparecerá aqui…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data de Expiração */}
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="dataExpiracao" style={labelStyle}>
            Data de expiração{' '}
            <span style={{ fontWeight: 400, color: 'rgba(26,18,9,0.4)' }}>(opcional)</span>
          </label>
          <input
            id="dataExpiracao"
            type="datetime-local"
            {...register('dataExpiracao')}
            style={{
              ...inputStyle,
              maxWidth: 280,
              borderColor: errors.dataExpiracao ? '#fca5a5' : 'rgba(184,150,62,0.25)',
            }}
            aria-describedby={errors.dataExpiracao ? 'expiracao-error' : undefined}
            aria-invalid={Boolean(errors.dataExpiracao)}
          />
          {errors.dataExpiracao && (
            <p id="expiracao-error" style={errorStyle} role="alert">
              {errors.dataExpiracao.message}
            </p>
          )}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '10px 24px',
              background: isPending ? 'rgba(26,18,9,0.4)' : '#1A1209',
              color: '#F6F3ED',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            aria-busy={isPending}
          >
            {isPending && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {isPending ? 'Publicando…' : modoEdicao ? 'Salvar alterações' : 'Publicar'}
          </button>

          <a
            href="/comunicados"
            style={{
              fontSize: 13,
              color: 'rgba(26,18,9,0.45)',
              textDecoration: 'none',
            }}
          >
            Cancelar
          </a>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
