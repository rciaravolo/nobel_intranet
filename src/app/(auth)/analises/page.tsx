import { requireSession } from '@/lib/auth/session'
import { BlocoCaptacao } from './_components/BlocoCaptacao'
import { BlocoReceita } from './_components/BlocoReceita'
import { BlocoMetas } from './_components/BlocoMetas'
import { AnalisesFilters } from './_components/AnalisesFilters'

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

function perfHeaders(
  email: string,
  role: string,
  equipe: string | undefined,
  secret: string,
  filterType?: string,
  filterValue?: string,
) {
  return {
    Authorization:   `Bearer ${secret}`,
    'X-User-Email':  email,
    'X-User-Role':   role,
    'X-User-Equipe': equipe ?? '',
    ...(filterType  ? { 'X-Filter-Type':  filterType  } : {}),
    ...(filterValue ? { 'X-Filter-Value': filterValue } : {}),
  }
}

type FetchOpts = {
  email: string
  role: string
  equipe: string | undefined
  filterType?: string
  filterValue?: string
}

async function getOnepage(opts: FetchOpts): Promise<OnepagePayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/onepage`, {
      cache: 'no-store',
      headers: perfHeaders(opts.email, opts.role, opts.equipe, secret, opts.filterType, opts.filterValue),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: OnepagePayload }
    return json.data
  } catch {
    return null
  }
}

async function getMetas(opts: FetchOpts): Promise<MetasPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/metas`, {
      headers: perfHeaders(opts.email, opts.role, opts.equipe, secret, opts.filterType, opts.filterValue),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: MetasPayload }
    return json.data
  } catch {
    return null
  }
}

async function getHistorico(opts: FetchOpts): Promise<HistoricoPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/historico`, {
      cache: 'no-store',
      headers: perfHeaders(opts.email, opts.role, opts.equipe, secret, opts.filterType, opts.filterValue),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: HistoricoPayload }
    return json.data
  } catch {
    return null
  }
}

type AssessoresPayload = {
  equipes: string[]
  assessores: { id_assessor: string; nome_assessor: string | null; equipe: string }[]
}

async function getAssessores(role: string, email: string): Promise<AssessoresPayload | null> {
  if (role !== 'admin' && role !== 'master') return null
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/assessores`, {
      cache: 'no-store',
      headers: {
        Authorization:  `Bearer ${secret}`,
        'X-User-Role':  role,
        'X-User-Email': email,
      },
    })
    if (!res.ok) return null
    const json = await res.json() as { data: AssessoresPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: 'var(--bg-elev)',
  borderRadius: 8,
  border: '1px solid var(--line)',
  boxShadow: 'var(--e-1)',
}

const cardPad: React.CSSProperties = { padding: '22px 24px' }

const label: React.CSSProperties = {
  fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-faint)',
  textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10,
}

const valor: React.CSSProperties = {
  fontFamily: 'var(--f-mono)', fontSize: 30, fontWeight: 500,
  color: 'var(--fg)', marginBottom: 8, lineHeight: 1,
  fontFeatureSettings: "'tnum'",
}

const pill = (up?: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 3,
  fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500,
  padding: '2px 10px', borderRadius: 'var(--r-pill)',
  border: '1px solid',
  borderColor: up == null ? 'var(--line-strong)' : up ? 'var(--color-positive)' : 'var(--color-negative)',
  background: 'transparent',
  color: up == null ? 'var(--fg-mute)' : up ? 'var(--color-positive)' : 'var(--color-negative)',
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
    fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500, color: 'var(--fg-faint)',
    textTransform: 'uppercase', letterSpacing: '0.14em',
    padding: '8px 12px', textAlign: 'right', background: 'var(--bg-deep)',
    borderBottom: '1px solid var(--line)',
  }
  const thLeft: React.CSSProperties = { ...thStyle, textAlign: 'left' }
  const tdStyle: React.CSSProperties = {
    fontFamily: 'var(--f-mono)', fontSize: 12, padding: '7px 12px', textAlign: 'right',
    color: 'var(--fg)', borderBottom: '1px solid var(--line)',
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
      background: 'var(--bg-elev)', borderRadius: 8,
      border: '1px solid var(--line)',
      boxShadow: 'var(--e-1)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        borderBottom: '1px solid var(--line)', background: 'var(--bg-deep)',
      }}>
        <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
          {title}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-faint)' }}>{subtitle}</span>
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
                <tr key={row.mes}>
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
                    color: mom.up == null ? 'var(--fg-faint)' : mom.up ? 'var(--color-positive)' : 'var(--color-negative)',
                  }}>
                    {mom.label}
                  </td>
                  <td style={{
                    ...tdStyle,
                    borderBottom: isLastRow ? 'none' : tdStyle.borderBottom,
                    fontWeight: 500,
                    color: yoy.up == null ? 'var(--fg-faint)' : yoy.up ? 'var(--color-positive)' : 'var(--color-negative)',
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
                <tr style={{ background: 'var(--bg-deep)', borderTop: '2px solid var(--line-strong)' }}>
                  <td style={{ ...tdLeft, fontWeight: 700, borderBottom: 'none', fontSize: 12 }}>Total</td>
                  <td style={{ ...tdStyle, fontWeight: 700, borderBottom: 'none', color: 'var(--fg-mute)' }}>
                    {format(total25 ?? null)}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, borderBottom: 'none' }}>
                    {format(total26 ?? null)}
                  </td>
                  <td style={{ ...tdStyle, borderBottom: 'none', color: 'var(--fg-faint)' }}>—</td>
                  <td style={{
                    ...tdStyle, fontWeight: 700, borderBottom: 'none',
                    color: totYoy.up == null ? 'var(--fg-faint)' : totYoy.up ? 'var(--color-positive)' : 'var(--color-negative)',
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

export default async function AnalisesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireSession()
  const sp = await searchParams
  const filterType  = typeof sp.filter_type  === 'string' ? sp.filter_type  : undefined
  const filterValue = typeof sp.filter_value === 'string' ? sp.filter_value : undefined

  const canFilter = session.role === 'admin' || session.role === 'master'
  const opts: FetchOpts = {
    email:  session.email,
    role:   session.role,
    equipe: session.equipe,
    ...(canFilter && filterType  ? { filterType }  : {}),
    ...(canFilter && filterValue ? { filterValue } : {}),
  }

  const [data, metas, hist, assessoresData] = await Promise.all([
    getOnepage(opts),
    getMetas(opts),
    getHistorico(opts),
    getAssessores(session.role, session.email),
  ])
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
          <p style={{ fontSize: 12, color: 'var(--fg-faint)', marginBottom: 5 }}>
            Posição em {fDataRef(data?.dataRef ?? null)}
          </p>
          <h1 style={{ fontFamily: 'var(--f-text)', fontSize: 24, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.02em' }}>
            Onepage —{' '}
            <span style={{ color: 'var(--color-b-500)' }}>
              {filterType === 'equipe' && filterValue
                ? `Equipe ${filterValue}`
                : filterType === 'assessor' && assessoresData
                  ? (assessoresData.assessores.find(a => a.id_assessor === filterValue)?.nome_assessor?.split(' ').slice(0, 2).join(' ') ?? filterValue)
                  : firstName}
            </span>
          </h1>
        </div>
      </div>

      {/* ── Filtros (admin / master) ── */}
      {canFilter && (
        <AnalisesFilters
          equipes={assessoresData?.equipes ?? []}
          assessores={assessoresData?.assessores ?? []}
        />
      )}

      {/* ── Bloco 1: KPI cards — full width ── */}
      <div className="grid-kpi" style={{ marginBottom: 20 }}>

        {/* AuM */}
        <div style={{ ...card, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--c-gold)' }} />
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

      {/* ── Layout: duas colunas para admin/master/lider, coluna única para assessor ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: session.role !== 'assessor' ? '1fr 380px' : '1fr',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* Coluna principal */}
        <div>
          {/* Captação — key força remount ao mudar filtro, limpando cache */}
          <BlocoCaptacao
            key={`captacao-${filterType ?? ''}-${filterValue ?? ''}`}
            captacao={captacao}
            mesLabel={data?.mesLabel ?? ''}
            {...(canFilter && filterType  ? { filterType }  : {})}
            {...(canFilter && filterValue ? { filterValue } : {})}
          />

          {/* Receita por Produto — key força remount ao mudar filtro, limpando cache */}
          <BlocoReceita
            key={`receita-${filterType ?? ''}-${filterValue ?? ''}`}
            porProduto={receita.porProduto}
            receitaTotal={receita.total}
            {...(canFilter && filterType  ? { filterType }  : {})}
            {...(canFilter && filterValue ? { filterValue } : {})}
          />

          {/* Histórico */}
          {histRows.length > 0 && (
            <>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: 'var(--f-text)', fontSize: 14, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
                  Histórico
                </p>
                <p style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 3 }}>
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

        {/* Sidebar — Metas (sticky) — oculto para assessor */}
        {session.role !== 'assessor' && (
          <div style={{ position: 'sticky', top: 24 }}>
            <BlocoMetas dados={metas} compact />
          </div>
        )}

      </div>

    </div>
  )
}
