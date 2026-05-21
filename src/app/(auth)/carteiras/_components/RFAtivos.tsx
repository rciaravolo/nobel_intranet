'use client'

import { useState } from 'react'
import { DrillDrawer } from './DrillDrawer'

export type RFAtivo = {
  ativo: string
  sub_produto: string
  emissor: string | null
  total: number
  clientes: number
  posicoes: number
}

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${pre}${Math.round(abs / 1_000)}K`
  return `${pre}${abs.toFixed(0)}`
}

type Props = { ativos: RFAtivo[] }

export function RFAtivos({ ativos }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  if (ativos.length === 0) return null

  const totalGeral = ativos.reduce((s, a) => s + a.total, 0)

  return (
    <>
      <div
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 'var(--s-4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-deep)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Renda Fixa — Top Ativos
          </span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 9,
              color: 'var(--fg-faint)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
            }}
          >
            clique para detalhar
          </span>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)' }}>
              {['Ativo', 'Emissor', 'Sub-Produto', 'Volume', '%', 'Clientes'].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    fontWeight: 500,
                    color: 'var(--fg-faint)',
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    padding: '8px 16px',
                    textAlign:
                      h === 'Ativo' || h === 'Emissor' || h === 'Sub-Produto' ? 'left' : 'right',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ativos.map((a, i) => {
              const isSelected = selected === a.ativo
              const pct = totalGeral > 0 ? (a.total / totalGeral) * 100 : 0
              return (
                <tr
                  key={a.ativo}
                  onClick={() => setSelected(isSelected ? null : a.ativo)}
                  style={{
                    borderBottom: i < ativos.length - 1 ? '1px solid var(--line)' : 'none',
                    cursor: 'pointer',
                    background: isSelected ? 'color-mix(in srgb, #2D5FA0 8%, var(--bg-elev))' : 'transparent',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-deep)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = isSelected
                      ? 'color-mix(in srgb, #2D5FA0 8%, var(--bg-elev))'
                      : 'transparent'
                  }}
                >
                  {/* Ativo */}
                  <td style={{ padding: '9px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isSelected && (
                        <div
                          style={{
                            width: 3,
                            height: 18,
                            borderRadius: 2,
                            background: '#2D5FA0',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: isSelected ? '#2D5FA0' : 'var(--fg)',
                          letterSpacing: '-.01em',
                        }}
                      >
                        {a.ativo}
                      </span>
                    </div>
                  </td>

                  {/* Emissor */}
                  <td style={{ padding: '9px 16px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--f-text)',
                        fontSize: 11,
                        color: 'var(--fg-mute)',
                      }}
                    >
                      {a.emissor ?? '—'}
                    </span>
                  </td>

                  {/* Sub-Produto */}
                  <td style={{ padding: '9px 16px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 10,
                        color: 'var(--fg-faint)',
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {a.sub_produto}
                    </span>
                  </td>

                  {/* Volume */}
                  <td
                    style={{
                      padding: '9px 16px',
                      textAlign: 'right',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--fg)',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {fBRL(a.total)}
                  </td>

                  {/* % */}
                  <td
                    style={{
                      padding: '9px 16px',
                      textAlign: 'right',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      color: '#2D5FA0',
                      fontWeight: 600,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {pct.toFixed(1).replace('.', ',')}%
                  </td>

                  {/* Clientes */}
                  <td
                    style={{
                      padding: '9px 16px',
                      textAlign: 'right',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      color: 'var(--fg-faint)',
                    }}
                  >
                    {a.clientes.toLocaleString('pt-BR')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <DrillDrawer ativo={selected} onClose={() => setSelected(null)} />
    </>
  )
}
