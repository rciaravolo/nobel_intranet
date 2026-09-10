'use client'

import { useMetasAgregadas } from '@/hooks/useMetasAgregadas'

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  filterType?: string
  filterValue?: string
}

/* ─── Formatação ─────────────────────────────────────────────────────────── */

function fBRL(val: number): string {
  const abs = Math.abs(val)
  const pre = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fBRLFull(val: number): string {
  const pre = val < 0 ? '-R$ ' : 'R$ '
  return `${pre}${Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fPct(val: number | null): string {
  if (val == null) return '—'
  return `${(val * 100).toFixed(1).replace('.', ',')}%`
}

function mesLabelAtual(): string {
  return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

/* ─── Pace / projeção (dias corridos do mês corrente) ────────────────────── */
/*
 * O endpoint /performance/metas-agregadas devolve só {realizado, meta} — sem
 * o breakdown de dias úteis que /performance/metas expõe para BlocoMetas.
 * Por isso o pace aqui é uma projeção linear por dias CORRIDOS (não úteis),
 * rotulada como tal para não ser confundida com a projeção "oficial" de
 * produto do BlocoMetas.
 */
function calcPace(realizado: number, meta: number) {
  const hoje = new Date()
  const diaAtual = hoje.getDate()
  const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
  const paceDiario = diaAtual > 0 ? realizado / diaAtual : 0
  const projecao = paceDiario * diasNoMes
  const pctAtingido = meta > 0 ? realizado / meta : null
  const pctProjecao = meta > 0 ? projecao / meta : null
  const gap = meta - realizado
  return { paceDiario, projecao, pctAtingido, pctProjecao, gap }
}

/* ─── Semáforo (mesmo critério do BlocoMetas: ≥95% verde, ≥80% amarelo) ──── */

type Sinal = 'verde' | 'amarelo' | 'vermelho' | 'sem-meta'

function sinal(pctProjecao: number | null, meta: number): Sinal {
  if (meta === 0 || pctProjecao == null) return 'sem-meta'
  if (pctProjecao >= 0.95) return 'verde'
  if (pctProjecao >= 0.8) return 'amarelo'
  return 'vermelho'
}

const SINAL_COR: Record<Sinal, string> = {
  verde: 'var(--color-positive)',
  amarelo: '#d97706',
  vermelho: 'var(--color-negative)',
  'sem-meta': 'var(--fg-faint)',
}

const SINAL_BG: Record<Sinal, string> = {
  verde: 'var(--color-positive-bg)',
  amarelo: 'rgba(217,119,6,0.12)',
  vermelho: 'var(--color-negative-bg)',
  'sem-meta': 'var(--n-50)',
}

const SINAL_LABEL: Record<Sinal, string> = {
  verde: '● On track',
  amarelo: '● Atenção',
  vermelho: '● Em risco',
  'sem-meta': '—',
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-elev)',
  borderRadius: 12,
  marginBottom: 20,
  border: '1px solid var(--line)',
  boxShadow: '0 1px 4px var(--n-50)',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px 12px',
  borderBottom: '1px solid var(--line)',
  background: 'var(--bg-deep)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--f-text)',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--fg)',
  letterSpacing: '-.01em',
}

const microLabel: React.CSSProperties = {
  fontSize: 9,
  color: 'var(--fg-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 3,
}

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function BlocoMetaCaptacao({ filterType, filterValue }: Props) {
  const { data, isLoading, isError, refetch } = useMetasAgregadas(filterType, filterValue)

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Meta de Captação — {mesLabelAtual()}</span>
        </div>
        <div style={{ padding: '20px 24px' }} className="animate-pulse">
          <div
            style={{
              height: 28,
              width: '55%',
              background: 'var(--n-100)',
              borderRadius: 6,
              marginBottom: 14,
            }}
          />
          <div
            style={{ height: 6, background: 'var(--n-100)', borderRadius: 3, marginBottom: 10 }}
          />
          <div style={{ height: 12, width: '75%', background: 'var(--n-100)', borderRadius: 4 }} />
        </div>
      </div>
    )
  }

  /* ── Erro ── */
  if (isError) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Meta de Captação — {mesLabelAtual()}</span>
        </div>
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-negative)' }}>
            Erro ao carregar meta de captação.
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 'var(--r-pill)',
              background: 'transparent',
              border: '1px solid var(--color-negative)',
              color: 'var(--color-negative)',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { realizado, meta } = data.captacao

  /* ── Vazio: equipe sem meta cadastrada ── */
  if (meta === 0) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Meta de Captação — {mesLabelAtual()}</span>
        </div>
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--n-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 15,
            }}
          >
            🎯
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 2 }}>
              Meta não cadastrada para esta equipe.
            </p>
            {realizado !== 0 && (
              <p style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
                Captação líquida realizada no mês: {fBRL(realizado)}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── Sucesso ── */
  const { paceDiario, projecao, pctAtingido, pctProjecao, gap } = calcPace(realizado, meta)
  const s = sinal(pctProjecao, meta)
  const cor = SINAL_COR[s]
  const pctBar = meta > 0 ? Math.min((realizado / meta) * 100, 100) : 0

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>Meta de Captação — {mesLabelAtual()}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 'var(--r-pill)',
            background: SINAL_BG[s],
            color: cor,
          }}
        >
          {SINAL_LABEL[s]}
        </span>
      </div>

      <div style={{ padding: '18px 24px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div>
            <p style={microLabel}>Realizado</p>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 24,
                fontWeight: 500,
                color: 'var(--fg)',
                lineHeight: 1,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fBRLFull(realizado)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={microLabel}>Meta</p>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--fg-mute)',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fBRL(meta)}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 6, background: 'var(--n-100)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pctBar}%`,
              background: cor,
              borderRadius: 3,
              opacity: 0.85,
              transition: 'width .4s ease',
            }}
          />
        </div>

        {/* Sub-linha: % atingido, gap, pace e projeção */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: cor }}>
            {fPct(pctAtingido)} atingido
          </span>
          <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
            gap{' '}
            <span style={{ color: gap <= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
              {gap <= 0 ? `+${fBRL(Math.abs(gap))}` : fBRL(gap)}
            </span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
            pace {fBRL(paceDiario)}/dia · projeção{' '}
            <span style={{ color: cor, fontWeight: 600 }}>{fBRL(projecao)}</span> (
            {fPct(pctProjecao)})
          </span>
        </div>
      </div>
    </div>
  )
}
