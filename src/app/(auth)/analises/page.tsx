import { requireSession } from '@/lib/auth/session'
import { BlocoCaptacao } from './_components/BlocoCaptacao'
import { BlocoReceita } from './_components/BlocoReceita'
import { BlocoMetas } from './_components/BlocoMetas'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type ReceitaProduto = { produto: string; receita: number }

type OnepagePayload = {
  dataRef:  string | null
  mesLabel: string
  aum:      number
  clientes: { ativos: number; inativos: number }
  captacao: { bruta: number; resgates: number; liquida: number }
  receita:  { total: number; porProduto: ReceitaProduto[] }
}

type MetaProduto = {
  slug: string; label: string
  meta: number; realizado: number; gap: number
  pctAtingido: number | null
  paceRealizado: number; paceNecessario: number
  projecao: number; pctMeta: number | null
}

type MetasPayload =
  | { semMeta: true; mesISO: string }
  | {
      semMeta:  false
      mesISO:   string
      dias:     { passados: number; restantes: number; total: number }
      produtos: MetaProduto[]
      total:    { meta: number; realizado: number; projecao: number; gap: number; pctAtingido: number | null; pctMeta: number | null }
    }

type MesHistorico = {
  mes:      number
  label:    string
  custodia: { v25: number | null; v26: number | null }
  captacao: { v25: number | null; v26: number | null }
  roa:      { v25: number | null; v26: number | null }
  receita:  { v25: number | null; v26: number | null }
}

type HistoricoPayload = {
  historico: MesHistorico[]
  totais: {
    captacao: { v25: number; v26: number }
    receita:  { v25: number; v26: number }
  }
}

/* ─── Cores por produto de receita ───────────────────────────────────────── */

const RECEITA_COLOR: Record<string, string> = {
  'Renda Variável':  '#F59E0B',
  'Renda Fixa':      '#3B82F6',
  'COE':             '#EF4444',
  'Câmbio':          '#06B6D4',
  'Fee Fixo':        '#8B5CF6',
  'Seguros':         '#10B981',
  'Consórcio':       '#F97316',
  'Dominion':        '#6366F1',
  'Oferta de Fundos':'#EC4899',
}
const rColor = (p: string) => RECEITA_COLOR[p] ?? '#B8963E'

/* ─── Formatação ─────────────────────────────────────────────────────────── */

function fBRL(val: number | null): string {
  if (val == null) return '—'
  const abs = Math.abs(val)
  const pre = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fNum(val: number): string {
  return val.toLocaleString('pt-BR')
}

function fPct(val: number, total: number): string {
  return total > 0 ? `${((val / total) * 100).toFixed(1).replace('.', ',')}%` : '—'
}

function fDataRef(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

function fRoa(val: number | null): string {
  if (val == null) return '—'
  return `${(val * 100).toFixed(2).replace('.', ',')}%`
}

function varPct(cur: number | null, prev: number | null): { label: string; up: boolean | null } {
  if (cur == null || prev == null || prev === 0) return { label: '—', up: null }
  const pct = ((cur - prev) / Math.abs(prev)) * 100
  const sign = pct >= 0 ? '+' : ''
  return { label: `${sign}${pct.toFixed(1).replace('.', ',')}%`, up: pct >= 0 }
}

function varRoaBp(cur: number | null, prev: number | null): { label: string; up: boolean | null } {
  if (cur == null || prev == null) return { label: '—', up: null }
  const bp = Math.round((cur - prev) * 10000)
  const sign = bp >= 0 ? '+' : ''
  return { label: `${sign}${bp} bps`, up: bp >= 0 }
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getOnepage(): Promise<OnepagePayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/onepage`, {
      next: { revalidate: 3600 },
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: OnepagePayload }
    return json.data
  } catch {
    return null
  }
}

async function getMetas(): Promise<MetasPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/metas`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: MetasPayload }
    return json.data
  } catch {
    return null
  }
}

async function getHistorico(): Promise<HistoricoPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/historico`, {
      next: { revalidate: 3600 },
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: HistoricoPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid rgba(184,150,62,0.12)',
  boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
}

const cardPad: React.CSSProperties = { padding: '22px 24px' }

const label: React.CSSProperties = {
  fontSize: 10, color: 'rgba(26,18,9,0.38)',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
}

const valor: React.CSSProperties = {
  fontFamily: 'var(--font-lora, serif)', fontSize: 30, fontWeight: 600,
  color: '#1A1209', marginBottom: 8, lineHeight: 1,
}

const pill = (up?: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 3,
  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
  background: up == null
    ? 'rgba(26,18,9,0.05)'
    : up ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
  color: up == null ? 'rgba(26,18,9,0.45)' : up ? '#16a34a' : '#dc2626',
})

/* ─── Page ───────────────────────────────────────────────────────────────── */

/* ─── Componente: Tabela Histórica ───────────────────────────────────────── */

type HistTableProps = {
  title:    string
  subtitle: string
  rows:     MesHistorico[]
  getValue: (r: MesHistorico) => { v25: number | null; v26: number | null }
  format:   (v: number | null) => string
  varFn:    (cur: number | null, prev: number | null) => { label: string; up: boolean | null }
  total25?: number | undefined
  total26?: number | undefined
}

function HistTable({ title, subtitle, rows, getValue, format, varFn, total25, total26 }: HistTableProps) {
  const thStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: 'rgba(26,18,9,0.38)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '8px 12px', textAlign: 'right', background: '#FDFAF5',
    borderBottom: '1px solid rgba(184,150,62,0.09)',
  }
  const thLeft: React.CSSProperties = { ...thStyle, textAlign: 'left' }
  const tdStyle: React.CSSProperties = {
    fontSize: 12, padding: '7px 12px', textAlign: 'right',
    color: '#1A1209', borderBottom: '1px solid rgba(184,150,62,0.06)',
  }
  const tdLeft: React.CSSProperties = { ...tdStyle, textAlign: 'left', fontWeight: 500 }

  // For % MoM (2026): compare with previous month in 2026 (or dec-25 for jan)
  // For % YoY: compare v26 with v25 same month
  const getV = (i: number, year: '25' | '26') => {
    const r = rows[i]
    if (!r) return null
    const v = getValue(r)
    return year === '25' ? v.v25 : v.v26
  }

  const getPrevMonth26 = (i: number) => {
    if (i === 0) return getV(11, '25') // jan-26 → dec-25
    return getV(i - 1, '26')
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      border: '1px solid rgba(184,150,62,0.12)',
      boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(184,150,62,0.09)', background: '#FDFAF5',
      }}>
        <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)' }}>{subtitle}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thLeft}>Mês</th>
              <th style={thStyle}>2025</th>
              <th style={thStyle}>2026</th>
              <th style={thStyle}>% MoM</th>
              <th style={thStyle}>% YoY</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const { v25, v26 } = getValue(row)
              const mom = varFn(v26, getPrevMonth26(i))
              const yoy = varFn(v26, v25)
              const isLastRow = i === rows.length - 1
              return (
                <tr key={row.mes} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(184,150,62,0.02)' }}>
                  <td style={{ ...tdLeft, borderBottom: isLastRow ? 'none' : tdStyle.borderBottom, textTransform: 'capitalize' }}>
                    {row.label}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: isLastRow ? 'none' : tdStyle.borderBottom, color: 'rgba(26,18,9,0.45)' }}>
                    {format(v25)}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: isLastRow ? 'none' : tdStyle.borderBottom, fontWeight: 600 }}>
                    {format(v26)}
                  </td>
                  <td style={{
                    ...tdStyle,
                    borderBottom: isLastRow ? 'none' : tdStyle.borderBottom,
                    fontWeight: 500,
                    color: mom.up == null ? 'rgba(26,18,9,0.38)' : mom.up ? '#16a34a' : '#dc2626',
                  }}>
                    {mom.label}
                  </td>
                  <td style={{
                    ...tdStyle,
                    borderBottom: isLastRow ? 'none' : tdStyle.borderBottom,
                    fontWeight: 500,
                    color: yoy.up == null ? 'rgba(26,18,9,0.38)' : yoy.up ? '#16a34a' : '#dc2626',
                  }}>
                    {yoy.label}
                  </td>
                </tr>
              )
            })}

            {/* Total row */}
            {(total25 != null || total26 != null) && (() => {
              const totYoy = varFn(total26 ?? null, total25 ?? null)
              return (
                <tr style={{ background: '#FDFAF5', borderTop: '2px solid rgba(184,150,62,0.12)' }}>
                  <td style={{ ...tdLeft, fontWeight: 700, borderBottom: 'none', fontSize: 12 }}>Total</td>
                  <td style={{ ...tdStyle, fontWeight: 700, borderBottom: 'none', color: 'rgba(26,18,9,0.55)' }}>
                    {format(total25 ?? null)}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, borderBottom: 'none' }}>
                    {format(total26 ?? null)}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: 'none', color: 'rgba(26,18,9,0.28)' }}>—</td>
                  <td style={{
                    ...tdStyle, fontWeight: 700, borderBottom: 'none',
                    color: totYoy.up == null ? 'rgba(26,18,9,0.38)' : totYoy.up ? '#16a34a' : '#dc2626',
                  }}>
                    {totYoy.label}
                  </td>
                </tr>
              )
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function AnalisesPage() {
  const [session, data, metas, hist] = await Promise.all([requireSession(), getOnepage(), getMetas(), getHistorico()])
  const firstName = session.name.split(' ')[0]

  const aum       = data?.aum ?? 0
  const clientes  = data?.clientes  ?? { ativos: 0, inativos: 0 }
  const captacao  = data?.captacao  ?? { bruta: 0, resgates: 0, liquida: 0 }
  const receita   = data?.receita   ?? { total: 0, porProduto: [] }

  const histRows  = hist?.historico ?? []
  const totais    = hist?.totais

  return (
    <div style={{ maxWidth: 1340 }}>

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.38)', marginBottom: 5 }}>
            Posição em {fDataRef(data?.dataRef ?? null)}
          </p>
          <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 26, fontWeight: 500, color: '#1A1209' }}>
            Onepage — <span style={{ color: '#B8963E' }}>{firstName}</span>
          </h1>
        </div>
      </div>

      {/* ── Bloco 1: KPI cards — full width ── */}
      <div className="grid-kpi" style={{ marginBottom: 20 }}>

        {/* AuM */}
        <div style={{ ...card, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #B8963E, #D4A96A)' }} />
          <div style={cardPad}>
            <p style={label}>Custódia (AuM)</p>
            <p style={valor}>{fBRL(aum)}</p>
            <span style={pill()}>posição {fDataRef(data?.dataRef ?? null)}</span>
          </div>
        </div>

        {/* Clientes Ativos */}
        <div style={card}>
          <div style={cardPad}>
            <p style={label}>Clientes Ativos</p>
            <p style={valor}>{fNum(clientes.ativos)}</p>
            <span style={pill(true)}>↑ base ativa XP</span>
          </div>
        </div>

        {/* Clientes Inativos */}
        <div style={card}>
          <div style={cardPad}>
            <p style={label}>Clientes Inativos</p>
            <p style={valor}>{fNum(clientes.inativos)}</p>
            <span style={pill(false)}>
              ↓ {fPct(clientes.inativos, clientes.ativos + clientes.inativos)} da base total
            </span>
          </div>
        </div>

        {/* Receita Total */}
        <div style={card}>
          <div style={cardPad}>
            <p style={label}>Receita Total</p>
            <p style={valor}>{fBRL(receita.total)}</p>
            <span style={pill()}>todos os produtos</span>
          </div>
        </div>

      </div>

      {/* ── Layout de duas colunas: conteúdo principal + sidebar metas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

        {/* Coluna principal */}
        <div>
          {/* Captação */}
          <BlocoCaptacao captacao={captacao} mesLabel={data?.mesLabel ?? ''} />

          {/* Receita por Produto */}
          <BlocoReceita porProduto={receita.porProduto} receitaTotal={receita.total} />

          {/* Histórico */}
          {histRows.length > 0 && (
            <>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 18, fontWeight: 500, color: '#1A1209' }}>
                  Histórico
                </p>
                <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.38)', marginTop: 3 }}>
                  Comparativo mensal 2025 vs 2026
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <HistTable
                  title="Custódia (AuM)"
                  subtitle="R$ por mês"
                  rows={histRows}
                  getValue={(r) => r.custodia}
                  format={fBRL}
                  varFn={varPct}
                />
                <HistTable
                  title="ROA Anualizado"
                  subtitle="receita / AuM médio × 12"
                  rows={histRows}
                  getValue={(r) => r.roa}
                  format={fRoa}
                  varFn={varRoaBp}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <HistTable
                  title="Captação Líquida"
                  subtitle="R$ por mês"
                  rows={histRows}
                  getValue={(r) => r.captacao}
                  format={fBRL}
                  varFn={varPct}
                  total25={totais?.captacao.v25}
                  total26={totais?.captacao.v26}
                />
                <HistTable
                  title="Receita Total"
                  subtitle="R$ por mês"
                  rows={histRows}
                  getValue={(r) => r.receita}
                  format={fBRL}
                  varFn={varPct}
                  total25={totais?.receita.v25}
                  total26={totais?.receita.v26}
                />
              </div>
            </>
          )}
        </div>

        {/* Sidebar — Metas (sticky) */}
        <div style={{ position: 'sticky', top: 24 }}>
          <BlocoMetas dados={metas} compact />
        </div>

      </div>

    </div>
  )
}
