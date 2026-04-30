import type { NoticiasPayload } from '@/../../server/src/lib/rss'
import { requireSession } from '@/lib/auth/session'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type KpisPayload = {
  aum: { value: number; dataRef: string | null }
  clientesAtivos: { value: number }
  captacao: { value: number; mesLabel: string }
  receita: { value: number }
}

/* ─── Formatters ─────────────────────────────────────────────────────────── */

function formatBRL(val: number): string {
  const abs = Math.abs(val)
  const prefix = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${prefix}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${prefix}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${prefix}${Math.round(abs / 1_000)}K`
  return `${prefix}${abs.toFixed(0)}`
}

function formatDataRef(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

function formatAtualizadoEm(iso: string | null): string {
  if (!iso) return 'sem dados'
  const d = new Date(iso)
  const data = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
  const hora = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
  return `${data} às ${hora}`
}

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return 'agora'
  if (h === 1) return 'há 1h'
  if (h < 24) return `há ${h}h`
  return 'ontem'
}

/* ─── Data fetchers ──────────────────────────────────────────────────────── */

async function getKpis(
  email: string,
  role: string,
  equipe: string | undefined,
): Promise<KpisPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const secret = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/performance/kpis`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${secret}`,
        'X-User-Email': email,
        'X-User-Role': role,
        'X-User-Equipe': equipe ?? '',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data: KpisPayload }
    return json.data
  } catch {
    return null
  }
}

async function getNoticias(): Promise<NoticiasPayload> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return { noticias: [], atualizadoEm: null as unknown as string }
  try {
    const res = await fetch(`${apiUrl}/noticias`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data: NoticiasPayload }
    return json.data
  } catch {
    return { noticias: [], atualizadoEm: null as unknown as string }
  }
}

/* ─── Links úteis ────────────────────────────────────────────────────────── */

const LINKS_UTEIS = [
  {
    group: 'Mercado',
    items: [
      {
        label: 'B3 — Bolsa de Valores',
        desc: 'Preços, índices e negociações',
        url: 'https://www.b3.com.br',
      },
      {
        label: 'InfoMoney',
        desc: 'Notícias do mercado financeiro',
        url: 'https://www.infomoney.com.br',
      },
      { label: 'Valor Econômico', desc: 'Jornalismo de negócios', url: 'https://valor.globo.com' },
      { label: 'Bloomberg', desc: 'Dados e notícias globais', url: 'https://www.bloomberg.com' },
    ],
  },
  {
    group: 'Regulatório',
    items: [
      { label: 'ANBIMA', desc: 'Fundos, benchmarks e regulação', url: 'https://www.anbima.com.br' },
      { label: 'CVM', desc: 'Comissão de Valores Mobiliários', url: 'https://www.gov.br/cvm' },
      {
        label: 'BCB Focus',
        desc: 'Relatório de mercado e projeções',
        url: 'https://www.bcb.gov.br/publicacoes/focus',
      },
      {
        label: 'Tesouro Direto',
        desc: 'Títulos públicos e taxas',
        url: 'https://www.tesourodireto.com.br',
      },
    ],
  },
  {
    group: 'Ferramentas',
    items: [
      {
        label: 'Receita Federal',
        desc: 'Consulta CPF/CNPJ e situação fiscal',
        url: 'https://www.receita.fazenda.gov.br',
      },
      {
        label: 'Calculadora BCB',
        desc: 'Correção monetária e juros',
        url: 'https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do',
      },
      {
        label: 'XP Hub',
        desc: 'Plataforma interna XP Investimentos',
        url: 'http://hub.xpi.com.br',
      },
      {
        label: 'Alocação Nobel',
        desc: 'Plataforma de alocação Nobel Capital',
        url: 'https://alocacao.nobelcapital.com.br',
      },
    ],
  },
]

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const session = await requireSession()
  const [{ noticias, atualizadoEm }, kpis] = await Promise.all([
    getNoticias(),
    getKpis(session.email, session.role, session.equipe),
  ])

  const firstName = session.name.split(' ')[0]
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const dataFmt = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const featured = noticias[0] ?? null
  const secondary = noticias.slice(1, 6)

  /* ─── inline styles (tokens via CSS vars) ──────────────── */
  const card: React.CSSProperties = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
  }

  const cardHeader: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 20px',
    borderBottom: '1px solid var(--line)',
    background: 'var(--bg)',
  }

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--f-text)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--fg)',
    letterSpacing: '-.01em',
  }

  const monoLabel: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: 'var(--fg-faint)',
  }

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-faint)', marginBottom: 4 }}>
            Bem-vindo de volta
          </p>
          <h1
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 26,
              fontWeight: 600,
              color: 'var(--fg)',
              lineHeight: 1.15,
              letterSpacing: '-.02em',
            }}
          >
            {saudacao},{' '}
            <span
              style={{
                fontFamily: 'var(--f-display)',
                fontStyle: 'italic',
                color: 'var(--c-gold)',
                fontWeight: 400,
              }}
            >
              {firstName}
            </span>
            {' '}
            <span style={{ color: 'var(--c-gold)', fontSize: 18, fontFamily: 'var(--f-text)', fontStyle: 'normal' }}>♦</span>
          </h1>
        </div>

        {/* Quick-access buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'XP Hub', url: 'http://hub.xpi.com.br' },
            { label: 'B3 Live', url: 'https://www.b3.com.br' },
            { label: 'ANCORD', url: 'https://credenciamento.ancord.org.br/login.html#' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn-ghost"
            >
              {l.label}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                width="10"
                height="10"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* ── KPI stats grid ──────────────────────────────────── */}
      <div className="grid-kpi" style={{ marginBottom: 'var(--s-5)' }}>
        {/* AUM */}
        <div className="ds-stat ds-stat-accent">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
              AUM Total
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-gold)" strokeWidth="1.5" width="15" height="15" aria-hidden="true">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--f-text)', fontSize: 34, fontWeight: 700, lineHeight: 1, color: 'var(--fg)', marginBottom: 14, letterSpacing: '-.02em' }}>
            {kpis ? formatBRL(kpis.aum.value) : '—'}
          </p>
          {kpis?.aum.dataRef ? (
            <span className="ds-badge gold">Posição {formatDataRef(kpis.aum.dataRef)}</span>
          ) : (
            <span className="ds-badge">—</span>
          )}
        </div>

        {/* Clientes ativos */}
        <div className="ds-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
              Clientes Ativos
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-b-500)" strokeWidth="1.5" width="15" height="15" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--f-text)', fontSize: 34, fontWeight: 700, lineHeight: 1, color: 'var(--fg)', marginBottom: 14, letterSpacing: '-.02em' }}>
            {kpis ? kpis.clientesAtivos.value.toLocaleString('pt-BR') : '—'}
          </p>
          <span className="ds-badge">status ativo · XP</span>
        </div>

        {/* Captação */}
        {kpis &&
          (() => {
            const cap = kpis.captacao.value
            const up = cap >= 0
            return (
              <div className="ds-stat">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
                    Captação {kpis.captacao.mesLabel}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke={up ? 'var(--color-positive)' : 'var(--color-negative)'} strokeWidth="1.5" width="15" height="15" aria-hidden="true">
                    <polyline points={up ? '22 7 13.5 15.5 8.5 10.5 2 17' : '2 7 10.5 15.5 15.5 10.5 22 17'}/>
                    <polyline points={up ? '16 7 22 7 22 13' : '8 17 2 17 2 11'}/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'var(--f-text)', fontSize: 34, fontWeight: 700, lineHeight: 1, color: 'var(--fg)', marginBottom: 14, letterSpacing: '-.02em' }}>
                  {formatBRL(cap)}
                </p>
                <span className={`ds-badge ${up ? 'pos' : 'neg'}`}>
                  {up ? '↑' : '↓'} captação líquida
                </span>
              </div>
            )
          })()}

        {/* Receita */}
        <div className="ds-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
              Receita Total
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-b-500)" strokeWidth="1.5" width="15" height="15" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <p style={{ fontFamily: 'var(--f-text)', fontSize: 34, fontWeight: 700, lineHeight: 1, color: 'var(--fg)', marginBottom: 14, letterSpacing: '-.02em' }}>
            {kpis?.receita?.value != null ? formatBRL(kpis.receita.value) : '—'}
          </p>
          <span className="ds-badge">receita consolidada</span>
        </div>
      </div>

      {/* ── Notícias ────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 'var(--s-4)' }}>
        <div className="pattern-grid-overlay" style={cardHeader}>
          <span style={sectionTitle}>Notícias do Mercado</span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              color: 'var(--fg-faint)',
              letterSpacing: '.06em',
            }}
          >
            {formatAtualizadoEm(atualizadoEm)}
          </span>
        </div>

        <div className="grid-news-hero">
          {/* Destaque */}
          {featured ? (
            <div
              style={{
                padding: '20px 24px',
                borderRight: '1px solid var(--line)',
                background: 'color-mix(in oklch, var(--c-gold) 3%, var(--bg-elev))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: featured.sourceColor,
                    borderBottom: `1px solid ${featured.sourceColor}`,
                    paddingBottom: 1,
                  }}
                >
                  {featured.source}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 9,
                    color: 'var(--fg-faint)',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {featured.category}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 10,
                    color: 'var(--fg-faint)',
                    marginLeft: 'auto',
                  }}
                >
                  {timeAgo(featured.publishedAt)}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--f-text)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--fg)',
                  lineHeight: 1.4,
                  letterSpacing: '-.01em',
                  marginBottom: 12,
                }}
              >
                {featured.url ? (
                  <a
                    href={featured.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {featured.headline}
                  </a>
                ) : (
                  featured.headline
                )}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fg-mute)', lineHeight: 1.65 }}>
                {featured.summary}
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-faint)',
                fontSize: 13,
              }}
            >
              Notícias disponíveis após a primeira atualização (6h30)
            </div>
          )}

          {/* Lista secundária */}
          <div>
            {secondary.map((n, i) => (
              <div
                key={n.id}
                className="news-item"
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '12px 20px',
                  borderBottom: i < secondary.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                {/* source accent line */}
                <div
                  style={{
                    width: 2,
                    background: n.sourceColor,
                    flexShrink: 0,
                    borderRadius: 1,
                    opacity: 0.6,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: n.sourceColor,
                      }}
                    >
                      {n.source}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 9,
                        color: 'var(--fg-faint)',
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {n.category}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 10,
                        color: 'var(--fg-faint)',
                        marginLeft: 'auto',
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(n.publishedAt)}
                    </span>
                  </div>
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--fg)',
                          lineHeight: 1.4,
                        }}
                      >
                        {n.headline}
                      </p>
                    </a>
                  ) : (
                    <p
                      style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', lineHeight: 1.4 }}
                    >
                      {n.headline}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--fg-faint)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 2,
                    }}
                  >
                    {n.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Links úteis ─────────────────────────────────────── */}
      <div style={card}>
        <div className="pattern-grid-overlay" style={cardHeader}>
          <span style={sectionTitle}>Links Úteis</span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              color: 'var(--fg-faint)',
              letterSpacing: '.06em',
            }}
          >
            abre em nova aba
          </span>
        </div>
        <div
          style={{
            padding: 'var(--s-4) var(--s-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-5)',
          }}
        >
          {LINKS_UTEIS.map((group) => (
            <div key={group.group}>
              <p
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  fontWeight: 500,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-faint)',
                  marginBottom: 10,
                }}
              >
                {group.group}
              </p>
              <div className="grid-links-row">
                {group.items.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      padding: '12px 14px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', lineHeight: 1.3 }}
                    >
                      {link.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 10,
                        color: 'var(--fg-faint)',
                        lineHeight: 1.4,
                        letterSpacing: '.02em',
                      }}
                    >
                      {link.desc}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
