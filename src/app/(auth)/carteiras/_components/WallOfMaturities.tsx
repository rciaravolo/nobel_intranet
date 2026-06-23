'use client'

import { useState } from 'react'
import { DrillDrawer } from './DrillDrawer'

const TIPO_COLOR: Record<string, string> = {
  'Emissão Bancária':            '#2D5FA0',
  'Credito Privado':             '#C29404',
  'Título Público':              '#248A47',
  'Tesouro Direto':              '#8F6B12',
  'Letras Financeiras':          '#5F5E5B',
  'Letra Imobiliária Garantida': '#8C8B87',
}

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${Math.round(abs / 1_000)}K`
  return `${pre}${abs.toFixed(0)}`
}

type Maturity = {
  janela: string
  total: number
  itens: { tipo: string; total: number }[]
}

type Props = { maturities: Maturity[] }

export function WallOfMaturities({ maturities }: Props) {
  const [selectedJanela, setSelectedJanela] = useState<string | null>(null)

  const matMax = Math.max(...maturities.map((m) => m.total), 1)
  const tipoSet = new Set(maturities.flatMap((m) => m.itens.map((i) => i.tipo)))
  const tipos = Array.from(tipoSet)

  return (
    <>
      <div style={{ padding: '16px 20px 8px' }}>
        {maturities.map((m) => {
          const barPct = matMax > 0 ? (m.total / matMax) * 100 : 0
          const isSelected = selectedJanela === m.janela

          return (
            <button
              key={m.janela}
              type="button"
              onClick={() => setSelectedJanela(m.total > 0 ? m.janela : null)}
              disabled={m.total === 0}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 96px',
                alignItems: 'center',
                gap: 14,
                marginBottom: 10,
                width: '100%',
                background: isSelected
                  ? 'color-mix(in srgb, var(--color-b-500) 6%, transparent)'
                  : 'transparent',
                border: isSelected
                  ? '1px solid color-mix(in srgb, var(--color-b-500) 20%, transparent)'
                  : '1px solid transparent',
                borderRadius: 6,
                padding: '4px 6px',
                cursor: m.total > 0 ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'background .12s, border-color .12s',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: isSelected ? 'var(--color-b-500)' : 'var(--fg)',
                  transition: 'color .12s',
                }}
              >
                {m.janela}
              </span>
              <div
                style={{
                  height: 22,
                  background: 'var(--bg-deep)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', height: '100%', width: `${barPct}%` }}>
                  {m.itens.map((item) => (
                    <div
                      key={item.tipo}
                      title={`${item.tipo}: ${fBRL(item.total)}`}
                      style={{
                        flex: item.total,
                        background: TIPO_COLOR[item.tipo] ?? '#8C8B87',
                        height: '100%',
                        opacity: isSelected ? 1 : 0.85,
                        transition: 'opacity .12s',
                      }}
                    />
                  ))}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--fg)',
                  textAlign: 'right',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {fBRL(m.total)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Legenda */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 20px',
          padding: '12px 20px',
          borderTop: '1px solid var(--line)',
          background: 'var(--bg-deep)',
        }}
      >
        {tipos.map((tipo) => (
          <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: TIPO_COLOR[tipo] ?? '#8C8B87',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                color: 'var(--fg-faint)',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
              }}
            >
              {tipo}
            </span>
          </div>
        ))}
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 9,
            color: 'var(--fg-faint)',
            letterSpacing: '.10em',
            marginLeft: 'auto',
            alignSelf: 'center',
          }}
        >
          clique numa barra para ver clientes
        </span>
      </div>

      {/* Drawer */}
      {selectedJanela && (
        <DrillDrawer
          janela={selectedJanela}
          onClose={() => setSelectedJanela(null)}
        />
      )}
    </>
  )
}
