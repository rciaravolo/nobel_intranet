'use client'

import { useState } from 'react'

export type ReceitaEquipe = {
  equipe: string
  total: number
  assessores: { id: string; nome: string; receita: number }[]
}

function fBRL(v: number): string {
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1).replace('.', ',')}K`
  return `R$ ${v.toFixed(0)}`
}

function pct(v: number, total: number): string {
  if (total === 0) return '—'
  return `${((v / total) * 100).toFixed(1).replace('.', ',')}%`
}

export function ReceitaPorEquipe({
  equipes,
  total,
}: {
  equipes: ReceitaEquipe[]
  total: number
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (equipe: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(equipe)) next.delete(equipe)
      else next.add(equipe)
      return next
    })
  }

  return (
    <div
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        boxShadow: 'var(--e-float)',
        overflow: 'hidden',
        marginBottom: 32,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-deep)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Receita por Equipe
          </span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '.14em',
              color: 'var(--fg-faint)',
            }}
          >
            Todas as categorias · drill por assessor
          </span>
        </div>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-mute)' }}>
          Total <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{fBRL(total)}</span>
        </span>
      </div>

      {equipes.length === 0 && (
        <div
          style={{
            padding: '32px 20px',
            textAlign: 'center',
            fontFamily: 'var(--f-mono)',
            fontSize: 12,
            color: 'var(--fg-faint)',
          }}
        >
          Sem receita registrada no período.
        </div>
      )}

      {equipes.map((eq) => {
        const isExpanded = expanded.has(eq.equipe)
        return (
          <div key={eq.equipe} style={{ borderBottom: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={() => toggle(eq.equipe)}
              style={{
                all: 'unset',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                cursor: 'pointer',
                boxSizing: 'border-box',
                background: isExpanded ? 'var(--bg-deep)' : 'transparent',
                transition: 'background .15s',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                width="12"
                height="12"
                style={{
                  color: 'var(--fg-mute)',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform .15s',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span
                style={{
                  flex: 1,
                  fontFamily: 'var(--f-text)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--fg)',
                  letterSpacing: '-.01em',
                }}
              >
                {eq.equipe}
              </span>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  color: 'var(--fg-mute)',
                  minWidth: 60,
                  textAlign: 'right',
                }}
              >
                {total > 0 ? pct(eq.total, total) : ''}
              </span>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--fg)',
                  minWidth: 90,
                  textAlign: 'right',
                }}
              >
                {fBRL(eq.total)}
              </span>
            </button>

            {isExpanded && (
              <div style={{ background: 'var(--bg-elev)' }}>
                {eq.assessores.map((a) => (
                  <div
                    key={`${eq.equipe}::${a.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '9px 20px 9px 40px',
                      borderTop: '1px solid var(--line)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 10,
                        color: 'var(--fg-faint)',
                        letterSpacing: '.04em',
                        minWidth: 60,
                      }}
                    >
                      {a.id}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: 'var(--f-text)',
                        fontSize: 12,
                        color: 'var(--fg)',
                      }}
                    >
                      {a.nome}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 11,
                        color: 'var(--fg-mute)',
                        minWidth: 60,
                        textAlign: 'right',
                      }}
                    >
                      {eq.total > 0 ? pct(a.receita, eq.total) : ''}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 12,
                        color: 'var(--fg)',
                        minWidth: 90,
                        textAlign: 'right',
                      }}
                    >
                      {fBRL(a.receita)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
