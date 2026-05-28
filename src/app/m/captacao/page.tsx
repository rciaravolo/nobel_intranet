'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from '../_components/Avatar'
import { CaptacaoBarChart } from '../_components/CaptacaoBarChart'
import { LineCard } from '../_components/LineCard'
import { ScreenHeader } from '../_components/ScreenHeader'
import { TabSegment } from '../_components/TabSegment'
import { fmtCur } from '../_lib/format'
import { useOnepageData } from '../onepage/_hooks/useOnepageData'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  bg: '#000',
  card: '#141820',
  border: 'rgba(255,255,255,0.07)',
  borderMed: 'rgba(255,255,255,0.12)',
  text: '#eceef4',
  muted: '#6b7588',
  success: '#3dba6e',
  danger: '#e05252',
}

const PERIODS = ['Dia', 'Semana', 'Mês', 'Trim', 'Ano'] as const
type Period = (typeof PERIODS)[number]

export default function CaptacaoPage() {
  const router = useRouter()
  const data = useOnepageData({ name: '—', role: 'assessor', initials: '—' })
  const [period, setPeriod] = useState<Period>('Mês')

  const liquida = data.captacao.liquida
  const liquidaIsNeg = liquida < 0

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
      <ScreenHeader title="Captação" eyebrow={`MAI · ${data.posicaoEm}`} onBack={() => router.back()} />

      <div style={{ padding: '0 16px 8px' }}>
        <TabSegment options={PERIODS} active={period} onChange={setPeriod} />
      </div>

      <section style={{ padding: '16px 16px 0' }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 8,
          }}
        >
          CAPTAÇÃO LÍQUIDA
        </div>

        {/* Big number */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 18,
              color: liquidaIsNeg ? T.danger : T.success,
              fontWeight: 500,
            }}
          >
            {liquidaIsNeg ? '−R$' : 'R$'}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 56,
              fontWeight: 500,
              color: T.text,
              letterSpacing: '-0.01em',
              lineHeight: 0.95,
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum"',
            }}
          >
            {(Math.abs(liquida) / 1_000_000).toLocaleString('pt-BR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 30,
              fontWeight: 500,
              color: T.text,
            }}
          >
            M
          </span>
        </div>

        <p style={{ marginTop: 8, fontSize: 13, color: T.muted, fontFamily: SANS }}>
          Resultado do período.{' '}
          {liquidaIsNeg && (
            <span style={{ color: T.danger, fontWeight: 600 }}>
              Saídas concentradas em poucos clientes.
            </span>
          )}
        </p>
      </section>

      {/* Line cards */}
      <div style={{ display: 'grid', gap: 10, padding: '20px 16px 0' }}>
        <LineCard
          label="Bruta"
          valor={fmtCur(data.captacao.bruta)}
          tone="ink"
          sub="todas as movimentações"
        />
        <LineCard
          label="Resgates"
          valor={fmtCur(data.captacao.resgates)}
          tone="red"
          sub="saídas do período"
        />
        <LineCard
          label="Líquida"
          valor={fmtCur(liquida)}
          tone={liquidaIsNeg ? 'red' : 'green'}
          sub="resultado consolidado"
          highlight
        />
      </div>

      {/* Bar chart */}
      <section style={{ padding: '28px 16px 0' }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 12,
          }}
        >
          HISTÓRICO — ÚLTIMOS 6 MESES
        </div>
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
          }}
        >
          <CaptacaoBarChart series={data.captacao.series} height={140} />
        </div>
      </section>

      {/* Top movimentações */}
      {data.captacao.topMovs && data.captacao.topMovs.length > 0 && (
        <section style={{ padding: '28px 16px 8px' }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: T.muted,
              marginBottom: 12,
            }}
          >
            TOP MOVIMENTAÇÕES
          </div>
          <div
            style={{
              overflow: 'hidden',
              borderRadius: 12,
              background: T.card,
              border: `1px solid ${T.border}`,
            }}
          >
            {data.captacao.topMovs.map((m, i, arr) => (
              <div
                key={`${m.cliente}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                }}
              >
                <Avatar initials={m.iniciais} size={36} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                    }}
                  >
                    {m.cliente}
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 11,
                      color: T.muted,
                      marginTop: 2,
                    }}
                  >
                    {m.tipo} · {m.data}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: 700,
                    color: m.valor < 0 ? T.danger : T.success,
                    fontVariantNumeric: 'tabular-nums',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {m.valor < 0 ? '−' : '+'}
                  {fmtCur(Math.abs(m.valor))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
