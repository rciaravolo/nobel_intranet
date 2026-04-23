'use client'

/**
 * ComunicadoForm — Client Component
 *
 * Formulário de criação/edição de comunicado com:
 * - React Hook Form + Zod para validação
 * - Preview Markdown ao lado do textarea de conteúdo
 * - Loading state no submit
 * - Redirect para /comunicados/[id] após sucesso
 * - Toast de sucesso/erro
 *
 * TODO: instalar dependências de formulário:
 *   npm install react-hook-form @hookform/resolvers
 * TODO: instalar react-markdown + rehype-sanitize para o preview:
 *   npm install react-markdown rehype-sanitize
 *
 * Por ora, usa estado local para simular validação e preview como texto puro.
 */

import type { Comunicado, ComunicadoCategoria, CriarComunicadoInput } from '@/lib/api/comunicados'
import { comunicadosApi } from '@/lib/api/comunicados'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { z } from 'zod'

// TODO: descomentar quando react-hook-form instalado:
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'

// ---------------------------------------------------------------------------
// Schema de validação do formulário (espelhando o server-side)
// ---------------------------------------------------------------------------

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
  /** Se fornecido, o formulário opera em modo de edição */
  comunicadoInicial?: Comunicado
}

type FieldError = Partial<Record<keyof FormData, string>>

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function ComunicadoForm({ comunicadoInicial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [values, setValues] = useState<FormData>({
    titulo: comunicadoInicial?.titulo ?? '',
    categoria: (comunicadoInicial?.categoria as ComunicadoCategoria) ?? 'RH',
    conteudo: comunicadoInicial?.conteudo ?? '',
    dataExpiracao: comunicadoInicial?.dataExpiracao?.slice(0, 16) ?? '',
  })

  const [errors, setErrors] = useState<FieldError>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const modoEdicao = Boolean(comunicadoInicial)

  // Validação inline de um campo
  function validateField(name: keyof FormData, value: unknown) {
    const partial = comunicadoFormSchema.shape[name]
    const result = partial.safeParse(value)
    setErrors((prev) => ({
      ...prev,
      [name]: result.success ? undefined : result.error.errors[0]?.message,
    }))
  }

  function handleChange<K extends keyof FormData>(name: K, value: FormData[K]) {
    setValues((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    // Validação completa antes do submit
    const result = comunicadoFormSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: FieldError = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    const payload: CriarComunicadoInput = {
      titulo: result.data.titulo,
      conteudo: result.data.conteudo,
      categoria: result.data.categoria,
      dataExpiracao: result.data.dataExpiracao
        ? new Date(result.data.dataExpiracao).toISOString()
        : null,
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

        // Redireciona para o detalhe após breve delay para o toast ser visto
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
      {/* Toast de sucesso */}
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

      {/* Erro de servidor */}
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

      <form onSubmit={handleSubmit} noValidate>
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
            value={values.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
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
              {errors.titulo}
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
            value={values.categoria}
            onChange={(e) => handleChange('categoria', e.target.value as ComunicadoCategoria)}
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
              {errors.categoria}
            </p>
          )}
        </div>

        {/* Conteúdo + Preview */}
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
                value={values.conteudo}
                onChange={(e) => handleChange('conteudo', e.target.value)}
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
                  {errors.conteudo}
                </p>
              )}
            </div>

            {/* Preview — TODO: substituir por ReactMarkdown quando instalado */}
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
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowY: 'auto',
              }}
            >
              {values.conteudo || (
                <span style={{ color: 'rgba(26,18,9,0.25)', fontStyle: 'italic' }}>
                  Preview aparecerá aqui…
                  {/* TODO: renderizar como Markdown com react-markdown */}
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
            value={values.dataExpiracao ?? ''}
            onChange={(e) => handleChange('dataExpiracao', e.target.value || undefined)}
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
              {errors.dataExpiracao}
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

      {/* Spinner animation (sem Tailwind aqui pois usa keyframes) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
