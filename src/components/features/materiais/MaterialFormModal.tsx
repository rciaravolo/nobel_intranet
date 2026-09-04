'use client'

import type { Material } from '@/lib/api/materiais'
import { materiaisApi } from '@/lib/api/materiais'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

type Props = {
  mode: 'create' | 'edit'
  material?: Material
  onClose: () => void
}

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const ACCEPT = '.pdf,.xlsx,.xls,.pptx,.ppt,.docx,.doc,.png,.jpg,.jpeg'

export function MaterialFormModal({ mode, material, onClose }: Props) {
  const qc = useQueryClient()
  const [titulo, setTitulo] = useState(material?.titulo ?? '')
  const [descricao, setDescricao] = useState(material?.descricao ?? '')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (titulo.trim().length < 3) {
      setError('Título deve ter no mínimo 3 caracteres')
      return
    }

    if (mode === 'create') {
      if (!arquivo) {
        setError('Selecione um arquivo')
        return
      }
      if (arquivo.size > MAX_UPLOAD_BYTES) {
        setError(`Arquivo maior que ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`)
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'create' && arquivo) {
        const descTrim = descricao.trim()
        await materiaisApi.upload(
          descTrim
            ? { titulo: titulo.trim(), descricao: descTrim, arquivo }
            : { titulo: titulo.trim(), arquivo },
        )
      } else if (mode === 'edit' && material) {
        await materiaisApi.update(material.id, {
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
        })
      }
      await qc.invalidateQueries({ queryKey: ['materiais'] })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      setSubmitting(false)
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: manual modal pattern (backdrop-click + Esc handled abaixo)
    // biome-ignore lint/a11y/useKeyWithClickEvents: Esc é tratado via onKeyDown no onClick handler dedicado
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="material-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !submitting) onClose()
      }}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,9,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '28px 30px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        <h2
          id="material-modal-title"
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-.01em',
            marginBottom: 20,
          }}
        >
          {mode === 'create' ? 'Novo material' : 'Editar material'}
        </h2>

        {error && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 6,
              fontSize: 12,
              color: '#991b1b',
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <label style={labelStyle} htmlFor="mat-titulo">
          Título <span style={{ color: '#c1272d' }}>*</span>
        </label>
        <input
          id="mat-titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={200}
          required
          style={inputStyle}
          placeholder="Ex.: Manual de produtos RF 2026"
        />

        <label style={{ ...labelStyle, marginTop: 16 }} htmlFor="mat-descricao">
          Descrição <span style={{ fontWeight: 400, color: 'var(--fg-faint)' }}>(opcional)</span>
        </label>
        <textarea
          id="mat-descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Breve descrição do que esse material contém"
        />

        {mode === 'create' && (
          <>
            <label style={{ ...labelStyle, marginTop: 16 }} htmlFor="mat-arquivo">
              Arquivo <span style={{ color: '#c1272d' }}>*</span>{' '}
              <span style={{ fontWeight: 400, color: 'var(--fg-faint)' }}>
                (até 20 MB — PDF, XLSX, PPTX, DOCX, imagens)
              </span>
            </label>
            <input
              id="mat-arquivo"
              type="file"
              accept={ACCEPT}
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              required
              style={{
                ...inputStyle,
                padding: '9px 12px',
                background: 'var(--bg-elev, #fafaf8)',
              }}
            />
            {arquivo && (
              <p
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  color: 'var(--fg-faint)',
                  marginTop: 6,
                  letterSpacing: '.05em',
                  textTransform: 'uppercase',
                }}
              >
                {arquivo.name} · {(arquivo.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={submitting} style={secondaryBtn}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting} style={primaryBtn}>
            {submitting
              ? mode === 'create'
                ? 'Enviando…'
                : 'Salvando…'
              : mode === 'create'
                ? 'Publicar'
                : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--fg-muted, rgba(26,18,9,0.7))',
  letterSpacing: '.05em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--line-strong, rgba(184,150,62,0.3))',
  borderRadius: 6,
  fontSize: 14,
  color: 'var(--fg)',
  background: 'var(--bg)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 22px',
  background: 'var(--fg)',
  color: 'var(--bg)',
  border: 'none',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '.06em',
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: 'transparent',
  color: 'var(--fg-muted, rgba(26,18,9,0.7))',
  border: '1px solid var(--line)',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
}
