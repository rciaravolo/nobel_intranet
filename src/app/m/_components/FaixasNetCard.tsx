'use client'
import type { FaixaNet } from '../_lib/types'
import { fmtBR, fmtCur } from '../_lib/format'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const T = {
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
}

interface FaixasNetCardProps {
  faixas: FaixaNet[]
  goldIndex?: number
}

export function FaixasNetCard({ faixas, goldIndex = 2 }: FaixasNetCardProps) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {faixas.map((f, i) => (
        <div
          key={f.faixa}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.text,
                }}
              >
                {f.faixa}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  color: T.muted,
                }}
              >
                · {f.clientes} clientes
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 3,
                overflow: 'hidden',
                marginTop: 5,
              }}
            >
              <div
                style={{
                  width: `${f.pct}%`,
                  height: '100%',
                  background:
                    i === goldIndex ? T.gold : 'rgba(236,238,244,0.45)',
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 600,
                color: T.text,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fmtCur(f.custodia)}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 10,
                color: T.muted,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fmtBR(f.pct, 1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
