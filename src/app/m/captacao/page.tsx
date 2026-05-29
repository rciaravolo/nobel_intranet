'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CaptacaoBarChart } from '../_components/CaptacaoBarChart'
import { LineCard } from '../_components/LineCard'
import { ScreenHeader } from '../_components/ScreenHeader'
import { fmtBR, fmtCur } from '../_lib/format'
import { rankColor } from '../_lib/chartColor'
import { useOnepageData } from '../onepage/_hooks/useOnepageData'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  bg:        '#000',
  card:      '#141820',
  border:    'rgba(255,255,255,0.07)',
  borderMed: 'rgba(255,255,255,0.12)',
  text:      '#eceef4',
  muted:     '#6b7588',
  success:   '#248A47',
  danger:    '#D94141',
}

type CliItem = { id: string; nome: string; valor: number }

type DeepDive = {
  mesLabel: string
  aportes:  { id_cliente: string; nome_cliente: string | null; valor: number }[]
  resgates: { id_cliente: string; nome_cliente: string | null; valor: number }[]
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

export default function CaptacaoPage() {
  const router   = useRouter()
  const data     = useOnepageData({ name: '—', role: 'assessor', initials: '—' })
  const liquida  = data.captacao.liquida
  const isNeg    = liquida < 0

  const [clientes, setClientes] = useState<CliItem[]>([])
  const [mesLabel, setMesLabel] = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/performance/deepdive/captacao')
      .then((r) => r.json() as Promise<{ data: DeepDive }>)
      .then(({ data: dd }) => {
        const map = new Map<string, { nome: string; valor: number }>()

        for (const a of dd.aportes) {
          const key  = String(a.id_cliente)
          const prev = map.get(key) ?? { nome: a.nome_cliente ?? key, valor: 0 }
          map.set(key, { nome: prev.nome, valor: prev.valor + a.valor })
        }
        for (const r of dd.resgates) {
          const key  = String(r.id_cliente)
          const prev = map.get(key) ?? { nome: r.nome_cliente ?? key, valor: 0 }
          map.set(key, { nome: prev.nome, valor: prev.valor - r.valor })
        }

        const sorted = [...map.entries()]
          .map(([id, v]) => ({ id, ...v }))
          .sort((a, b) => b.valor - a.valor)

        setClientes(sorted)
        setMesLabel(dd.mesLabel)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const maxAbs = Math.max(...clientes.map((c) => Math.abs(c.valor)), 1)

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
      <ScreenHeader title="Captação" eyebrow={`MAI · ${data.posicaoEm}`} onBack={() => router.back()} />

      {/* ── Número principal ── */}
      <section style={{ padding: '16px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
          CAPTAÇÃO LÍQUIDA
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 18, color: isNeg ? T.danger : T.success, fontWeight: 500 }}>
            {isNeg ? '−R$' : 'R$'}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 56, fontWeight: 500, color: T.text, letterSpacing: '-0.01em', lineHeight: 0.95, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}>
            {(Math.abs(liquida) / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 500, color: T.text }}>M</span>
        </div>
        <p style={{ marginTop: 8, fontSize: 13, color: T.muted, fontFamily: SANS }}>
          Resultado do período.{' '}
          {isNeg && <span style={{ color: T.danger, fontWeight: 600 }}>Saídas concentradas em poucos clientes.</span>}
        </p>
      </section>

      {/* ── Cards bruta / resgates / líquida ── */}
      <div style={{ display: 'grid', gap: 10, padding: '20px 16px 0' }}>
        <LineCard label="Bruta"    valor={fmtCur(data.captacao.bruta)}    tone="ink"                      sub="todas as movimentações" />
        <LineCard label="Resgates" valor={fmtCur(data.captacao.resgates)} tone="red"                      sub="saídas do período" />
        <LineCard label="Líquida"  valor={fmtCur(liquida)}                tone={isNeg ? 'red' : 'green'}  sub="resultado consolidado" highlight />
      </div>

      {/* ── Histórico ── */}
      <section style={{ padding: '28px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted, marginBottom: 12 }}>
          HISTÓRICO — ÚLTIMOS 6 MESES
        </div>
        <div style={{ padding: 14, borderRadius: 12, background: T.card, border: `1px solid ${T.border}` }}>
          <CaptacaoBarChart series={data.captacao.series} height={140} />
        </div>
      </section>

      {/* ── Por cliente ── */}
      <section style={{ padding: '28px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted }}>
            POR CLIENTE
          </div>
          {mesLabel && (
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {mesLabel}
            </div>
          )}
        </div>

        <div style={{ overflow: 'hidden', borderRadius: 12, background: T.card, border: `1px solid ${T.border}` }}>
          {loading && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: SANS, fontSize: 12, color: T.muted }}>
              Carregando…
            </div>
          )}

          {!loading && clientes.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: SANS, fontSize: 12, color: T.muted }}>
              Sem dados disponíveis.
            </div>
          )}

          {!loading && (() => {
            const posCount = clientes.filter(c => c.valor >= 0).length
            return clientes.map((cli, i) => {
              const pos      = cli.valor >= 0
              const barPct   = Math.min(100, (Math.abs(cli.valor) / maxAbs) * 100)
              // maior positivo = ouro, decrescendo para cinza; negativos = vermelho
              const color    = pos ? rankColor(i, posCount) : T.danger
              const isLast   = i === clientes.length - 1
              const ini      = initials(cli.nome)

              return (
                <div
                  key={cli.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 14px',
                    borderBottom: isLast ? 'none' : `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontFamily: MONO, fontSize: 10, color: T.muted, width: 20, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Avatar initials */}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: color + '26', border: `1px solid ${color}4D`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color }}>
                      {ini}
                    </span>
                  </div>

                  {/* Nome + barra */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                      {cli.nome}
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${barPct}%`, height: '100%', background: color, borderRadius: 2, opacity: 0.85 }} />
                    </div>
                  </div>

                  {/* Valor */}
                  <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 68 }}>
                    <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}>
                      {pos ? '+' : '−'}{fmtCur(Math.abs(cli.valor))}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: T.muted, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
                      {fmtBR((Math.abs(cli.valor) / Math.abs(liquida || 1)) * 100, 1)}%
                    </div>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </section>
    </div>
  )
}
