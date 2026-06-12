import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { PageGreeting } from '../_components/PageGreeting'
import { IndicadoresTeams } from './_components/IndicadoresTeams'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type CapEquipeItem = {
  equipe:   string
  capHoje:  number
  capOntem: number
  deltaDia: number
  meta:     number
  pctHoje:  number | null
  pctOntem: number | null
  deltaPp:  number | null
}

type CapPayload =
  | { semDados: true; mesISO: string }
  | {
      semDados:  false
      mesISO:    string
      dataHoje:  string
      dataOntem: string | null
      equipes:   CapEquipeItem[]
      total: {
        capHoje:  number
        capOntem: number
        deltaDia: number
        meta:     number
        pctHoje:  number | null
        pctOntem: number | null
        deltaPp:  number | null
      }
    }

type ReceitaPayload = {
  equipes:          string[]
  metas:            Record<string, number>
  totalReceita:     Record<string, number>
  grandTotalReceita: number
  grandTotalMeta:   number
}

type KpisPayload = {
  mesISO:           string
  yearStr:          string
  assessoresAtivos: number
  ytdByEquipe:      Record<string, number>
  recYtdByEquipe:   Record<string, number>
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function getMesLabel(mesISO: string): string {
  return new Date(`${mesISO}-15`).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

/* ─── Fetches ────────────────────────────────────────────────────────────── */

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

async function getKpis(role: string, email: string): Promise<KpisPayload | null> {
  try {
    const res = await apiFetch('/pnl/indicadores/kpis', {
      cache: 'no-store',
      headers: { 'X-User-Role': role, 'X-User-Email': email },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data: KpisPayload }
    return json.data
  } catch { return null }
}

/* ─── KpiChip ────────────────────────────────────────────────────────────── */

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background:   'var(--bg-elev)',
        border:       '1px solid var(--line)',
        borderRadius: 8,
        padding:      '10px 16px',
      }}
    >
      <div
        style={{
          fontFamily:    'var(--f-mono)',
          fontSize:      18,
          fontWeight:    600,
          color:         'var(--fg)',
          letterSpacing: '-.01em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily:    'var(--f-mono)',
          fontSize:      10,
          color:         'var(--fg-faint)',
          marginTop:     2,
          textTransform: 'uppercase',
          letterSpacing: '.06em',
        }}
      >
        {label}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function IndicadoresPage() {
  const session = await requireSession()

  if (session.role !== 'admin' && session.role !== 'master') {
    redirect('/dashboard')
  }

  const [captacao, receita, kpis] = await Promise.all([
    getCaptacao(session.role, session.email),
    getReceita(session.role, session.email),
    getKpis(session.role, session.email),
  ])

  const mesISO   = kpis?.mesISO ?? captacao?.mesISO ?? ''
  const yearStr  = kpis?.yearStr ?? (mesISO ? mesISO.substring(0, 4) : '')
  const mesLabel = mesISO ? getMesLabel(mesISO) : ''

  // Totais para KPI bar
  const capMtdTotal = captacao && !captacao.semDados ? captacao.total.capHoje : 0
  const capYtdTotal = kpis ? Object.values(kpis.ytdByEquipe).reduce((s, v) => s + v, 0) : 0
  const recMtdTotal = receita ? receita.grandTotalReceita : 0
  const assessoresAtivos = kpis?.assessoresAtivos ?? 0

  // Monta dados consolidados por equipe para o componente client
  type EquipeUnificada = {
    equipe:   string
    cap_mtd:  number
    cap_meta: number
    cap_pct:  number | null
    cap_ytd:  number
    rec_mtd:  number
    rec_ytd:  number
    rec_meta: number
    rec_pct:  number | null
  }

  const equipesList = captacao && !captacao.semDados
    ? captacao.equipes.map((e) => e.equipe)
    : (receita?.equipes ?? [])

  const equipesUnificadas: EquipeUnificada[] = equipesList.map((equipe) => {
    const cap = captacao && !captacao.semDados
      ? captacao.equipes.find((e) => e.equipe === equipe)
      : null
    const cap_mtd  = cap?.capHoje  ?? 0
    const cap_meta = cap?.meta     ?? 0
    const cap_pct  = cap?.pctHoje  ?? null
    const cap_ytd  = kpis?.ytdByEquipe[equipe] ?? 0
    const rec_mtd  = receita?.totalReceita[equipe] ?? 0
    const rec_ytd  = kpis?.recYtdByEquipe[equipe] ?? 0
    const rec_meta = receita?.metas[equipe] ?? 0
    const rec_pct  = rec_meta > 0 ? rec_mtd / rec_meta : null
    return { equipe, cap_mtd, cap_meta, cap_pct, cap_ytd, rec_mtd, rec_ytd, rec_meta, rec_pct }
  })

  // Totais da linha de rodapé
  const recYtdTotal = kpis
    ? Object.values(kpis.recYtdByEquipe).reduce((s, v) => s + v, 0)
    : 0

  const totalUnificado: EquipeUnificada = {
    equipe:   'Total',
    cap_mtd:  equipesUnificadas.reduce((s, e) => s + e.cap_mtd, 0),
    cap_meta: equipesUnificadas.reduce((s, e) => s + e.cap_meta, 0),
    cap_pct:  null,
    cap_ytd:  capYtdTotal,
    rec_mtd:  recMtdTotal,
    rec_ytd:  recYtdTotal,
    rec_meta: receita?.grandTotalMeta ?? 0,
    rec_pct:  null,
  }
  if (totalUnificado.cap_meta > 0) {
    totalUnificado.cap_pct = totalUnificado.cap_mtd / totalUnificado.cap_meta
  }
  if (totalUnificado.rec_meta > 0) {
    totalUnificado.rec_pct = totalUnificado.rec_mtd / totalUnificado.rec_meta
  }

  const semDados = equipesUnificadas.length === 0

  return (
    <div style={{ maxWidth: 1340 }}>
      <PageGreeting name={session.name} label="Indicadores gerenciais" />

      {/* KPI bar */}
      <div
        style={{
          display:      'flex',
          gap:          12,
          marginTop:    16,
          marginBottom: 20,
          flexWrap:     'wrap',
        }}
      >
        <KpiChip
          label="Assessores ativos"
          value={String(assessoresAtivos)}
        />
        <KpiChip
          label={`Cap MTD${mesLabel ? ` — ${mesLabel}` : ''}`}
          value={fBRL(capMtdTotal)}
        />
        <KpiChip
          label={`Cap YTD${yearStr ? ` — ${yearStr}` : ''}`}
          value={fBRL(capYtdTotal)}
        />
        <KpiChip
          label={`Rec MTD${mesLabel ? ` — ${mesLabel}` : ''}`}
          value={fBRL(recMtdTotal)}
        />
      </div>

      {semDados ? (
        <div
          style={{
            background:   'var(--bg-elev)',
            borderRadius: 12,
            border:       '1px solid var(--line)',
            padding:      '48px 24px',
            textAlign:    'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize:   13,
              color:      'var(--fg-faint)',
            }}
          >
            Sem dados disponíveis para o período atual.
          </span>
        </div>
      ) : (
        <IndicadoresTeams
          equipes={equipesUnificadas}
          total={totalUnificado}
          mesISO={mesISO}
        />
      )}
    </div>
  )
}
