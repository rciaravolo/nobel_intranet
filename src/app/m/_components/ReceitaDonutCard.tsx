'use client'
import { fmtBR, fmtCur } from '../_lib/format'
import type { Produto } from '../_lib/types'
import { Donut } from './Donut'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'
const T = {
  text: '#eceef4',
  muted: '#6b7588',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
}

interface ReceitaDonutCardProps {
  produtos: Produto[]
  total: number
  maxRows?: number
}

export function ReceitaDonutCard({ produtos, total, maxRows = 5 }: ReceitaDonutCardProps) {
  return (
    <div
      style={{
        width: '100%',
        textAlign: 'left',
        borderRadius: 12,
        padding: '16px 16px 20px',
        background: T.card,
        border: `1px solid ${T.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Donut */}
        <div
          style={{
            position: 'relative',
            width: 110,
            height: 110,
            flexShrink: 0,
          }}
        >
          <Donut items={produtos} size={110} thickness={14} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: T.muted,
              }}
            >
              Total
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 500,
                color: T.text,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fmtCur(total)}
            </div>
          </div>
        </div>

        {/* Lista */}
        <ul
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {produtos.slice(0, maxRows).map((p) => (
            <li
              key={p.nome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: `hsl(${p.color})`,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontFamily: SANS,
                  fontSize: 12,
                  color: T.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.nome}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 500,
                  color: T.muted,
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {fmtBR(p.pct, 1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
