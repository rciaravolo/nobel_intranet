'use client'

import { useState } from 'react'
import { DrillDrawer } from './DrillDrawer'

const SETOR_COLOR: Record<string, string> = {
  'Fundo Imobiliário':             '#C29404',
  Financeiro:                      '#2D5FA0',
  'Energia elétrica & Saneamento': '#248A47',
  Imobiliário:                     '#8F6B12',
  'Mineração & Siderurgia':        '#343534',
  'Petróleo & Gas':                '#D94141',
  'Transportes & Bens Industriais':'#5F5E5B',
  Varejo:                          '#8C8B87',
  Tecnologia:                      '#C29404',
  'Papel & Celulose':              '#B4B3AE',
  'Agro, Alimentos & Bebidas':     '#8F6B12',
  Telecomunicação:                 '#D2D1CC',
  Shoppings:                       '#343534',
  Outros:                          '#5F5E5B',
}

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${Math.round(abs / 1_000)}K`
  return `${pre}${abs.toFixed(0)}`
}

type SetorItem = { setor: string; total: number; clientes: number }
type Props = { setorList: SetorItem[]; setorMax: number }

export function RVSetorial({ setorList, setorMax }: Props) {
  const [selectedSetor, setSelectedSetor] = useState<string | null>(null)

  return (
    <>
      <div style={{ padding: '8px 0' }}>
        {setorList.map((s, i) => {
          const pct = setorMax > 0 ? (s.total / setorMax) * 100 : 0
          const color = SETOR_COLOR[s.setor] ?? '#5F5E5B'
          const isSelected = selectedSetor === s.setor

          return (
            <button
              key={s.setor}
              type="button"
              onClick={() => setSelectedSetor(s.setor)}
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr 100px',
                alignItems: 'center',
                gap: 14,
                padding: '9px 20px',
                width: '100%',
                borderBottom: i < setorList.length - 1 ? '1px solid var(--line)' : 'none',
                background: isSelected
                  ? `color-mix(in srgb, ${color} 6%, transparent)`
                  : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background .12s',
              }}
            >
              {/* Label */}
              <div>
                <span
                  style={{
                    fontFamily: 'var(--f-text)',
                    fontSize: 12,
                    fontWeight: 500,
                    color: isSelected ? color : 'var(--fg)',
                    transition: 'color .12s',
                  }}
                >
                  {s.setor}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    color: 'var(--fg-faint)',
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    marginTop: 1,
                  }}
                >
                  {s.clientes.toLocaleString('pt-BR')} clientes
                </span>
              </div>

              {/* Bar */}
              <div style={{ height: 7, background: 'var(--bg-deep)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 2,
                    opacity: isSelected ? 1 : 0.8,
                    transition: 'opacity .12s',
                  }}
                />
              </div>

              {/* Value */}
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
                {fBRL(s.total)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Drawer */}
      {selectedSetor && (
        <DrillDrawer
          setor={selectedSetor}
          onClose={() => setSelectedSetor(null)}
        />
      )}
    </>
  )
}
