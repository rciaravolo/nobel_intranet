'use client'

import type { Material } from '@/lib/api/materiais'
import { materiaisApi } from '@/lib/api/materiais'

const KB = 1024
const MB = KB * 1024

function formatSize(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`
  if (bytes >= KB) return `${Math.round(bytes / KB)} KB`
  return `${bytes} B`
}

function formatDate(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function iconForMime(mime: string, nome: string): string {
  const ext = nome.split('.').pop()?.toLowerCase() ?? ''
  if (mime.includes('pdf') || ext === 'pdf') return 'PDF'
  if (['xlsx', 'xls', 'csv'].includes(ext) || mime.includes('sheet')) return 'XLS'
  if (['pptx', 'ppt'].includes(ext) || mime.includes('presentation')) return 'PPT'
  if (['docx', 'doc'].includes(ext) || mime.includes('word')) return 'DOC'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) || mime.startsWith('image/')) return 'IMG'
  return 'FILE'
}

function colorForBadge(badge: string): string {
  switch (badge) {
    case 'PDF':
      return '#c1272d'
    case 'XLS':
      return '#207245'
    case 'PPT':
      return '#d24726'
    case 'DOC':
      return '#2b579a'
    case 'IMG':
      return '#7c3aed'
    default:
      return 'var(--fg-faint)'
  }
}

type Props = {
  material: Material
  canManage: boolean
  onEdit: (m: Material) => void
  onDelete: (m: Material) => void
}

export function MaterialCard({ material, canManage, onEdit, onDelete }: Props) {
  const badge = iconForMime(material.arquivoMime, material.arquivoNome)
  const badgeColor = colorForBadge(badge)

  return (
    <article
      style={{
        display: 'grid',
        gridTemplateColumns: '52px 1fr auto',
        gap: 16,
        padding: '18px 20px',
        background: 'var(--bg)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        boxShadow: '0 1px 4px var(--n-50, rgba(0,0,0,0.03))',
        alignItems: 'center',
      }}
    >
      {/* Badge de tipo */}
      <div
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: badgeColor,
          color: '#fff',
          borderRadius: 6,
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.05em',
        }}
      >
        {badge}
      </div>

      {/* Meta */}
      <div style={{ minWidth: 0 }}>
        <h3
          style={{
            fontFamily: 'var(--f-text)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-.01em',
            marginBottom: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={material.titulo}
        >
          {material.titulo}
        </h3>
        {material.descricao && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--fg-muted, rgba(26,18,9,0.6))',
              marginBottom: 6,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {material.descricao}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            color: 'var(--fg-faint)',
            letterSpacing: '.05em',
            textTransform: 'uppercase',
          }}
        >
          <span>{formatSize(material.arquivoSize)}</span>
          <span>•</span>
          <span>{formatDate(material.publicadoEm)}</span>
          <span>•</span>
          <span style={{ textTransform: 'none', letterSpacing: 0 }} title={material.arquivoNome}>
            {material.arquivoNome}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <a
          href={materiaisApi.downloadUrl(material.id)}
          download={material.arquivoNome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: 'var(--fg)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '.04em',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar
        </a>

        {canManage && (
          <>
            <button
              type="button"
              onClick={() => onEdit(material)}
              aria-label="Editar material"
              title="Editar"
              style={iconBtnStyle}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(material)}
              aria-label="Excluir material"
              title="Excluir"
              style={{ ...iconBtnStyle, color: '#c1272d' }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </article>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  color: 'var(--fg-muted, rgba(26,18,9,0.55))',
  border: '1px solid var(--line)',
  borderRadius: 6,
  cursor: 'pointer',
}
