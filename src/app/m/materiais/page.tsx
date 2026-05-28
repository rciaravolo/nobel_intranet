'use client'
import { Download, FileText, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GoldRule } from '../_components/GoldRule'
import { ScreenHeader } from '../_components/ScreenHeader'
import { TabSegment } from '../_components/TabSegment'
import type { MaterialArquivo } from '../_lib/types'
import { useOnepageData } from '../onepage/_hooks/useOnepageData'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'

const T = {
  bg: '#000',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  danger: '#e05252',
}

const FILTERS = ['Todos', 'Produtos', 'Macro', 'RMA'] as const
type Filter = (typeof FILTERS)[number]

const TAG_TO_FILTER: Record<MaterialArquivo['tag'], Filter> = {
  PRODUTOS: 'Produtos',
  MACRO: 'Macro',
  ALLOCATION: 'RMA',
}

export default function MateriaisPage() {
  const router = useRouter()
  const data = useOnepageData({ name: '—', role: 'assessor', initials: '—' })
  const [filter, setFilter] = useState<Filter>('Todos')

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        background: T.bg,
        color: T.text,
        paddingBottom: 110,
      }}
    >
      <ScreenHeader
        title="Materiais"
        eyebrow="ARQUIVO MENSAL"
        onBack={() => router.back()}
        action={
          <button
            type="button"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${T.border}`,
              cursor: 'pointer',
              color: T.muted,
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label="Buscar"
          >
            <Search size={16} color={T.muted} />
          </button>
        }
      />

      <div style={{ padding: '0 16px 16px' }}>
        <TabSegment options={FILTERS} active={filter} onChange={setFilter} />
      </div>

      {data.materiais.map((mes, mi) => {
        const arquivos = mes.arquivos.filter(
          (a) => filter === 'Todos' || TAG_TO_FILTER[a.tag] === filter
        )
        if (arquivos.length === 0) return null
        return (
          <div key={`${mes.mes}-${mi}`} style={{ padding: '12px 16px 8px' }}>
            {/* Month header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <GoldRule width={20} />
              <h3
                style={{
                  fontFamily: SANS,
                  fontSize: 18,
                  fontWeight: 600,
                  color: T.text,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {mes.mes}
              </h3>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: SANS,
                  fontSize: 11,
                  color: T.muted,
                }}
              >
                {arquivos.length} arquivos
              </span>
            </div>

            {/* File list */}
            <div
              style={{
                overflow: 'hidden',
                borderRadius: 12,
                background: T.card,
                border: `1px solid ${T.border}`,
              }}
            >
              {arquivos.map((a, i) => (
                <div
                  key={`${a.nome}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 14px',
                    borderBottom:
                      i < arquivos.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                  }}
                >
                  {/* PDF icon */}
                  <div
                    style={{
                      width: 36,
                      height: 44,
                      borderRadius: 4,
                      background: 'rgba(224,82,82,0.12)',
                      border: '1px solid rgba(224,82,82,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={16} color={T.danger} />
                  </div>

                  {/* Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {a.nome}
                      {a.isNew && (
                        <span
                          aria-label="Novo"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 9999,
                            background: T.gold,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 2,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: SANS,
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: T.muted,
                        }}
                      >
                        {a.tag}
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: 10, color: T.muted }}>
                        · PDF{a.paginas ? ` · ${a.paginas} págs` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Download button */}
                  <button
                    type="button"
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: 'none',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    aria-label="Download"
                  >
                    <Download size={15} color={T.muted} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
