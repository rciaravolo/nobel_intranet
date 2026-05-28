'use client'
import { ArrowRight, ChevronRight, FileText, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AppHeader } from '../../_components/AppHeader'
import { CaptacaoBarChart } from '../../_components/CaptacaoBarChart'
import { FaixasNetCard } from '../../_components/FaixasNetCard'
import { KpiTile } from '../../_components/KpiTile'
import { ReceitaDonutCard } from '../../_components/ReceitaDonutCard'
import { SectionHeadline } from '../../_components/SectionHeadline'
import { Sparkline } from '../../_components/Sparkline'
import { TabPills } from '../../_components/TabPills'
import { fmtCur, fmtPct } from '../../_lib/format'
import type { OnePageData, Theme } from '../../_lib/types'

// ─── Design tokens (dark hardcoded) ───────────────────────────────────────────
const T = {
  bg: '#000',
  card: '#141820',
  cardHover: '#1a2030',
  border: 'rgba(255,255,255,0.07)',
  borderMed: 'rgba(255,255,255,0.12)',
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  success: '#3dba6e',
  danger: '#e05252',
}

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface OnePageScreenProps {
  data: OnePageData
  theme: Theme
  onToggleTheme: () => void
}

const PERIODS = ['Hoje', 'Semana', 'Mês', 'Trimestre', 'Ano'] as const
type Period = (typeof PERIODS)[number]

// ─── Main component ────────────────────────────────────────────────────────────
export function OnePageScreen({ data, theme, onToggleTheme }: OnePageScreenProps) {
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('Mês')
  const firstName = data.user.name.split(' ')[0] || '—'
  const featuredMaterial = data.materiais[0]?.arquivos[0]

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
      <AppHeader
        user={data.user}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenProfile={() => router.push('/m/settings')}
      />
      <TabPills options={PERIODS} active={period} onChange={setPeriod} />

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '24px 16px 28px',
        }}
      >
        {/* Eyebrow */}
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
          POSICAO EM {data.posicaoEm}
        </div>

        {/* Greeting */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 18,
            fontWeight: 500,
            color: T.muted,
            marginBottom: 16,
            marginTop: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Bom dia, {firstName} ✦
        </p>

        {/* Custody value row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 0 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 18,
              color: T.gold,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            R$
          </span>
          <CustodyValue value={data.custodia.value} />
        </div>

        {/* Rule + label + delta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 14,
          }}
        >
          <span style={{ display: 'inline-block', width: 28, height: 2, background: T.gold }} />
          <span
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: T.muted,
              letterSpacing: '0.02em',
            }}
          >
            Custódia sob gestão
          </span>
          <DeltaChip pct={data.custodia.deltaMes * 100} />
        </div>

        {/* Sparkline */}
        <div style={{ marginTop: 24, marginLeft: -2, marginRight: -2 }}>
          <Sparkline
            data={data.custodia.series90d}
            width={370}
            height={92}
            color={T.gold}
            stroke={2.2}
          />
        </div>

        {/* Sparkline labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            paddingLeft: 2,
            paddingRight: 2,
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: T.muted,
            }}
          >
            90 DIAS
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: T.muted,
            }}
          >
            HOJE
          </span>
        </div>

        {/* CTA button */}
        <button
          type="button"
          onClick={() => router.push('/m/captacao')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            height: 48,
            marginTop: 20,
            borderRadius: 12,
            background: 'transparent',
            border: `1px solid rgba(236,238,244,0.35)`,
            color: T.text,
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Ver detalhamento <ArrowRight size={16} />
        </button>
      </section>

      {/* ── KPI STRIP ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: '0 16px',
        }}
      >
        <KpiTile eyebrow="Clientes" value={data.clientes.ativos} sub="ativos" tone="ink" />
        <KpiTile eyebrow="Receita" value={fmtCur(data.receita.mes)} sub="no mês" tone="gold" />
        <KpiTile
          eyebrow="Cap. Líq."
          value={fmtCur(data.captacao.liquida)}
          sub={data.captacao.liquida < 0 ? 'negativo' : 'positivo'}
          tone={data.captacao.liquida < 0 ? 'red' : 'green'}
        />
      </div>

      {/* ── CAPTAÇÃO ── */}
      <SectionHeadline
        eyebrow="Captação"
        titulo={
          <>
            Líquida do mês em{' '}
            <em
              style={{
                fontFamily: SANS,
                                fontWeight: 500,
                color: data.captacao.liquida < 0 ? T.danger : T.success,
              }}
            >
              {data.captacao.liquida < 0 ? 'terreno negativo' : 'alta'}
            </em>
          </>
        }
      />
      <div style={{ padding: '0 16px' }}>
        <button
          type="button"
          onClick={() => router.push('/m/captacao')}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            borderRadius: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
            padding: 16,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Stacked KPIs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <StackedKpi label="Bruta" value={fmtCur(data.captacao.bruta)} tone="ink" />
            <StackedKpi label="Resgates" value={fmtCur(data.captacao.resgates)} tone="red" />
            <StackedKpi
              label="Líquida"
              value={fmtCur(data.captacao.liquida)}
              tone={data.captacao.liquida < 0 ? 'red' : 'green'}
            />
          </div>
          <CaptacaoBarChart series={data.captacao.series} height={56} showValueLabels={false} />
        </button>
      </div>

      {/* ── RECEITA ── */}
      <SectionHeadline
        eyebrow="Receita por Produto"
        titulo={
          <>
            <em
              style={{
                fontFamily: SANS,
                                fontWeight: 500,
                color: T.gold,
              }}
            >
              Fee Fixo
            </em>{' '}
            concentra a maior fatia da receita
          </>
        }
      />
      <div style={{ padding: '0 16px' }}>
        <button
          type="button"
          onClick={() => router.push('/m/receita')}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ReceitaDonutCard produtos={data.produtos} total={data.receita.mes} maxRows={5} />
        </button>
      </div>

      {/* ── FAIXAS NET ── */}
      <SectionHeadline
        eyebrow="Custódia por Faixa NET"
        titulo={
          <>
            Maior concentração na faixa{' '}
            <em
              style={{
                fontFamily: SANS,
                                fontWeight: 500,
              }}
            >
              1MM – 10MM
            </em>
          </>
        }
      />
      <div style={{ padding: '0 16px 24px' }}>
        <FaixasNetCard faixas={data.faixas} />
      </div>

      {/* ── MATERIAIS ── */}
      <SectionHeadline eyebrow="Materiais do Mês" titulo={<>Novos PDFs disponíveis</>} />
      <div style={{ padding: '0 16px 32px' }}>
        <button
          type="button"
          onClick={() => router.push('/m/materiais')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
            textAlign: 'left',
            borderRadius: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
            padding: 16,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* PDF icon */}
          <div
            style={{
              width: 44,
              height: 56,
              borderRadius: 4,
              background: 'rgba(224,82,82,0.12)',
              border: '1px solid rgba(224,82,82,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={20} color={T.danger} />
          </div>

          {/* Text */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                color: T.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {featuredMaterial?.nome || '—'}
            </div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 12,
                color: T.muted,
                marginTop: 2,
              }}
            >
              PDF · atualizado este mês
            </div>
          </div>

          <ChevronRight size={18} color={T.muted} />
        </button>
      </div>
    </div>
  )
}

// ─── CustodyValue ──────────────────────────────────────────────────────────────
function CustodyValue({ value }: { value: number }) {
  const abs = Math.abs(value)
  let main = '0,0'
  let suffix = ''

  if (abs >= 1_000_000) {
    const m = abs / 1_000_000
    main = m.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    suffix = 'M'
  } else if (abs >= 1_000) {
    main = String(Math.round(abs / 1000))
    suffix = 'K'
  } else {
    main = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 64,
          fontWeight: 500,
          lineHeight: 0.92,
          color: T.text,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {main}
      </span>
      {suffix && (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 32,
            fontWeight: 500,
            color: T.text,
            letterSpacing: '-0.01em',
            marginLeft: 2,
          }}
        >
          {suffix}
        </span>
      )}
    </>
  )
}

// ─── DeltaChip ────────────────────────────────────────────────────────────────
function DeltaChip({ pct }: { pct: number }) {
  const isPos = pct >= 0
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        gap: 4,
        borderRadius: 9999,
        padding: '0 10px',
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 600,
        background: isPos ? 'rgba(61,186,110,0.12)' : 'rgba(224,82,82,0.12)',
        border: `1px solid ${isPos ? 'rgba(61,186,110,0.3)' : 'rgba(224,82,82,0.3)'}`,
        color: isPos ? T.success : T.danger,
      }}
    >
      <TrendingUp size={11} strokeWidth={2.4} />
      {fmtPct(pct)} no mês
    </span>
  )
}

// ─── StackedKpi (inline, used only in OnePageScreen) ──────────────────────────
type Tone = 'ink' | 'gold' | 'red' | 'green'
const toneColor: Record<Tone, string> = {
  ink: T.text,
  gold: T.gold,
  red: T.danger,
  green: T.success,
}

function StackedKpi({ label, value, tone = 'ink' }: { label: string; value: string; tone?: Tone }) {
  return (
    <div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: T.muted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 16,
          fontWeight: 500,
          color: toneColor[tone],
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
    </div>
  )
}
