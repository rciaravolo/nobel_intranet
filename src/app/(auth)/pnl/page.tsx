import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type EquipeCapItem = {
  equipe: string
  capHoje: number
  capOntem: number
  deltaDia: number
  meta: number
  pctHoje: number | null
  pctOntem: number | null
  deltaPp: number | null
}

type CapPayload =
  | { semDados: true; mesISO: string }
  | {
      semDados: false
      mesISO: string
      dataHoje: string
      dataOntem: string | null
      equipes: EquipeCapItem[]
      total: EquipeCapItem & { equipe: 'Total' }
    }

type ReceitaPayload = {
  equipes: string[]
  metas: Record<string, number>
  totalReceita: Record<string, number>
  grandTotalReceita: number
  grandTotalMeta: number
}

type ReceitaHistoricoPayload =
  | { semDados: true; mesISO: string }
  | {
      semDados: false
      mesISO: string
      equipes: string[]
      dates: string[]                              // ISO desc, mais recente primeiro
      metas: Record<string, number>
      matrix: Record<string, Record<string, number | null>> // equipe → data → pct
    }

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fBRL(v: number | null): string {
  if (v == null) return '—'
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(v: number | null): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(1).replace('.', ',')}%`
}

function fDeltaPp(v: number | null): { label: string; pos: boolean | null } {
  if (v == null || v === 0) return { label: '—', pos: null }
  const pp = (v * 100).toFixed(1).replace('.', ',')
  return { label: v > 0 ? `+${pp}pp` : `${pp}pp`, pos: v > 0 }
}

function fData(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
  })
}

function mesLabel(iso: string): string {
  return new Date(`${iso}-15`).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getCaptacao(role: string, email: string): Promise<CapPayload | null> {
  try {
    const res = await apiFetch('/pnl/captacao-equipes', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: CapPayload }
    return json.data
  } catch { return null }
}

async function getReceita(role: string, email: string): Promise<ReceitaPayload | null> {
  try {
    const res = await apiFetch('/pnl/receita-equipes', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: ReceitaPayload }
    return json.data
  } catch { return null }
}

async function getReceitaHistorico(role: string, email: string): Promise<ReceitaHistoricoPayload | null> {
  try {
    const res = await apiFetch('/pnl/receita-historico', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: ReceitaHistoricoPayload }
    return json.data
  } catch { return null }
}

/* ─── Cores por equipe ───────────────────────────────────────────────────── */

const EQUIPE_COLORS: Record<string, string> = {
  'SMART':     'var(--color-b-500)',
  'PRIVATE':   'var(--c-gold)',
  'RIO PRETO': '#10B981',
  'BRAVO':     '#8B5CF6',
}

/* ─── Estilos compartilhados ─────────────────────────────────────────────── */

const cardWrap: React.CSSProperties = {
  background:   'var(--bg-elev)',
  borderRadius: 12,
  border:       '1px solid var(--line)',
  boxShadow:    'var(--e-float)',
  overflow:     'hidden',
  marginBottom: 20,
}

const cardHeader: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '13px 20px',
  borderBottom:   '1px solid var(--line)',
  background:     'var(--bg-deep)',
}

const thBase: React.CSSProperties = {
  fontFamily:    'var(--f-mono)',
  fontSize:      11,
  fontWeight:    600,
  color:         'var(--fg-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
  padding:       '8px 14px',
  borderBottom:  '1px solid var(--line)',
  background:    'var(--bg-deep)',
  whiteSpace:    'nowrap',
}

const tdBase: React.CSSProperties = {
  fontFamily:          'var(--f-mono)',
  fontSize:            13,
  padding:             '9px 14px',
  borderBottom:        '1px solid var(--line)',
  color:               'var(--fg)',
  fontFeatureSettings: '"tnum"',
}

/* ─── Componente: Badge de variação ─────────────────────────────────────── */

function DeltaBadge({ v }: { v: { label: string; pos: boolean | null } }) {
  if (v.pos === null || v.label === '—') {
    return <span style={{ color: 'var(--fg-faint)' }}>—</span>
  }
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        padding:      '2px 7px',
        borderRadius: 4,
        fontSize:     11,
        fontWeight:   600,
        background:   v.pos ? 'var(--color-positive-bg)' : 'var(--color-negative-bg)',
        color:        v.pos ? 'var(--color-positive)'    : 'var(--color-negative)',
      }}
    >
      {v.label}
    </span>
  )
}

/* ─── Componente: Barra de progresso ─────────────────────────────────────── */

function ProgressBar({ pct, color = 'var(--color-b-500)' }: { pct: number | null; color?: string }) {
  const w = Math.min(100, Math.max(0, (pct ?? 0) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <div style={{ width: 52, height: 4, borderRadius: 2, background: 'var(--bg-deep)', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ minWidth: 42, textAlign: 'right', color: pct == null ? 'var(--fg-faint)' : pct >= 1 ? 'var(--color-positive)' : 'var(--fg)' }}>
        {fPct(pct)}
      </span>
    </div>
  )
}

/* ─── Tabela 1: Evolução da Receita — série temporal ─────────────────────── */

function TabelaReceitaHistorico({ dados }: { dados: ReceitaHistoricoPayload }) {
  if (dados.semDados) {
    return (
      <div style={cardWrap}>
        <div style={cardHeader}>
          <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
            Evolução da Receita
          </span>
        </div>
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
          Sem dados para o mês corrente.
        </div>
      </div>
    )
  }

  const { equipes, dates, metas, matrix, mesISO } = dados
  const hoje = dates[0]! // mais recente

  return (
    <div style={cardWrap}>
      <div style={cardHeader}>
        <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
          Evolução da Receita — % meta atingida
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {mesLabel(mesISO)} · MTD por equipe
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left', minWidth: 110 }}>Equipe</th>
              {dates.map((d) => (
                <th
                  key={d}
                  style={{
                    ...thBase,
                    textAlign: 'right',
                    color:      d === hoje ? 'var(--color-b-500)' : 'var(--fg-faint)',
                    background: d === hoje
                      ? 'color-mix(in oklch, var(--color-b-500) 6%, var(--bg-deep))'
                      : 'var(--bg-deep)',
                  }}
                >
                  {fData(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipes.map((equipe, ei) => {
              const isLast = ei === equipes.length - 1
              return (
                <tr key={equipe}>
                  <td
                    style={{
                      ...tdBase,
                      textAlign:   'left',
                      fontFamily:  'var(--f-text)',
                      fontWeight:  600,
                      fontSize:    13,
                      borderBottom: isLast ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: EQUIPE_COLORS[equipe] ?? 'var(--fg-faint)', flexShrink: 0 }} />
                      {equipe}
                    </div>
                  </td>
                  {dates.map((d) => {
                    const pct     = matrix[equipe]?.[d] ?? null
                    const isHoje  = d === hoje
                    const pctOk   = (pct ?? 0) >= 1

                    return (
                      <td
                        key={d}
                        style={{
                          ...tdBase,
                          textAlign:    'right',
                          borderBottom: isLast ? 'none' : '1px solid var(--line)',
                          background:   isHoje
                            ? 'color-mix(in oklch, var(--color-b-500) 4%, transparent)'
                            : 'transparent',
                          fontWeight:   isHoje ? 700 : 400,
                          fontSize:     isHoje ? 15 : 13,
                          color:        pct == null
                            ? 'var(--fg-faint)'
                            : pctOk
                              ? 'var(--color-positive)'
                              : isHoje
                                ? 'var(--fg)'
                                : 'var(--fg-mute)',
                          letterSpacing: isHoje ? '-.01em' : undefined,
                        }}
                      >
                        {fPct(pct)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Tabela 2: Receita por Equipe vs Meta (breakdown produto) ────────────── */

function TabelaReceita({ dados }: { dados: ReceitaPayload }) {
  const { equipes, metas, totalReceita, grandTotalReceita, grandTotalMeta } = dados

  return (
    <div style={cardWrap}>
      <div style={cardHeader}>
        <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
          Receita por Equipe
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          MTD — todos os produtos
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left' }}> </th>
              {equipes.map((e) => (
                <th key={e} style={{ ...thBase, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 2, background: EQUIPE_COLORS[e] ?? 'var(--fg-faint)', flexShrink: 0 }} />
                    {e}
                  </div>
                </th>
              ))}
              <th style={{ ...thBase, textAlign: 'right', color: 'var(--fg)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tdBase, textAlign: 'left', fontFamily: 'var(--f-text)', fontWeight: 700, fontSize: 13 }}>
                Receita MTD
              </td>
              {equipes.map((e) => (
                <td key={e} style={{ ...tdBase, textAlign: 'right', fontWeight: 700, color: (totalReceita[e] ?? 0) < 0 ? 'var(--color-negative)' : 'var(--fg)' }}>
                  {fBRL(totalReceita[e] ?? 0)}
                </td>
              ))}
              <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700 }}>
                {fBRL(grandTotalReceita)}
              </td>
            </tr>

            <tr>
              <td style={{ ...tdBase, textAlign: 'left', fontFamily: 'var(--f-text)', fontWeight: 500, fontSize: 13, color: 'var(--fg-mute)' }}>
                Meta Mensal
              </td>
              {equipes.map((e) => (
                <td key={e} style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)' }}>
                  {fBRL(metas[e] ?? 0)}
                </td>
              ))}
              <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-mute)' }}>
                {fBRL(grandTotalMeta)}
              </td>
            </tr>

            <tr style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--line-strong)' }}>
              <td style={{ ...tdBase, textAlign: 'left', fontFamily: 'var(--f-text)', fontWeight: 600, borderBottom: 'none' }}>
                % Atingido
              </td>
              {equipes.map((e) => {
                const pct = (metas[e] ?? 0) > 0 ? (totalReceita[e] ?? 0) / (metas[e] ?? 1) : null
                return (
                  <td key={e} style={{ ...tdBase, textAlign: 'right', borderBottom: 'none' }}>
                    <ProgressBar pct={pct} color="var(--c-gold)" />
                  </td>
                )
              })}
              <td style={{ ...tdBase, textAlign: 'right', borderBottom: 'none' }}>
                <ProgressBar pct={grandTotalMeta > 0 ? grandTotalReceita / grandTotalMeta : null} color="var(--c-gold)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Tabela 3: Captação por Equipe — detalhe ────────────────────────────── */

function TabelaCaptacao({ dados }: { dados: CapPayload }) {
  if (dados.semDados) {
    return (
      <div style={cardWrap}>
        <div style={cardHeader}>
          <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
            Captação por Equipe
          </span>
        </div>
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
          Sem dados para o mês corrente.
        </div>
      </div>
    )
  }

  const rows = [...dados.equipes, { ...dados.total, equipe: 'Total' }]

  return (
    <div style={cardWrap}>
      <div style={cardHeader}>
        <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
          Captação por Equipe
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {dados.dataOntem && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em' }}>
              ontem {fData(dados.dataOntem)}
            </span>
          )}
          <span
            style={{
              fontFamily:    'var(--f-mono)',
              fontSize:      10,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding:       '2px 8px',
              borderRadius:  4,
              background:    'color-mix(in oklch, var(--color-b-500) 10%, transparent)',
              color:         'var(--color-b-500)',
              border:        '1px solid color-mix(in oklch, var(--color-b-500) 25%, transparent)',
            }}
          >
            hoje {fData(dados.dataHoje)}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            {mesLabel(dados.mesISO)}
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, textAlign: 'left' }}>Equipe</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Cap Líq MTD</th>
              <th style={{ ...thBase, textAlign: 'right' }}>% Cap / Meta</th>
              <th style={{ ...thBase, textAlign: 'right' }}>Δ pp (dia)</th>
              <th style={{ ...thBase, textAlign: 'right', color: 'var(--fg-faint)' }}>Meta Mês</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isTotal = row.equipe === 'Total'
              const isLast  = i === rows.length - 1
              const bd      = isLast ? 'none' : '1px solid var(--line)'

              return (
                <tr
                  key={row.equipe}
                  style={{
                    background: isTotal ? 'var(--bg-deep)' : 'transparent',
                    borderTop:  isTotal ? '2px solid var(--line-strong)' : undefined,
                  }}
                >
                  <td style={{ ...tdBase, textAlign: 'left', fontFamily: 'var(--f-text)', fontWeight: isTotal ? 700 : 600, fontSize: 13, borderBottom: bd }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isTotal && (
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: EQUIPE_COLORS[row.equipe] ?? 'var(--fg-faint)', flexShrink: 0 }} />
                      )}
                      {row.equipe}
                    </div>
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', borderBottom: bd, color: row.capHoje < 0 ? 'var(--color-negative)' : 'var(--fg)', fontWeight: isTotal ? 700 : 400 }}>
                    {fBRL(row.capHoje)}
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', borderBottom: bd, color: 'var(--fg-mute)' }}>
                    {fPct(row.pctHoje)}
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', borderBottom: bd }}>
                    <DeltaBadge v={fDeltaPp(row.deltaPp)} />
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', borderBottom: bd, color: 'var(--fg-faint)', fontWeight: 400, fontSize: 12 }}>
                    {fBRL(row.meta)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function PnLPage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/dashboard')
  }

  const [receitaHistorico, receita, captacao] = await Promise.all([
    getReceitaHistorico(session.role, session.email),
    getReceita(session.role, session.email),
    getCaptacao(session.role, session.email),
  ])

  return (
    <div style={{ maxWidth: 1340 }}>
      <PageGreeting name={session.name} label="Resultado gerencial" />

      {/* ── Receita — seção principal ── */}
      <div style={{ marginBottom: 8, marginTop: 16 }}>
        <p style={{ fontFamily: 'var(--f-text)', fontSize: 14, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em', marginBottom: 4 }}>
          Receita
        </p>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '.03em' }}>
          Evolução diária do atingimento de meta por equipe
        </p>
      </div>

      {receitaHistorico ? (
        <TabelaReceitaHistorico dados={receitaHistorico} />
      ) : (
        <div style={{ ...cardWrap, padding: '32px 20px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-faint)' }}>
            Erro ao carregar histórico de receita.
          </span>
        </div>
      )}

      {receita ? (
        <TabelaReceita dados={receita} />
      ) : (
        <div style={{ ...cardWrap, padding: '32px 20px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-faint)' }}>
            Erro ao carregar dados de receita.
          </span>
        </div>
      )}

      {/* ── Captação — detalhe ── */}
      <div style={{ marginBottom: 8, marginTop: 8 }}>
        <p style={{ fontFamily: 'var(--f-text)', fontSize: 14, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em', marginBottom: 4 }}>
          Captação
        </p>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '.03em' }}>
          Captação líquida MTD vs meta de captação
        </p>
      </div>

      {captacao ? (
        <TabelaCaptacao dados={captacao} />
      ) : (
        <div style={{ ...cardWrap, padding: '32px 20px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-faint)' }}>
            Erro ao carregar dados de captação.
          </span>
        </div>
      )}
    </div>
  )
}
