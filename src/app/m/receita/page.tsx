'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Donut } from '../_components/Donut'
import { ScreenHeader } from '../_components/ScreenHeader'
import { fmtBR, fmtCur } from '../_lib/format'
import { useOnepageData } from '../onepage/_hooks/useOnepageData'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  bg: '#000',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
  text: '#eceef4',
  muted: '#6b7588',
  success: '#3dba6e',
  danger: '#e05252',
}

export default function ReceitaPage() {
  const router = useRouter()
  const data = useOnepageData({ name: '—', role: 'assessor', initials: '—' })
  const [active, setActive] = useState(0)

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
      <ScreenHeader title="Receita" eyebrow="POR PRODUTO · MÊS" onBack={() => router.back()} />

      {/* Donut central */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px 8px',
        }}
      >
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <Donut items={data.produtos} size={220} thickness={26} />
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
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: T.muted,
              }}
            >
              Total no mês
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 36,
                fontWeight: 500,
                lineHeight: 1,
                color: T.text,
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fmtCur(data.receita.mes)}
            </div>
            {data.receita.deltaMes !== 0 && (
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 600,
                  color: data.receita.deltaMes >= 0 ? T.success : T.danger,
                  marginTop: 4,
                }}
              >
                {data.receita.deltaMes >= 0 ? '+' : '−'}
                {fmtBR(Math.abs(data.receita.deltaMes * 100), 1)}% vs mês anterior
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalhamento */}
      <section style={{ padding: '20px 16px 0' }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 10,
          }}
        >
          DETALHAMENTO
        </div>
        <div
          style={{
            overflow: 'hidden',
            borderRadius: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
          }}
        >
          {data.produtos.map((p, i) => (
            <button
              key={p.nome}
              type="button"
              onClick={() => setActive(i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: active === i ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderBottom:
                  i < data.produtos.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                padding: 14,
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: `hsl(${p.color})`,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                    }}
                  >
                    {p.nome}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      height: 4,
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${p.pct}%`,
                        height: '100%',
                        background: `hsl(${p.color})`,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
                <div style={{ minWidth: 72, textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 14,
                      fontWeight: 700,
                      color: T.text,
                      fontVariantNumeric: 'tabular-nums',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {fmtCur(p.valor)}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 11,
                      color: T.muted,
                      fontVariantNumeric: 'tabular-nums',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {fmtBR(p.pct, 1)}%
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
