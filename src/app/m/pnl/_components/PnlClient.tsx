'use client'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '../../_components/ScreenHeader'
import { fmtBR, fmtCur } from '../../_lib/format'
import type { CapPayload, ReceitaPayload } from '../page'

/* ─── Design tokens ─────────────────────────────────────────────────────── */

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  bg: '#000',
  card: '#141820',
  cardDeep: '#0e1117',
  border: 'rgba(255,255,255,0.07)',
  borderMed: 'rgba(255,255,255,0.12)',
  text: '#eceef4',
  muted: '#6b7588',
  gold: '#C9973F',
  success: '#3dba6e',
  danger: '#e05252',
}

const EQUIPE_COLORS: Record<string, string> = {
  'SMART':     '#2D5FA0',
  'PRIVATE':   '#C9973F',
  'RIO PRETO': '#10B981',
  'BRAVO':     '#8B5CF6',
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fPct(v: number | null): string {
  if (v == null) return '—'
  return `${fmtBR(v * 100, 1)}%`
}

function fData(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

/* ─── Componente: Label de seção ─────────────────────────────────────────── */

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: T.muted,
        marginBottom: 10,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Componente: Card header ────────────────────────────────────────────── */

interface CardHeaderProps {
  label: string
  badge?: string
  extra?: string
}

function CardHeader({ label, badge, extra }: CardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: `1px solid ${T.border}`,
        background: T.cardDeep,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: T.text,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {extra && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: T.muted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {extra}
          </span>
        )}
        {badge && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 7px',
              borderRadius: 4,
              background: 'rgba(45,95,160,0.15)',
              color: '#6094D6',
              border: '1px solid rgba(45,95,160,0.25)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── Componente: Linha de equipe — Receita ─────────────────────────────── */

interface ReceitaRowProps {
  equipe: string
  valor: number
  grandTotal: number
  pctMeta: number | null
  isLast: boolean
}

function ReceitaRow({ equipe, valor, grandTotal, pctMeta, isLast }: ReceitaRowProps) {
  const color = EQUIPE_COLORS[equipe] ?? T.muted
  const barPct = grandTotal > 0 ? Math.min(100, (valor / grandTotal) * 100) : 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : `1px solid rgba(255,255,255,0.05)`,
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }}
      />

      {/* Nome + barra */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            color: T.text,
            marginBottom: 5,
          }}
        >
          {equipe}
        </div>
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${barPct}%`,
              height: '100%',
              background: color,
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Valor + % meta */}
      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 700,
            color: T.text,
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {fmtCur(valor)}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: pctMeta != null && pctMeta >= 1 ? T.success : 'rgba(255,255,255,0.45)',
            fontVariantNumeric: 'tabular-nums',
            marginTop: 1,
          }}
        >
          {fPct(pctMeta)}
        </div>
      </div>
    </div>
  )
}

/* ─── Componente: Linha de equipe — Captação ────────────────────────────── */

interface CaptacaoRowProps {
  equipe: string
  capHoje: number
  pctHoje: number | null
  isTotal?: boolean
  isLast: boolean
}

function CaptacaoRow({ equipe, capHoje, pctHoje, isTotal, isLast }: CaptacaoRowProps) {
  const color = EQUIPE_COLORS[equipe] ?? T.muted
  const isPos = capHoje >= 0
  const capColor = isPos ? T.success : T.danger

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderBottom: isLast ? 'none' : `1px solid rgba(255,255,255,0.05)`,
        background: isTotal ? 'rgba(255,255,255,0.025)' : 'transparent',
        borderTop: isTotal ? `1px solid ${T.borderMed}` : undefined,
      }}
    >
      {/* Dot (oculto para Total) */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          background: isTotal ? 'transparent' : color,
          flexShrink: 0,
          border: isTotal ? `1px solid ${T.muted}` : 'none',
        }}
      />

      {/* Nome + barra de % meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: isTotal ? 11 : 13,
            fontWeight: isTotal ? 700 : 600,
            letterSpacing: isTotal ? '0.08em' : undefined,
            textTransform: isTotal ? 'uppercase' : undefined,
            color: isTotal ? 'rgba(255,255,255,0.45)' : T.text,
            marginBottom: 5,
          }}
        >
          {isTotal ? 'Total Geral' : equipe}
        </div>
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, (pctHoje ?? 0) * 100))}%`,
              height: '100%',
              background: isTotal ? T.muted : color,
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Cap MTD + % meta */}
      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: isTotal ? 700 : 600,
            color: capColor,
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {fmtCur(capHoje)}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: pctHoje != null && pctHoje >= 1 ? T.success : 'rgba(255,255,255,0.45)',
            fontVariantNumeric: 'tabular-nums',
            marginTop: 1,
          }}
        >
          {fPct(pctHoje)}
        </div>
      </div>
    </div>
  )
}

/* ─── Componente: Card Receita ───────────────────────────────────────────── */

function ReceitaCard({ dados }: { dados: ReceitaPayload }) {
  const { equipes, metas, totalReceita, grandTotalReceita, grandTotalMeta, dataRef } = dados
  const pctGeral = grandTotalMeta > 0 ? grandTotalReceita / grandTotalMeta : null
  const dataLabel = dataRef
    ? `Ref. ${new Date(`${dataRef}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    : undefined

  return (
    <div
      style={{
        borderRadius: 12,
        background: T.card,
        border: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}
    >
      <CardHeader label="Receita por Equipe" badge="MTD" extra={dataLabel} />

      {equipes.map((equipe, i) => {
        const valor = totalReceita[equipe] ?? 0
        const meta = metas[equipe] ?? 0
        const pctMeta = meta > 0 ? valor / meta : null
        return (
          <ReceitaRow
            key={equipe}
            equipe={equipe}
            valor={valor}
            grandTotal={grandTotalReceita}
            pctMeta={pctMeta}
            isLast={i === equipes.length - 1}
          />
        )
      })}

      {/* Footer total */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px',
          borderTop: `1px solid ${T.borderMed}`,
          background: T.cardDeep,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Total Geral
        </span>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              color: T.text,
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum"',
            }}
          >
            {fmtCur(grandTotalReceita)}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: pctGeral != null && pctGeral >= 1 ? T.success : 'rgba(255,255,255,0.45)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fPct(pctGeral)} da meta
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Componente: Card Captação ─────────────────────────────────────────── */

function CaptacaoCard({ dados }: { dados: CapPayload }) {
  if (dados.semDados) {
    return (
      <div
        style={{
          borderRadius: 12,
          background: T.card,
          border: `1px solid ${T.border}`,
          overflow: 'hidden',
        }}
      >
        <CardHeader label="Captação por Equipe" />
        <div
          style={{
            padding: '32px 20px',
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 12,
            color: T.muted,
          }}
        >
          Sem dados para o mês corrente.
        </div>
      </div>
    )
  }

  const hoje = fData(dados.dataHoje)
  const rows = dados.equipes

  return (
    <div
      style={{
        borderRadius: 12,
        background: T.card,
        border: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}
    >
      <CardHeader label="Captação por Equipe" extra={`Hoje ${hoje}`} />

      {rows.map((row, i) => (
        <CaptacaoRow
          key={row.equipe}
          equipe={row.equipe}
          capHoje={row.capHoje}
          pctHoje={row.pctHoje}
          isLast={i === rows.length - 1}
        />
      ))}

      {/* Linha total */}
      <CaptacaoRow
        equipe={dados.total.equipe}
        capHoje={dados.total.capHoje}
        pctHoje={dados.total.pctHoje}
        isTotal
        isLast
      />
    </div>
  )
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface PnlClientProps {
  receita: ReceitaPayload | null
  captacao: CapPayload | null
}

/* ─── Client Component principal ────────────────────────────────────────── */

export function PnlClient({ receita, captacao }: PnlClientProps) {
  const router = useRouter()

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        background: T.bg,
        color: T.text,
        paddingBottom: 110,
      }}
    >
      <ScreenHeader
        title="PnL"
        eyebrow="RESULTADO GERENCIAL"
        onBack={() => router.back()}
      />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── Receita ── */}
        <div>
          <SectionLabel>Receita</SectionLabel>
          {receita ? (
            <ReceitaCard dados={receita} />
          ) : (
            <div
              style={{
                borderRadius: 12,
                background: T.card,
                border: `1px solid ${T.border}`,
                padding: '32px 20px',
                textAlign: 'center',
                fontFamily: MONO,
                fontSize: 12,
                color: T.muted,
              }}
            >
              Erro ao carregar dados de receita.
            </div>
          )}
        </div>

        {/* ── Captação ── */}
        <div>
          <SectionLabel>Captação</SectionLabel>
          {captacao ? (
            <CaptacaoCard dados={captacao} />
          ) : (
            <div
              style={{
                borderRadius: 12,
                background: T.card,
                border: `1px solid ${T.border}`,
                padding: '32px 20px',
                textAlign: 'center',
                fontFamily: MONO,
                fontSize: 12,
                color: T.muted,
              }}
            >
              Erro ao carregar dados de captação.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
