'use client'

import { type Material, materiaisApi } from '@/lib/api/materiais'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'materiais_visto_em'

// Converte string do D1 ('YYYY-MM-DD HH:MM:SS' UTC) OU ISO
// ('YYYY-MM-DDTHH:MM:SSZ') numa Date válida.
function parsePublicadoEm(iso: string): Date {
  return new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`)
}

export function NovosMateriaisPopup() {
  const [novos, setNovos] = useState<Material[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const lastSeenRaw = localStorage.getItem(STORAGE_KEY)

        // Usuário novo — silencia o popup e grava o timestamp atual.
        // Só verá o popup quando algum material for publicado *após* este momento.
        if (!lastSeenRaw) {
          localStorage.setItem(STORAGE_KEY, new Date().toISOString())
          return
        }

        const materiais = await materiaisApi.list()
        if (cancelled) return

        const lastSeen = new Date(lastSeenRaw)
        const naoVistos = materiais.filter((m) => parsePublicadoEm(m.publicadoEm) > lastSeen)

        if (naoVistos.length > 0) {
          setNovos(naoVistos)
        }
      } catch {
        // Falha silenciosa — sem popup, sem toast.
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  function markSeenAndClose() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    setNovos(null)
  }

  if (!novos || novos.length === 0) return null

  const preview = novos.slice(0, 3)
  const extras = novos.length - preview.length

  return (
    // biome-ignore lint/a11y/useSemanticElements: manual modal pattern
    // biome-ignore lint/a11y/useKeyWithClickEvents: Esc é tratado via onKeyDown abaixo
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="novos-materiais-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) markSeenAndClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') markSeenAndClose()
      }}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,9,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '28px 30px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--c-gold, #B8963E)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h2
            id="novos-materiais-title"
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Novos materiais disponíveis
          </h2>
        </div>

        <p
          style={{
            fontSize: 13,
            color: 'var(--fg-muted, rgba(26,18,9,0.7))',
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          Você tem{' '}
          <strong style={{ color: 'var(--fg)' }}>
            {novos.length === 1 ? '1 novo material' : `${novos.length} novos materiais`}
          </strong>{' '}
          desde sua última visita:
        </p>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {preview.map((m) => (
            <li
              key={m.id}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-elev, #fafaf8)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--fg)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={m.titulo}
            >
              {m.titulo}
            </li>
          ))}
          {extras > 0 && (
            <li
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                color: 'var(--fg-faint)',
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                padding: '4px 12px',
              }}
            >
              e mais {extras}
            </li>
          )}
        </ul>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={markSeenAndClose}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: 'var(--fg-muted, rgba(26,18,9,0.7))',
              border: '1px solid var(--line)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            OK, entendi
          </button>
          <Link
            href="/relatorios"
            onClick={markSeenAndClose}
            style={{
              padding: '10px 22px',
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.06em',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Ver agora
          </Link>
        </div>
      </div>
    </div>
  )
}
