import { PageGreeting } from '../_components/PageGreeting'
import { apiFetch } from '@/lib/api/fetch'
import { requireSession } from '@/lib/auth/session'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type Maturity = { janela: string; total: number; itens: { tipo: string; total: number }[] }

type VisaoPayload = {
  totais: { rf: number; rv: number; coe: number; liquidez: number; total: number }
  rf: {
    porIndexador: { indexador: string; total: number; posicoes: number; clientes: number }[]
    maturities: Maturity[]
    marcacao: { flag_marcacao: string; total: number; posicoes: number }[]
  }
  rv: {
    setorial: { setor: string; produto: string; total: number; clientes: number }[]
    topAtivos: {
      ativo: string
      setor: string
      produto: string
      total: number
      clientes: number
      variacao: number
    }[]
  }
  coe: {
    porTipo: {
      tipo: string
      posicoes: number
      total_atual: number
      total_compra: number
      total_cupom: number
      clientes: number
      pl: number
    }[]
  }
  liquidez: {
    porIndexador: { indexador: string; total: number; posicoes: number; clientes: number }[]
  }
}

/* ─── Paleta ─────────────────────────────────────────────────────────────── */

const MACRO_COLOR: Record<string, string> = {
  rf: '#2D5FA0',
  rv: '#F59E0B',
  coe: '#EF4444',
  liquidez: '#10B981',
}

const IDX_COLOR: Record<string, string> = {
  '% CDI': '#06B6D4',
  IPCA: '#F59E0B',
  PRE: '#EF4444',
  'CDI +': '#2D5FA0',
  LFT: '#10B981',
  Selic: '#8B5CF6',
  IGPM: '#F97316',
}

const TIPO_COLOR: Record<string, string> = {
  'Emissão Bancária': '#2D5FA0',
  'Credito Privado': '#F59E0B',
  'Título Público': '#10B981',
  'Tesouro Direto': '#06B6D4',
  'Letras Financeiras': '#8B5CF6',
  'Letra Imobiliária Garantida': '#EC4899',
}

const SETOR_COLOR: Record<string, string> = {
  'Fundo Imobiliário': '#06B6D4',
  Financeiro: '#2D5FA0',
  'Energia elétrica & Saneamento': '#10B981',
  Imobiliário: '#F97316',
  'Mineração & Siderurgia': '#94A3B8',
  'Petróleo & Gas': '#EF4444',
  'Transportes & Bens Industriais': '#8B5CF6',
  Varejo: '#F59E0B',
  Tecnologia: '#06B6D4',
  'Papel & Celulose': '#84CC16',
  'Agro, Alimentos & Bebidas': '#A78BFA',
  Telecomunicação: '#EC4899',
  Shoppings: '#FB923C',
  Outros: '#64748B',
}

const COE_COLOR: Record<string, string> = {
  BOND: '#2D5FA0',
  PARTICIPACAO: '#10B981',
  CDS: '#F59E0B',
}

/* ─── Formatters ─────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${pre}${Math.round(abs / 1_000)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(v: number, digits = 1): string {
  return `${v.toFixed(digits).replace('.', ',')}%`
}

function fVar(v: number): string {
  const pct = v * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1).replace('.', ',')}%`
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */

async function getVisao(email: string, role: string, equipe?: string): Promise<VisaoPayload | null> {
  try {
    const res = await apiFetch(`/performance/carteiras/visao`, {
      cache: 'no-store',
      headers: {
        'X-User-Email': email,
        'X-User-Role': role,
        'X-User-Equipe': equipe ?? '',
      },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data: VisaoPayload }
    return json.data
  } catch {
    return null
  }
}

/* ─── Componentes visuais ────────────────────────────────────────────────── */

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 20px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg-deep)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--f-text)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--fg)',
          letterSpacing: '-.01em',
        }}
      >
        {title}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 9,
            color: 'var(--fg-faint)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}

function Donut({
  segments,
  size = 132,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return <div style={{ width: size, height: size }} />
  let cum = 0
  const stops = segments.map((seg) => {
    const pct = (seg.value / total) * 100
    const stop = `${seg.color} ${cum.toFixed(2)}% ${(cum + pct).toFixed(2)}%`
    cum += pct
    return stop
  })
  const hole = Math.round(size * 0.62)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${stops.join(', ')})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: hole,
          height: hole,
          borderRadius: '50%',
          background: 'var(--bg-elev)',
        }}
      />
    </div>
  )
}

function HBar({
  label,
  total,
  max,
  color,
  sub,
}: { label: string; total: number; max: number; color: string; sub?: string }) {
  const pct = max > 0 ? (total / max) * 100 : 0
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '150px 1fr 100px',
        alignItems: 'center',
        gap: 14,
        padding: '9px 20px',
      }}
    >
      <div>
        <span
          style={{ fontFamily: 'var(--f-text)', fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}
        >
          {label}
        </span>
        {sub && (
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--f-mono)',
              fontSize: 9,
              color: 'var(--fg-faint)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              marginTop: 1,
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div style={{ height: 7, background: 'var(--bg-deep)', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            opacity: 0.85,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--fg)',
          textAlign: 'right',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {fBRL(total)}
      </span>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function CarteirasPage() {
  const session = await requireSession()
  const d = await getVisao(session.email, session.role, session.equipe)

  const totais = d?.totais ?? { rf: 0, rv: 0, coe: 0, liquidez: 0, total: 0 }
  const rfIdx = d?.rf.porIndexador ?? []
  const rfMat = d?.rf.maturities ?? []
  const rfMarc = d?.rf.marcacao ?? []
  const rvSet = d?.rv.setorial ?? []
  const rvTop = d?.rv.topAtivos ?? []
  const coeTypes = d?.coe.porTipo ?? []
  const ldIdx = d?.liquidez.porIndexador ?? []

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    overflow: 'hidden',
  }
  const mono10: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: 'var(--fg-faint)',
  }

  /* Wall-of-maturities: max total determines bar scale */
  const matMax = Math.max(...rfMat.map((m) => m.total), 1)
  /* Tipos distintos para legenda */
  const tipoSet = new Set(rfMat.flatMap((m) => m.itens.map((i) => i.tipo)))
  const tipos = Array.from(tipoSet)

  /* RV: agrupar por setor (soma de todos os produtos) */
  const setorMap: Record<string, { total: number; clientes: number }> = {}
  for (const r of rvSet) {
    setorMap[r.setor] = {
      total: (setorMap[r.setor]?.total ?? 0) + r.total,
      clientes: (setorMap[r.setor]?.clientes ?? 0) + r.clientes,
    }
  }
  const setorList = Object.entries(setorMap)
    .map(([setor, v]) => ({ setor, ...v }))
    .sort((a, b) => b.total - a.total)
  const setorMax = setorList[0]?.total ?? 1

  /* COE totals */
  const coeTotalCompra = coeTypes.reduce((s, t) => s + t.total_compra, 0)
  const coeTotalAtual = coeTypes.reduce((s, t) => s + t.total_atual, 0)
  const coeTotalCupom = coeTypes.reduce((s, t) => s + t.total_cupom, 0)
  const coeTotalPL = coeTypes.reduce((s, t) => s + t.pl, 0)

  /* Indexador max para LD */
  const ldMax = ldIdx[0]?.total ?? 1

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <PageGreeting name={session.name} label="Posição analítica" />


      {/* ── 4 KPI Cards ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--s-3)',
          marginBottom: 'var(--s-4)',
        }}
      >
        {(
          [
            { key: 'rf', label: 'Renda Fixa', sub: 'analitico_rf', accent: MACRO_COLOR.rf },
            { key: 'rv', label: 'Renda Variável', sub: 'ações + fiis', accent: MACRO_COLOR.rv },
            { key: 'coe', label: 'COE', sub: 'posicao_coe', accent: MACRO_COLOR.coe },
            {
              key: 'liquidez',
              label: 'Liquidez Diária',
              sub: 'custodia_ld',
              accent: MACRO_COLOR.liquidez,
            },
          ] as const
        ).map(({ key, label, sub, accent }) => (
          <div
            key={key}
            style={{ ...cardStyle, boxShadow: 'var(--e-float)', position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: accent,
              }}
            />
            <div style={{ padding: '18px 20px' }}>
              <p style={mono10}>{label}</p>
              <p
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 28,
                  fontWeight: 500,
                  color: 'var(--fg)',
                  letterSpacing: '-.01em',
                  lineHeight: 1,
                  margin: '10px 0 10px',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {fBRL(totais[key])}
              </p>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 11,
                  color: accent,
                  fontWeight: 600,
                }}
              >
                {totais.total > 0 ? fPct((totais[key] / totais.total) * 100) : '—'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  color: 'var(--fg-faint)',
                  marginLeft: 6,
                }}
              >
                {sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row: Macro Donut + RF Marcação ─────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--s-4)',
          marginBottom: 'var(--s-4)',
        }}
      >
        {/* Macro Allocation */}
        <div style={{ ...cardStyle, boxShadow: 'var(--e-float)' }}>
          <SectionHeader title="Alocação por Classe" sub={fBRL(totais.total)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 24px' }}>
            <Donut
              size={140}
              segments={[
                { label: 'Renda Fixa', value: totais.rf, color: MACRO_COLOR.rf ?? '#2D5FA0' },
                { label: 'Renda Variável', value: totais.rv, color: MACRO_COLOR.rv ?? '#F59E0B' },
                { label: 'COE', value: totais.coe, color: MACRO_COLOR.coe ?? '#EF4444' },
                {
                  label: 'Liquidez Diária',
                  value: totais.liquidez,
                  color: MACRO_COLOR.liquidez ?? '#10B981',
                },
              ]}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Renda Fixa', value: totais.rf, color: MACRO_COLOR.rf },
                { label: 'Renda Variável', value: totais.rv, color: MACRO_COLOR.rv },
                { label: 'COE', value: totais.coe, color: MACRO_COLOR.coe },
                { label: 'Liquidez Diária', value: totais.liquidez, color: MACRO_COLOR.liquidez },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--f-text)',
                      fontSize: 12,
                      color: 'var(--fg)',
                      flex: 1,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 12,
                      fontWeight: 600,
                      color,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {totais.total > 0 ? fPct((value / totais.total) * 100) : '—'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      color: 'var(--fg-faint)',
                      width: 72,
                      textAlign: 'right',
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {fBRL(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RF Marcação */}
        <div style={{ ...cardStyle, boxShadow: 'var(--e-float)' }}>
          <SectionHeader title="RF — Marcação a Mercado vs Curva" />
          {rfMarc.length > 0 ? (
            (() => {
              const marcTotal = rfMarc.reduce((s, m) => s + m.total, 0)
              const mercado = rfMarc.find((m) => m.flag_marcacao === 'Mercado')
              const curva = rfMarc.find((m) => m.flag_marcacao === 'Curva')
              return (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 24px' }}
                >
                  <Donut
                    size={140}
                    segments={[
                      { label: 'Mercado', value: mercado?.total ?? 0, color: '#6366F1' },
                      { label: 'Curva', value: curva?.total ?? 0, color: '#94A3B8' },
                    ]}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      {
                        label: 'Marcado a Mercado',
                        data: mercado,
                        color: '#6366F1',
                        desc: 'P&L visível, sofre MTM',
                      },
                      {
                        label: 'Marcado na Curva',
                        data: curva,
                        color: '#94A3B8',
                        desc: 'Travado até vencimento',
                      },
                    ].map(({ label, data, color, desc }) => (
                      <div key={label}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: color,
                              flexShrink: 0,
                              marginBottom: 1,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: 'var(--f-text)',
                              fontSize: 12,
                              color: 'var(--fg)',
                              fontWeight: 500,
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--f-mono)',
                              fontSize: 14,
                              fontWeight: 700,
                              color,
                              marginLeft: 'auto',
                              fontFeatureSettings: '"tnum"',
                            }}
                          >
                            {marcTotal > 0 ? fPct(((data?.total ?? 0) / marcTotal) * 100) : '—'}
                          </span>
                        </div>
                        <div style={{ paddingLeft: 16 }}>
                          <p
                            style={{
                              fontFamily: 'var(--f-mono)',
                              fontSize: 12,
                              color: 'var(--fg)',
                              fontWeight: 500,
                              fontFeatureSettings: '"tnum"',
                            }}
                          >
                            {fBRL(data?.total ?? 0)}
                          </p>
                          <p
                            style={{
                              fontFamily: 'var(--f-mono)',
                              fontSize: 9,
                              color: 'var(--fg-faint)',
                              letterSpacing: '.18em',
                              textTransform: 'uppercase',
                              marginTop: 2,
                            }}
                          >
                            {data?.posicoes.toLocaleString('pt-BR') ?? '0'} posições · {desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()
          ) : (
            <div style={{ padding: 24, color: 'var(--fg-faint)', fontSize: 13 }}>Sem dados</div>
          )}
        </div>
      </div>

      {/* ── RF: Indexadores ────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 'var(--s-4)' }}>
        <SectionHeader
          title="Renda Fixa — Exposição por Indexador"
          sub={`${rfIdx.length} indexadores`}
        />
        <div style={{ padding: '8px 0' }}>
          {rfIdx
            .filter((r) => r.indexador)
            .map((r, i) => (
              <div
                key={r.indexador}
                style={{ borderBottom: i < rfIdx.length - 1 ? '1px solid var(--line)' : 'none' }}
              >
                <HBar
                  label={r.indexador}
                  sub={`${r.posicoes.toLocaleString('pt-BR')} posições · ${r.clientes.toLocaleString('pt-BR')} clientes`}
                  total={r.total}
                  max={rfIdx[0]?.total ?? 1}
                  color={IDX_COLOR[r.indexador] ?? '#94A3B8'}
                />
              </div>
            ))}
        </div>
      </div>

      {/* ── RF: Wall of Maturities ─────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 'var(--s-4)' }}>
        <SectionHeader title="Renda Fixa — Vencimentos por Janela" sub="wall of maturities" />
        <div style={{ padding: '16px 20px 8px' }}>
          {rfMat.map((m) => {
            const barPct = matMax > 0 ? (m.total / matMax) * 100 : 0
            return (
              <div
                key={m.janela}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 96px',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--fg)',
                  }}
                >
                  {m.janela}
                </span>
                <div
                  style={{
                    height: 22,
                    background: 'var(--bg-deep)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', height: '100%', width: `${barPct}%` }}>
                    {m.itens.map((item) => (
                      <div
                        key={item.tipo}
                        title={`${item.tipo}: ${fBRL(item.total)}`}
                        style={{
                          flex: item.total,
                          background: TIPO_COLOR[item.tipo] ?? '#94A3B8',
                          height: '100%',
                          opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--fg)',
                    textAlign: 'right',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {fBRL(m.total)}
                </span>
              </div>
            )
          })}
        </div>
        {/* Legenda */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 20px',
            padding: '12px 20px',
            borderTop: '1px solid var(--line)',
            background: 'var(--bg-deep)',
          }}
        >
          {tipos.map((tipo) => (
            <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: TIPO_COLOR[tipo] ?? '#94A3B8',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 9,
                  color: 'var(--fg-faint)',
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                }}
              >
                {tipo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RV: Setorial + Top Ativos ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: 'var(--s-4)',
          marginBottom: 'var(--s-4)',
        }}
      >
        {/* Setorial */}
        <div style={cardStyle}>
          <SectionHeader title="Renda Variável — Setorial" sub={`${fBRL(totais.rv)}`} />
          <div style={{ padding: '8px 0' }}>
            {setorList.map((s, i) => (
              <div
                key={s.setor}
                style={{
                  borderBottom: i < setorList.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <HBar
                  label={s.setor}
                  sub={`${s.clientes.toLocaleString('pt-BR')} clientes`}
                  total={s.total}
                  max={setorMax}
                  color={SETOR_COLOR[s.setor] ?? '#64748B'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Top Ativos */}
        <div style={cardStyle}>
          <SectionHeader title="Renda Variável — Top Ativos" sub="retorno vs custo médio" />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-deep)' }}>
                {['Ativo', 'Setor', 'AUC', 'Clientes', 'P&L Médio'].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      fontWeight: 500,
                      color: 'var(--fg-faint)',
                      letterSpacing: '.18em',
                      textTransform: 'uppercase',
                      padding: '8px 16px',
                      textAlign: h === 'Ativo' || h === 'Setor' ? 'left' : 'right',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rvTop.map((a, i) => {
                const up = a.variacao >= 0
                return (
                  <tr
                    key={a.ativo}
                    style={{
                      borderBottom: i < rvTop.length - 1 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    <td style={{ padding: '9px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--fg)',
                        }}
                      >
                        {a.ativo}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontFamily: 'var(--f-mono)',
                          fontSize: 9,
                          color: 'var(--fg-faint)',
                          textTransform: 'uppercase',
                          letterSpacing: '.18em',
                        }}
                      >
                        {a.produto}
                      </span>
                    </td>
                    <td style={{ padding: '9px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--f-text)',
                          fontSize: 11,
                          color: 'var(--fg-mute)',
                        }}
                      >
                        {a.setor}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '9px 16px',
                        textAlign: 'right',
                        fontFamily: 'var(--f-mono)',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--fg)',
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {fBRL(a.total)}
                    </td>
                    <td
                      style={{
                        padding: '9px 16px',
                        textAlign: 'right',
                        fontFamily: 'var(--f-mono)',
                        fontSize: 11,
                        color: 'var(--fg-faint)',
                      }}
                    >
                      {a.clientes.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontFamily: 'var(--f-mono)',
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: '.08em',
                          fontFeatureSettings: '"tnum"',
                          color: up ? 'var(--color-positive)' : 'var(--color-negative)',
                          background: up ? 'var(--color-positive-bg)' : 'var(--color-negative-bg)',
                          border: '1px solid transparent',
                          padding: '2px 7px',
                          borderRadius: 999,
                        }}
                      >
                        {fVar(a.variacao)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── COE ────────────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 'var(--s-4)' }}>
        <SectionHeader
          title="COE — Posição & Performance"
          sub={`${coeTypes.reduce((s, t) => s + t.posicoes, 0).toLocaleString('pt-BR')} posições`}
        />

        {/* Summary strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          {[
            { label: 'Valor Investido', value: coeTotalCompra, color: 'var(--fg-mute)' },
            { label: 'Posição Atual', value: coeTotalAtual, color: 'var(--fg)' },
            { label: 'Cupom Recebido', value: coeTotalCupom, color: 'var(--color-positive)' },
            {
              label: 'P&L Total',
              value: coeTotalPL,
              color: coeTotalPL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '16px 20px', borderRight: '1px solid var(--line)' }}>
              <p style={mono10}>{label}</p>
              <p
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 20,
                  fontWeight: 700,
                  color,
                  marginTop: 8,
                  letterSpacing: '-.01em',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {fBRL(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Por tipo */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${coeTypes.length}, 1fr)` }}>
          {coeTypes.map((t, i) => {
            const color = COE_COLOR[t.tipo] ?? '#94A3B8'
            const plUp = t.pl >= 0
            return (
              <div
                key={t.tipo}
                style={{
                  padding: '16px 20px',
                  borderRight: i < coeTypes.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--fg)',
                      letterSpacing: '.18em',
                    }}
                  >
                    {t.tipo}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Investido', v: fBRL(t.total_compra), color: 'var(--fg-mute)' },
                    { label: 'Atual', v: fBRL(t.total_atual), color: 'var(--fg)' },
                    { label: 'Cupom', v: fBRL(t.total_cupom), color: 'var(--color-positive)' },
                    {
                      label: 'P&L',
                      v: fBRL(t.pl),
                      color: plUp ? 'var(--color-positive)' : 'var(--color-negative)',
                    },
                  ].map(({ label, v, color: c }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 9,
                          color: 'var(--fg-faint)',
                          textTransform: 'uppercase',
                          letterSpacing: '.18em',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: c,
                          fontFeatureSettings: '"tnum"',
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 9,
                      color: 'var(--fg-faint)',
                      textTransform: 'uppercase',
                      letterSpacing: '.18em',
                    }}
                  >
                    {t.posicoes.toLocaleString('pt-BR')} pos · {t.clientes.toLocaleString('pt-BR')}{' '}
                    clientes
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Liquidez Diária ────────────────────────────────────────────── */}
      <div style={cardStyle}>
        <SectionHeader title="Liquidez Diária — por Indexador" sub={fBRL(totais.liquidez)} />
        <div style={{ padding: '8px 0' }}>
          {ldIdx.map((r, i) => (
            <div
              key={r.indexador}
              style={{ borderBottom: i < ldIdx.length - 1 ? '1px solid var(--line)' : 'none' }}
            >
              <HBar
                label={r.indexador}
                sub={`${r.posicoes.toLocaleString('pt-BR')} posições · ${r.clientes.toLocaleString('pt-BR')} clientes`}
                total={r.total}
                max={ldMax}
                color={IDX_COLOR[r.indexador] ?? '#10B981'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
