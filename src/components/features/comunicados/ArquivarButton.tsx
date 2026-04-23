'use client'

/**
 * ArquivarButton — Client Component
 *
 * Botão de soft delete com modal de confirmação.
 * Após arquivar redireciona para /comunicados.
 */

import { comunicadosApi } from '@/lib/api/comunicados'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  comunicadoId: string
}

export function ArquivarButton({ comunicadoId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleArquivar() {
    setError(null)
    startTransition(async () => {
      try {
        await comunicadosApi.delete(comunicadoId)
        router.push('/comunicados')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao arquivar. Tente novamente.')
        setShowConfirm(false)
      }
    })
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        style={{
          padding: '8px 18px',
          background: 'transparent',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Arquivar
      </button>
    )
  }

  return (
    <fieldset
      aria-label="Confirmar arquivamento"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        border: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      {error && (
        <span role="alert" style={{ fontSize: 12, color: '#dc2626' }}>
          {error}
        </span>
      )}
      <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.55)' }}>Confirmar arquivamento?</span>
      <button
        type="button"
        onClick={handleArquivar}
        disabled={isPending}
        style={{
          padding: '6px 14px',
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          fontSize: 12,
          fontWeight: 600,
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
        aria-busy={isPending}
      >
        {isPending ? 'Arquivando…' : 'Sim, arquivar'}
      </button>
      <button
        type="button"
        onClick={() => setShowConfirm(false)}
        disabled={isPending}
        style={{
          padding: '6px 14px',
          background: 'transparent',
          color: 'rgba(26,18,9,0.55)',
          border: '1px solid #d1d5db',
          borderRadius: 5,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Cancelar
      </button>
    </fieldset>
  )
}
