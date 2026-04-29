'use client'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type MetaProduto = {
  slug: string
  label: string
  meta: number
  realizado: number
  gap: number
  pctAtingido: number | null
  paceRealizado: number
  paceNecessario: number
  projecao: number
  pctMeta: number | null
}

type TotalMetas = {
  meta: number
  realizado: number
  projecao: number
  pctAtingido: number | null
  pctMeta: number | null
  gap: number
}

type MetasData =
  | { semMeta: true; mesISO: string }
  | {
      semMeta: false
      mesISO: string
      dias: { passados: number; restantes: number; total: number }
      produtos: MetaProduto[]
      total: TotalMetas
    }

type Props = { dados: MetasData | null; compact?: boolean }

/* ─── Formatação ─────────────────────────────────────────────────────────── */

function fBRL(val: number): string {
  const abs = Math.abs(val)
  const pre = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(val: number | null): string {
  if (val == null) return '—'
  return `${(val * 100).toFixed(1).replace('.', ',')}%`
}

function mesLabel(iso: string): string {
  const [year, month] = iso.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

/* ─── Semáforo ───────────────────────────────────────────────────────────── */

type Sinal = 'verde' | 'amarelo' | 'vermelho' | 'sem-meta'

function sinal(pctMeta: number | null, meta: number): Sinal {
  if (meta === 0 || pctMeta == null) return 'sem-meta'
  if (pctMeta >= 0.95) return 'verde'
  if (pctMeta >= 0.8) return 'amarelo'
  return 'vermelho'
}

const SINAL_COR: Record<Sinal, string> = {
  verde: 'var(--color-positive)',
  amarelo: '#d97706',
  vermelho: 'var(--color-negative)',
  'sem-meta': 'var(--fg-faint)',
}

const SINAL_BG: Record<Sinal, string> = {
  verde: 'transparent',
  amarelo: 'rgba(217,119,6,0.12)',
  vermelho: 'transparent',
  'sem-meta': 'var(--n-50)',
}

const SINAL_BORDER: Record<Sinal, string> = {
  verde: '1px solid var(--color-positive)',
  amarelo: '1px solid #d97706',
  vermelho: '1px solid var(--color-negative)',
  'sem-meta': '1px solid var(--fg-faint)',
}

const SINAL_LABEL: Record<Sinal, string> = {
  verde: '● On track',
  amarelo: '● Atenção',
  vermelho: '● Em risco',
  'sem-meta': '—',
}

/* ─── Estilos base ───────────────────────────────────────────────────────── */

const th: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--fg-faint)',
  fontFamily: 'var(--f-mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  padding: '8px 10px',
  textAlign: 'right',
  background: 'var(--bg-deep)',
  borderBottom: '1px solid var(--line)',
  whiteSpace: 'nowrap',
}
const thLeft: React.CSSProperties = { ...th, textAlign: 'left' }

const td: React.CSSProperties = {
  fontSize: 12,
  padding: '9px 10px',
  textAlign: 'right',
  fontFamily: 'var(--f-mono)',
  borderBottom: '1px solid var(--line)',
  color: 'var(--fg)',
}
const tdLeft: React.CSSProperties = { ...td, textAlign: 'left', fontFamily: 'inherit' }

/* ─── Componente ─────────────────────────────────────────────────────────── */

export function BlocoMetas({ dados, compact = false }: Props) {
  if (!dados) return null

  /* ── Sem meta configurada ── */
  if (dados.semMeta) {
    return (
      <div
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 8,
          marginBottom: 20,
          border: '1px solid var(--line)',
          boxShadow: '0 1px 4px var(--n-50)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 18,
          }}
        >
          🎯
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 3 }}>
            Metas — {mesLabel(dados.mesISO)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--fg-mute)' }}>
            Configure os valores em{' '}
            <code
              style={{
                fontSize: 11,
                background: 'var(--n-50)',
                padding: '1px 5px',
                borderRadius: 4,
              }}
            >
              server/src/data/metas.json
            </code>{' '}
            e faça o deploy para ativar os indicadores de pace.
          </p>
        </div>
      </div>
    )
  }

  const { dias, produtos, total } = dados

  /* ── Variante compacta (sidebar) ── */
  if (compact) {
    const pctDiasC = dias.total > 0 ? (dias.passados / dias.total) * 100 : 0
    const sinalTotalC = sinal(total.pctMeta, total.meta)
    return (
      <div
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 8,
          border: '1px solid var(--line)',
          boxShadow: '0 1px 4px var(--n-50)',
          overflow: 'hidden',
        }}
      >
        {/* Header compacto */}
        <div
          style={{
            padding: '14px 18px 12px',
            background: 'var(--bg-deep)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--f-text)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--fg)',
                letterSpacing: '-.01em',
              }}
            >
              Metas — {mesLabel(dados.mesISO)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
              {dias.passados}/{dias.total} dias úteis
            </span>
          </div>
          {/* Barra dias */}
          <div
            style={{
              height: 4,
              background: 'var(--n-100)',
              borderRadius: 2,
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pctDiasC}%`,
                background: 'var(--c-gold)',
                borderRadius: 2,
              }}
            />
          </div>
          {/* Total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p
                style={{
                  fontSize: 9,
                  color: 'var(--fg-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 2,
                }}
              >
                Total realizado
              </p>
              <p
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 20,
                  fontWeight: 500,
                  color: 'var(--fg)',
                  lineHeight: 1,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {fBRL(total.realizado)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  fontSize: 9,
                  color: 'var(--fg-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 2,
                }}
              >
                Meta
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-mute)', lineHeight: 1 }}>
                {fBRL(total.meta)}
              </p>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--r-pill)',
                background: SINAL_BG[sinalTotalC],
                color: SINAL_COR[sinalTotalC],
                border: SINAL_BORDER[sinalTotalC],
              }}
            >
              {fPct(total.pctAtingido)}
            </span>
          </div>
          {/* Barra receita */}
          <div
            style={{
              height: 5,
              background: 'var(--n-100)',
              borderRadius: 3,
              overflow: 'hidden',
              marginTop: 8,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${total.meta > 0 ? Math.min((total.realizado / total.meta) * 100, 100) : 0}%`,
                background: SINAL_COR[sinalTotalC],
                borderRadius: 3,
                opacity: 0.85,
              }}
            />
          </div>
        </div>

        {/* Lista de produtos */}
        <div style={{ padding: '6px 0' }}>
          {produtos
            .filter((p) => p.meta > 0)
            .map((p, i, arr) => {
              const s = sinal(p.pctMeta, p.meta)
              const cor = SINAL_COR[s]
              const pctBar = p.meta > 0 ? Math.min((p.realizado / p.meta) * 100, 100) : 0
              const isLast = i === arr.length - 1
              return (
                <div
                  key={p.slug}
                  style={{
                    padding: '10px 18px',
                    borderBottom: isLast ? 'none' : '1px solid var(--line)',
                  }}
                >
                  {/* Linha principal */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>
                      {p.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: cor }}>
                        {fPct(p.pctAtingido)}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 'var(--r-pill)',
                          background: SINAL_BG[s],
                          color: cor,
                          whiteSpace: 'nowrap',
                          border: SINAL_BORDER[s],
                        }}
                      >
                        {SINAL_LABEL[s]}
                      </span>
                    </div>
                  </div>
                  {/* Barra */}
                  <div
                    style={{
                      height: 4,
                      background: 'var(--n-100)',
                      borderRadius: 2,
                      overflow: 'hidden',
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pctBar}%`,
                        background: cor,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  {/* Sub-linha: realizado / meta | pace */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--fg-mute)' }}>
                      {fBRL(p.realizado)}{' '}
                      <span style={{ color: 'var(--fg-faint)' }}>
                        / {p.meta > 0 ? fBRL(p.meta) : '—'}
                      </span>
                    </span>
                    {p.realizado > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--fg-faint)' }}>
                        proj.{' '}
                        <span style={{ color: cor, fontWeight: 600 }}>{fBRL(p.projecao)}</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  // Barra de progresso de dias úteis
  const pctDias = dias.total > 0 ? (dias.passados / dias.total) * 100 : 0

  // Barra de progresso da receita total
  const pctRealTotal = total.meta > 0 ? Math.min((total.realizado / total.meta) * 100, 100) : 0
  const sinalTotal = sinal(total.pctMeta, total.meta)

  return (
    <div
      style={{
        background: 'var(--bg-elev)',
        borderRadius: 8,
        marginBottom: 20,
        border: '1px solid var(--line)',
        boxShadow: '0 1px 4px var(--n-50)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-deep)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-text)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          >
            Metas — {mesLabel(dados.mesISO)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
            {dias.passados} dias úteis passados · {dias.restantes} restantes · {dias.total} total
          </span>
        </div>

        {/* Barra de progresso dos dias */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              flex: 1,
              height: 5,
              background: 'var(--n-100)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pctDias}%`,
                background: 'var(--c-gold)',
                borderRadius: 3,
                transition: 'width 0.4s',
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: 'var(--fg-faint)', whiteSpace: 'nowrap' }}>
            {pctDias.toFixed(0)}% do mês
          </span>
        </div>

        {/* Consolidado total */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
          <div>
            <p
              style={{
                fontSize: 9,
                color: 'var(--fg-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 3,
              }}
            >
              Realizado total
            </p>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--fg)',
                lineHeight: 1,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fBRL(total.realizado)}
            </p>
          </div>
          <div style={{ fontSize: 18, color: 'var(--line-strong)' }}>/</div>
          <div>
            <p
              style={{
                fontSize: 9,
                color: 'var(--fg-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 3,
              }}
            >
              Meta total
            </p>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--fg-mute)',
                lineHeight: 1,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {fBRL(total.meta)}
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ height: 6, background: 'var(--n-100)', borderRadius: 3, overflow: 'hidden' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pctRealTotal}%`,
                  background: SINAL_COR[sinalTotal],
                  borderRadius: 3,
                  opacity: 0.85,
                }}
              />
            </div>
            <p
              style={{ fontSize: 10, color: SINAL_COR[sinalTotal], marginTop: 4, fontWeight: 600 }}
            >
              {fPct(total.pctAtingido)} atingido · projeção {fPct(total.pctMeta)} da meta
            </p>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 'var(--r-pill)',
              background: SINAL_BG[sinalTotal],
              color: SINAL_COR[sinalTotal],
              border: SINAL_BORDER[sinalTotal],
            }}
          >
            {SINAL_LABEL[sinalTotal]}
          </span>
        </div>
      </div>

      {/* ── Tabela por produto ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thLeft}>Produto</th>
              <th style={th}>Realizado</th>
              <th style={th}>Meta</th>
              <th style={th}>% Ating.</th>
              <th style={th}>Gap</th>
              <th style={th}>Pace Real.</th>
              <th style={th}>Pace Nec.</th>
              <th style={th}>Projeção</th>
              <th style={{ ...th, textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p, i) => {
              const s = sinal(p.pctMeta, p.meta)
              const cor = SINAL_COR[s]
              const isLast = i === produtos.length - 1
              const pctBar = p.meta > 0 ? Math.min((p.realizado / p.meta) * 100, 100) : 0
              return (
                <tr key={p.slug}>
                  {/* Produto */}
                  <td style={{ ...tdLeft, borderBottom: isLast ? 'none' : td.borderBottom }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontWeight: 500 }}>{p.label}</span>
                      <div
                        style={{
                          height: 3,
                          background: 'var(--n-100)',
                          borderRadius: 2,
                          width: 100,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pctBar}%`,
                            background: cor,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Realizado */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      fontWeight: 600,
                    }}
                  >
                    {fBRL(p.realizado)}
                  </td>
                  {/* Meta */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      color: 'var(--fg-mute)',
                    }}
                  >
                    {p.meta > 0 ? fBRL(p.meta) : '—'}
                  </td>
                  {/* % Atingido */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      fontWeight: 600,
                      color: cor,
                    }}
                  >
                    {fPct(p.pctAtingido)}
                  </td>
                  {/* Gap */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      color: p.gap <= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                      fontWeight: 500,
                    }}
                  >
                    {p.meta > 0 ? (p.gap <= 0 ? `+${fBRL(Math.abs(p.gap))}` : fBRL(p.gap)) : '—'}
                  </td>
                  {/* Pace Realizado */}
                  <td style={{ ...td, borderBottom: isLast ? 'none' : td.borderBottom }}>
                    {p.realizado > 0 ? fBRL(p.paceRealizado) : '—'}
                  </td>
                  {/* Pace Necessário */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      color:
                        p.paceNecessario > p.paceRealizado ? 'var(--color-negative)' : 'var(--fg)',
                    }}
                  >
                    {p.meta > 0 ? fBRL(p.paceNecessario) : '—'}
                  </td>
                  {/* Projeção */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      color: cor,
                      fontWeight: 600,
                    }}
                  >
                    {p.realizado > 0 ? fBRL(p.projecao) : '—'}
                  </td>
                  {/* Status */}
                  <td
                    style={{
                      ...td,
                      borderBottom: isLast ? 'none' : td.borderBottom,
                      textAlign: 'center',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--r-pill)',
                        whiteSpace: 'nowrap',
                        background: SINAL_BG[s],
                        color: cor,
                        border: SINAL_BORDER[s],
                      }}
                    >
                      {SINAL_LABEL[s]}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {/* Rodapé totais */}
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--line-strong)', background: 'var(--bg-deep)' }}>
              <td style={{ ...tdLeft, fontWeight: 700, fontSize: 12, borderBottom: 'none' }}>
                Total
              </td>
              <td style={{ ...td, fontWeight: 700, fontSize: 12, borderBottom: 'none' }}>
                {fBRL(total.realizado)}
              </td>
              <td style={{ ...td, color: 'var(--fg-mute)', fontSize: 12, borderBottom: 'none' }}>
                {fBRL(total.meta)}
              </td>
              <td
                style={{
                  ...td,
                  fontWeight: 700,
                  fontSize: 12,
                  color: SINAL_COR[sinalTotal],
                  borderBottom: 'none',
                }}
              >
                {fPct(total.pctAtingido)}
              </td>
              <td
                style={{
                  ...td,
                  fontWeight: 700,
                  fontSize: 12,
                  borderBottom: 'none',
                  color: total.gap <= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                }}
              >
                {total.meta > 0
                  ? total.gap <= 0
                    ? `+${fBRL(Math.abs(total.gap))}`
                    : fBRL(total.gap)
                  : '—'}
              </td>
              <td style={{ ...td, fontSize: 12, borderBottom: 'none' }}>—</td>
              <td style={{ ...td, fontSize: 12, borderBottom: 'none' }}>—</td>
              <td
                style={{
                  ...td,
                  fontWeight: 700,
                  fontSize: 12,
                  color: SINAL_COR[sinalTotal],
                  borderBottom: 'none',
                }}
              >
                {fBRL(total.projecao)}
              </td>
              <td
                style={{ ...td, textAlign: 'center', borderBottom: 'none', fontFamily: 'inherit' }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-pill)',
                    background: SINAL_BG[sinalTotal],
                    color: SINAL_COR[sinalTotal],
                    border: SINAL_BORDER[sinalTotal],
                  }}
                >
                  {SINAL_LABEL[sinalTotal]}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
