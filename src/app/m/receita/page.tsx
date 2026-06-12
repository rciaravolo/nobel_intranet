'use client'
import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ScreenHeader } from '../_components/ScreenHeader'
import { fmtBR, fmtCur } from '../_lib/format'
import { useOnepageData } from '../onepage/_hooks/useOnepageData'

const SANS = 'var(--font-sans, "Garet", "Helvetica Neue", sans-serif)'
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)'

const T = {
  bg: '#000',
  card: '#141820',
  cardDeep: '#0e1117',
  border: 'rgba(255,255,255,0.07)',
  text: '#eceef4',
  muted: '#6b7588',
  success: '#248A47',
  danger: '#D94141',
}

const PRODUTO_SLUG: Record<string, string> = {
  'Renda Variável':  'rv',
  'Renda Fixa':      'rf',
  COE:               'coe',
  Câmbio:            'cambio',
  'Fee Fixo':        'feefixo',
  Seguros:           'seguros',
  Consórcio:         'consorcio',
  Dominion:          'dominion',
  'Oferta de Fundos':'oferta_fundos',
  Fundos:            'fundos',
  Previdência:       'previdencia',
  Precatórios:       'precas',
}

type ClienteReceita = { id_cliente: number | string; nome_cliente: string | null; valor: number }
type DeepDive = { produto: string; label: string; clientes: ClienteReceita[] }

export default function ReceitaPage() {
  const router = useRouter()
  const data = useOnepageData({ name: '—', role: 'assessor', initials: '—' })

  const [aberto,  setAberto]  = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [cache,   setCache]   = useState<Record<string, DeepDive>>({})
  const [erro,    setErro]    = useState<string | null>(null)

  async function toggle(nome: string) {
    if (aberto === nome) { setAberto(null); return }
    setAberto(nome)
    if (cache[nome]) return

    const slug = PRODUTO_SLUG[nome]
    if (!slug) return

    setLoading(nome)
    setErro(null)
    try {
      const res = await fetch(`/api/performance/deepdive/receita/${slug}`)
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { data: DeepDive }
      setCache((prev) => ({ ...prev, [nome]: json.data }))
    } catch {
      setErro(nome)
    } finally {
      setLoading(null)
    }
  }

  const total = data.receita.mes
  const delta = data.receita.deltaMes

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
      <ScreenHeader title="Receita" eyebrow="POR PRODUTO · MÊS" onBack={() => router.back()} />

      {/* ── Total ── */}
      <div style={{ padding: '24px 20px 28px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 8,
          }}
        >
          Total no mês
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 52,
            fontWeight: 500,
            lineHeight: 1,
            color: T.text,
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
          }}
        >
          {fmtCur(total)}
        </div>
        {delta !== 0 && (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              color: delta >= 0 ? T.success : T.danger,
              marginTop: 8,
            }}
          >
            {delta >= 0 ? '+' : '−'}
            {fmtBR(Math.abs(delta * 100), 1)}% vs mês anterior
          </div>
        )}
      </div>

      {/* ── Lista ── */}
      <section style={{ padding: '0 16px' }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 10,
          }}
        >
          DETALHAMENTO
        </div>

        <div
          style={{
            overflow: 'hidden',
            borderRadius: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
          }}
        >
          {data.produtos.map((p, i) => {
            const isOpen    = aberto  === p.nome
            const isLoading = loading === p.nome
            const hasErro   = erro    === p.nome
            const deepdive  = cache[p.nome]
            const isLast    = i === data.produtos.length - 1
            const color     = p.color

            return (
              <div key={p.nome}>
                {/* ── Linha ── */}
                <button
                  type="button"
                  onClick={() => toggle(p.nome)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    padding: '13px 14px',
                    background: isOpen ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${isOpen ? color : 'transparent'}`,
                    borderBottom: !isLast && !isOpen ? `1px solid rgba(255,255,255,0.05)` : 'none',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      flexShrink: 0,
                      background: color,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 14,
                        fontWeight: 600,
                        color: T.text,
                      }}
                    >
                      {p.nome}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        height: 3,
                        background: 'rgba(255,255,255,0.07)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${p.pct}%`,
                          height: '100%',
                          background: color,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ minWidth: 68, textAlign: 'right', flexShrink: 0 }}>
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
                      {fmtCur(p.valor)}
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        color: T.muted,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {fmtBR(p.pct, 1)}%
                    </div>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                    }}
                  >
                    {isLoading ? (
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: `1.5px solid ${color}`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'spin 0.6s linear infinite',
                        }}
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        color={isOpen ? color : T.muted}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform .2s ease',
                        }}
                      />
                    )}
                  </div>
                </button>

                {/* ── Drill-down ── */}
                {isOpen && (
                  <div
                    style={{
                      background: T.cardDeep,
                      borderLeft: `3px solid ${color}`,
                      borderTop: `1px solid rgba(255,255,255,0.06)`,
                      borderBottom: !isLast ? `1px solid rgba(255,255,255,0.05)` : 'none',
                      padding: '14px 14px 16px 17px',
                    }}
                  >
                    {isLoading && (
                      <p
                        style={{
                          fontSize: 12,
                          color: T.muted,
                          textAlign: 'center',
                          padding: '8px 0',
                          fontFamily: SANS,
                        }}
                      >
                        Carregando…
                      </p>
                    )}
                    {hasErro && (
                      <p style={{ fontSize: 12, color: T.danger, fontFamily: SANS }}>
                        Erro ao carregar. Tente novamente.
                      </p>
                    )}
                    {deepdive && (
                      <>
                        <div
                          style={{
                            fontFamily: MONO,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color,
                            marginBottom: 12,
                          }}
                        >
                          Top clientes — {deepdive.label}
                        </div>

                        {deepdive.clientes.map((cli, idx) => {
                          const totalProd = deepdive.clientes.reduce((s, c) => s + c.valor, 0)
                          const pctCli = totalProd > 0 ? (cli.valor / totalProd) * 100 : 0
                          return (
                            <div
                              key={cli.id_cliente}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '9px 0',
                                borderTop:
                                  idx > 0 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: MONO,
                                  fontSize: 10,
                                  color: T.muted,
                                  width: 18,
                                  flexShrink: 0,
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {String(idx + 1).padStart(2, '0')}
                              </span>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: T.text,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {cli.nome_cliente ?? String(cli.id_cliente)}
                                </div>
                                <div
                                  style={{
                                    marginTop: 4,
                                    height: 2,
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${pctCli}%`,
                                      height: '100%',
                                      background: color,
                                      borderRadius: 2,
                                      opacity: 0.7,
                                    }}
                                  />
                                </div>
                              </div>

                              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                <div
                                  style={{
                                    fontFamily: MONO,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color,
                                    fontVariantNumeric: 'tabular-nums',
                                    fontFeatureSettings: '"tnum"',
                                  }}
                                >
                                  {fmtCur(cli.valor)}
                                </div>
                                <div
                                  style={{
                                    fontFamily: MONO,
                                    fontSize: 10,
                                    color: T.muted,
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {fmtBR(pctCli, 1)}%
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  )
}
