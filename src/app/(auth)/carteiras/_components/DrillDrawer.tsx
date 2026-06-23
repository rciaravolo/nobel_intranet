'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type DrillCliente = {
  id_cliente: number
  nome_cliente: string | null
  total: number
  nome_assessor?: string | null
  // RF
  data_vencimento?: string | null
  sub_produto?: string
  // RV
  setor?: string | null
  produto?: string | null
  variacao?: number | null
}

type DrillData = {
  ativo: string
  emissor?: string | null
  total: number
  posicoes: number
  clientes_count: number
  clientes: DrillCliente[]
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

function fData(s: string | null | undefined): string {
  if (!s) return '—'
  const parts = s.split('-')
  const y = parts[0] ?? ''
  const m = parts[1] ?? '1'
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${meses[parseInt(m, 10) - 1] ?? ''}/${y}`
}

function fVar(v: number | null | undefined): string {
  if (v == null) return '—'
  const pct = v * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1).replace('.', ',')}%`
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  ativo: string | null
  classe?: 'rf' | 'rv'
  onClose: () => void
}

const ACCENT: Record<'rf' | 'rv', string> = {
  rf: '#2D5FA0',
  rv: '#C29404',
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function DrillDrawer({ ativo, classe = 'rf', onClose }: Props) {
  const [data, setData] = useState<DrillData | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!ativo) {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setErro(false)
    setData(null)

    const endpoint =
      classe === 'rv'
        ? `/api/performance/carteiras/drill/rv?ativo=${encodeURIComponent(ativo)}`
        : `/api/performance/carteiras/drill?ativo=${encodeURIComponent(ativo)}`

    fetch(endpoint)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<{ data: DrillData }>
      })
      .then((json) => {
        if (!cancelled) setData(json.data)
      })
      .catch(() => {
        if (!cancelled) setErro(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ativo, classe])

  async function handleExport() {
    if (!ativo || downloading) return
    setDownloading(true)
    try {
      const tipo = classe === 'rv' ? 'rv' : 'rf'
      const res  = await fetch(
        `/api/performance/carteiras/drill/export?ativo=${encodeURIComponent(ativo)}&tipo=${tipo}`,
      )
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { data: { ativo: string; tipo: string; clientes: Record<string, unknown>[] } }
      const clientes = json.data.clientes

      const rows = clientes.map((cl) => {
        if (tipo === 'rv') {
          return {
            ID:         cl.id_cliente,
            Nome:       cl.nome_cliente ?? '',
            Assessor:   cl.nome_assessor ?? '',
            Equipe:     cl.equipe ?? '',
            Produto:    cl.produto ?? '',
            Setor:      cl.setor ?? '',
            'Volume (R$)': cl.total,
            'Variação (%)': cl.variacao ?? '',
          }
        }
        return {
          ID:              cl.id_cliente,
          Nome:            cl.nome_cliente ?? '',
          Assessor:        cl.nome_assessor ?? '',
          Equipe:          cl.equipe ?? '',
          'Sub Produto':   cl.sub_produto ?? '',
          Vencimento:      cl.data_vencimento ?? '',
          'Volume (R$)':   cl.total,
        }
      })

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, ativo.replace(/[\\/:*?[\]]/g, '_').slice(0, 31))

      const date = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `${ativo}_${date}.xlsx`)
    } catch {
      // silently fail
    } finally {
      setDownloading(false)
    }
  }

  if (!ativo) return null

  const accent = ACCENT[classe]

  const mono10: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 9,
    letterSpacing: '.18em',
    textTransform: 'uppercase' as const,
    color: 'var(--fg-faint)',
  }

  const isRV = classe === 'rv'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.18)',
          zIndex: 40,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 580,
          height: '100dvh',
          background: 'var(--bg-elev)',
          borderLeft: '1px solid var(--line)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          animation: 'slideInRight 200ms ease-out',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-deep)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 6,
              height: 24,
              borderRadius: 3,
              background: accent,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--fg)',
                letterSpacing: '-.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ativo}
            </p>
            <p style={{ ...mono10, marginTop: 2 }}>
              {isRV ? 'RV' : 'RF'} — detalhamento por cliente
            </p>
          </div>
          {/* Classe badge */}
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: accent,
              background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
              borderRadius: 4,
              padding: '3px 7px',
              flexShrink: 0,
            }}
          >
            {classe.toUpperCase()}
          </span>
          {/* Download Excel */}
          <button
            type="button"
            onClick={handleExport}
            disabled={downloading}
            title="Baixar Excel com todos os clientes"
            style={{
              height: 30,
              paddingInline: 10,
              borderRadius: 6,
              border: '1px solid var(--line)',
              background: downloading ? 'var(--bg-deep)' : 'transparent',
              cursor: downloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: downloading ? 'var(--fg-faint)' : 'var(--fg-mute)',
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              letterSpacing: '.08em',
              flexShrink: 0,
              transition: 'background .15s, color .15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8M5 7l3 3 3-3"/>
              <path d="M3 12h10"/>
            </svg>
            {downloading ? 'Gerando...' : 'Excel'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: '1px solid var(--line)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fg-mute)',
              fontFamily: 'var(--f-mono)',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                color: 'var(--fg-faint)',
              }}
            >
              Carregando...
            </div>
          )}

          {erro && (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                color: 'var(--color-negative)',
              }}
            >
              Erro ao carregar dados.
            </div>
          )}

          {data && (
            <>
              {/* KPI strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                {[
                  { label: 'Volume Total', value: fBRL(data.total) },
                  { label: 'Posições', value: data.posicoes.toLocaleString('pt-BR') },
                  { label: 'Clientes', value: data.clientes_count.toLocaleString('pt-BR') },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: '14px 16px',
                      borderRight: '1px solid var(--line)',
                    }}
                  >
                    <p style={mono10}>{label}</p>
                    <p
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--fg)',
                        marginTop: 6,
                        letterSpacing: '-.01em',
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Emissor info (RF only) */}
              {!isRV && data.emissor && (
                <div
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--bg-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={mono10}>Emissor</span>
                  <span
                    style={{
                      fontFamily: 'var(--f-text)',
                      fontSize: 12,
                      color: 'var(--fg)',
                      fontWeight: 500,
                    }}
                  >
                    {data.emissor}
                  </span>
                </div>
              )}

              {/* Clients table */}
              <div>
                <div
                  style={{
                    padding: '10px 16px 8px',
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--bg-deep)',
                  }}
                >
                  <span style={mono10}>Top clientes · {data.clientes.length} exibidos</span>
                </div>

                {data.clientes.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      fontFamily: 'var(--f-mono)',
                      fontSize: 12,
                      color: 'var(--fg-faint)',
                    }}
                  >
                    Nenhum cliente encontrado.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-deep)' }}>
                        {['#', 'ID', 'Nome', 'Assessor', 'Volume', isRV ? 'Variação' : 'Vencimento'].map(
                          (h, i) => (
                            <th
                              key={h}
                              style={{
                                fontFamily: 'var(--f-mono)',
                                fontSize: 9,
                                fontWeight: 500,
                                color: 'var(--fg-faint)',
                                letterSpacing: '.18em',
                                textTransform: 'uppercase',
                                padding: '8px 14px',
                                textAlign: i < 4 ? 'left' : 'right',
                                borderBottom: '1px solid var(--line)',
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.clientes.map((cl, i) => {
                        const up = (cl.variacao ?? 0) >= 0
                        return (
                          <tr
                            key={`${cl.id_cliente}-${i}`}
                            style={{
                              borderBottom:
                                i < data.clientes.length - 1 ? '1px solid var(--line)' : 'none',
                            }}
                          >
                            <td
                              style={{
                                padding: '9px 14px',
                                fontFamily: 'var(--f-mono)',
                                fontSize: 10,
                                color: 'var(--fg-faint)',
                                width: 28,
                              }}
                            >
                              {i + 1}
                            </td>
                            <td style={{ padding: '9px 14px' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--f-mono)',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: accent,
                                  fontFeatureSettings: '"tnum"',
                                }}
                              >
                                {cl.id_cliente}
                              </span>
                            </td>
                            <td style={{ padding: '9px 14px', maxWidth: 160 }}>
                              <span
                                style={{
                                  fontFamily: 'var(--f-text)',
                                  fontSize: 12,
                                  color: 'var(--fg)',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cl.nome_cliente ?? '—'}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'var(--f-mono)',
                                  fontSize: 9,
                                  color: 'var(--fg-faint)',
                                  letterSpacing: '.12em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {isRV ? (cl.setor ?? cl.produto ?? '') : (cl.sub_produto ?? '')}
                              </span>
                            </td>
                            <td style={{ padding: '9px 14px', maxWidth: 130 }}>
                              <span
                                style={{
                                  fontFamily: 'var(--f-text)',
                                  fontSize: 11,
                                  color: 'var(--fg-mute)',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cl.nome_assessor ?? '—'}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: '9px 14px',
                                textAlign: 'right',
                                fontFamily: 'var(--f-mono)',
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'var(--fg)',
                                fontFeatureSettings: '"tnum"',
                              }}
                            >
                              {fBRL(cl.total)}
                            </td>
                            <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                              {isRV ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontFamily: 'var(--f-mono)',
                                    fontSize: 10,
                                    fontWeight: 500,
                                    letterSpacing: '.08em',
                                    fontFeatureSettings: '"tnum"',
                                    color: up
                                      ? 'var(--color-positive)'
                                      : 'var(--color-negative)',
                                    background: up
                                      ? 'var(--color-positive-bg)'
                                      : 'var(--color-negative-bg)',
                                    padding: '2px 7px',
                                    borderRadius: 999,
                                  }}
                                >
                                  {fVar(cl.variacao)}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontFamily: 'var(--f-mono)',
                                    fontSize: 11,
                                    color: 'var(--fg-faint)',
                                    fontFeatureSettings: '"tnum"',
                                  }}
                                >
                                  {fData(cl.data_vencimento)}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
