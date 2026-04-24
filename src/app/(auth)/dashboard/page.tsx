import { requireSession } from '@/lib/auth/session'
import type { NoticiasPayload } from '@/../../server/src/lib/rss'

/* ─── Dados ─────────────────────────────────────────────────────────────── */

const KPI_DATA = [
  { label: 'AUM Total',       value: 'R$ 2,4B', delta: '+12,4%', up: true,  sub: 'vs mês anterior' },
  { label: 'Clientes Ativos', value: '1.847',   delta: '+34',    up: true,  sub: 'este mês'        },
  { label: 'Retorno Médio',   value: '18,7%',   delta: '+2,1pp', up: true,  sub: 'vs CDI'          },
  { label: 'Captação Mar.',   value: 'R$ 48M',  delta: '−8,2%',  up: false, sub: 'vs fevereiro'    },
]

async function getNoticias(): Promise<NoticiasPayload> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return { noticias: [], atualizadoEm: null as unknown as string }

  try {
    const res = await fetch(`${apiUrl}/noticias`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as { data: NoticiasPayload }
    return json.data
  } catch {
    return { noticias: [], atualizadoEm: null as unknown as string }
  }
}

function formatAtualizadoEm(iso: string | null): string {
  if (!iso) return 'Sem dados ainda'
  const d = new Date(iso)
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${data} às ${hora}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'agora'
  if (h === 1) return 'há 1h'
  if (h < 24) return `há ${h}h`
  return 'ontem'
}

const LINKS_UTEIS = [
  {
    group: 'Mercado',
    items: [
      { label: 'B3 — Bolsa de Valores',    desc: 'Preços, índices e negociações em tempo real', url: 'https://www.b3.com.br',            icon: '📈', bg: '#fee2e2' },
      { label: 'InfoMoney',                 desc: 'Notícias e análises do mercado financeiro',   url: 'https://www.infomoney.com.br',     icon: '📰', bg: '#fee2e2' },
      { label: 'Valor Econômico',           desc: 'Jornalismo de negócios e economia',           url: 'https://valor.globo.com',          icon: '🗞️', bg: '#dbeafe' },
      { label: 'Bloomberg',                 desc: 'Dados globais e notícias financeiras',        url: 'https://www.bloomberg.com',       icon: '🌐', bg: '#dbeafe' },
    ],
  },
  {
    group: 'Regulatório',
    items: [
      { label: 'ANBIMA',                    desc: 'Benchmarks, dados de fundos e regulação',    url: 'https://www.anbima.com.br',        icon: '🏛️', bg: '#d1fae5' },
      { label: 'CVM',                       desc: 'Comissão de Valores Mobiliários',            url: 'https://www.gov.br/cvm',           icon: '⚖️', bg: '#d1fae5' },
      { label: 'Banco Central — Focus',     desc: 'Relatório de mercado e dados econômicos',   url: 'https://www.bcb.gov.br/publicacoes/focus', icon: '🏦', bg: '#ede9fe' },
      { label: 'Tesouro Direto',            desc: 'Títulos públicos federais e taxas',          url: 'https://www.tesourodireto.com.br', icon: '📊', bg: '#ede9fe' },
    ],
  },
  {
    group: 'Ferramentas',
    items: [
      { label: 'Receita Federal',           desc: 'Consulta CPF/CNPJ e situação fiscal',        url: 'https://www.receita.fazenda.gov.br', icon: '🔍', bg: '#fef3c7' },
      { label: 'Calculadora do Cidadão',    desc: 'Correção monetária, juros compostos, FGTS', url: 'https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do', icon: '🧮', bg: '#fef3c7' },
      { label: 'XP Hub',                    desc: 'Plataforma interna XP Investimentos',        url: 'http://hub.xpi.com.br',            icon: '⭐', bg: 'rgba(184,150,62,0.15)' },
      { label: 'Alocação Nobel',            desc: 'Plataforma de alocação Nobel Capital',       url: 'https://alocacao.nobelcapital.com.br', icon: '🏆', bg: 'rgba(184,150,62,0.15)' },
    ],
  },
]

/* ─── Estilos ────────────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  border: '1px solid rgba(184,150,62,0.12)',
  boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
  overflow: 'hidden',
}

const cardHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px 12px',
  borderBottom: '1px solid rgba(184,150,62,0.09)',
  background: '#FDFAF5',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-lora, serif)',
  fontSize: 14,
  fontWeight: 500,
  color: '#1A1209',
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const [session, { noticias, atualizadoEm }] = await Promise.all([
    requireSession(),
    getNoticias(),
  ])
  const firstName = session.name.split(' ')[0]

  const now  = new Date()
  const hora = now.getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const dataFmt  = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const featured  = noticias[0] ?? null
  const secondary = noticias.slice(1, 6)

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.38)', marginBottom: 5, textTransform: 'capitalize' }}>{dataFmt}</p>
          <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 26, fontWeight: 500, color: '#1A1209' }}>
            {saudacao}, <span style={{ color: '#B8963E' }}>{firstName}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="http://hub.xpi.com.br" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid rgba(184,150,62,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#1A1209', textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            XP Hub
          </a>
          <a href="https://www.b3.com.br" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#1A1209', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#F6F3ED', textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            B3 Live
          </a>
          <a href="https://credenciamento.ancord.org.br/login.html#" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid rgba(184,150,62,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#1A1209', textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            ANCORD
          </a>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid-kpi">
        {KPI_DATA.map((kpi, i) => (
          <div key={kpi.label} style={{ ...card, position: 'relative' }}>
            {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #B8963E, #D4A96A)' }} />}
            <div style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{kpi.label}</p>
              <p style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 26, fontWeight: 600, color: '#1A1209', marginBottom: 6, lineHeight: 1 }}>{kpi.value}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: kpi.up ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: kpi.up ? '#16a34a' : '#dc2626' }}>
                {kpi.up ? '↑' : '↓'} {kpi.delta} <span style={{ fontWeight: 400, opacity: 0.75 }}>{kpi.sub}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Notícias ── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardHeader}>
          <span style={sectionTitle}>Notícias do Mercado</span>
          <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)' }}>
            Atualizado em {formatAtualizadoEm(atualizadoEm)}
          </span>
        </div>

        {/* Hero split: featured | list */}
        <div className="grid-news-hero">

          {/* Destaque */}
          {featured ? (
            <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(184,150,62,0.09)', background: 'rgba(184,150,62,0.018)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: featured.sourceColor, background: `${featured.sourceColor}15`, padding: '2px 8px', borderRadius: 3 }}>
                  {featured.source}
                </span>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(26,18,9,0.35)', background: 'rgba(26,18,9,0.05)', padding: '2px 8px', borderRadius: 3 }}>
                  {featured.category}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.3)', marginLeft: 'auto' }}>{timeAgo(featured.publishedAt)}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 18, fontWeight: 600, color: '#1A1209', lineHeight: 1.45, marginBottom: 12 }}>
                {featured.url ? (
                  <a href={featured.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                    {featured.headline}
                  </a>
                ) : featured.headline}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(26,18,9,0.5)', lineHeight: 1.7 }}>
                {featured.summary}
              </p>
            </div>
          ) : (
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(26,18,9,0.3)', fontSize: 13 }}>
              Notícias serão exibidas após a primeira atualização (6h30)
            </div>
          )}

          {/* Lista secundária */}
          <div>
            {secondary.map((n, i) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '13px 20px',
                  borderBottom: i < secondary.length - 1 ? '1px solid rgba(184,150,62,0.07)' : 'none',
                }}
              >
                <div style={{ width: 3, borderRadius: 2, background: n.sourceColor, flexShrink: 0, alignSelf: 'stretch', opacity: 0.7 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: n.sourceColor }}>{n.source}</span>
                    <span style={{ fontSize: 9, color: 'rgba(26,18,9,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{n.category}</span>
                    <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.3)', marginLeft: 'auto', flexShrink: 0 }}>{timeAgo(n.publishedAt)}</span>
                  </div>
                  {n.url ? (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1209', lineHeight: 1.4, marginBottom: 2 }}>{n.headline}</p>
                    </a>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1209', lineHeight: 1.4, marginBottom: 2 }}>{n.headline}</p>
                  )}
                  <p style={{ fontSize: 11, color: 'rgba(26,18,9,0.43)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.summary}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Links Úteis ── */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={sectionTitle}>Links Úteis</span>
          <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)' }}>Abre em nova aba</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {LINKS_UTEIS.map((group) => (
            <div key={group.group}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,18,9,0.3)', marginBottom: 10 }}>
                {group.group}
              </p>
              <div className="grid-links-row">
                {group.items.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'rgba(184,150,62,0.035)',
                      border: '1px solid rgba(184,150,62,0.1)',
                      borderRadius: 8,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: link.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {link.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1209', lineHeight: 1.3, marginBottom: 3 }}>{link.label}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(26,18,9,0.45)', lineHeight: 1.4 }}>{link.desc}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(26,18,9,0.2)" strokeWidth="1.5" width="11" height="11" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
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
