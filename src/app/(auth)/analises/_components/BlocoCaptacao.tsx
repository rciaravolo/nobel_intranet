'use client'

import { useState } from 'react'

type ClienteRow = { id_cliente: string; nome_cliente: string | null; valor: number }

type DeepDiveCaptacao = {
  mesLabel: string
  aportes:  ClienteRow[]
  resgates: ClienteRow[]
}

type Props = {
  captacao:    { bruta: number; resgates: number; liquida: number }
  mesLabel:    string
  filterType?:  string
  filterValue?: string
}

function fBRL(val: number): string {
  const abs = Math.abs(val)
  const pre = val < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000)     return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)         return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

const pill = (up: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 3,
  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 'var(--r-pill)',
  background: 'transparent',
  border: up ? '1px solid var(--color-positive)' : '1px solid var(--color-negative)',
  color: up ? 'var(--color-positive)' : 'var(--color-negative)',
})

function DeepDiveTable({
  titulo, dados, cor,
}: { titulo: string; dados: ClienteRow[]; cor: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: cor, marginBottom: 10,
      }}>
        {titulo}
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ fontSize: 11, color: 'var(--fg-faint)', textAlign: 'left', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'var(--f-mono)' }}>
              Cliente
            </th>
            <th style={{ fontSize: 11, color: 'var(--fg-faint)', textAlign: 'right', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'var(--f-mono)' }}>
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {dados.map((r, i) => (
            <tr key={r.id_cliente} style={{ borderTop: '1px solid var(--line)' }}>
              <td style={{ padding: '7px 0', fontSize: 12 }}>
                <span style={{ fontWeight: 500, color: 'var(--fg)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {r.nome_cliente ?? `Cliente ${r.id_cliente}`}
                </span>
                <span style={{ fontSize: 10, color: 'var(--fg-faint)' }}>#{r.id_cliente}</span>
              </td>
              <td style={{ padding: '7px 0', textAlign: 'right', fontSize: 13, fontWeight: 600, color: cor, fontFamily: 'var(--f-mono)' }}>
                {fBRL(r.valor)}
              </td>
            </tr>
          ))}
          {dados.length === 0 && (
            <tr>
              <td colSpan={2} style={{ padding: '16px 0', fontSize: 12, color: 'var(--fg-faint)', textAlign: 'center' }}>
                Sem movimentações no mês
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function BlocoCaptacao({ captacao, mesLabel, filterType, filterValue }: Props) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [dados, setDados]     = useState<DeepDiveCaptacao | null>(null)
  const [erro, setErro]       = useState(false)

  async function toggle() {
    if (open) { setOpen(false); return }
    if (dados) { setOpen(true); return }

    setLoading(true)
    setErro(false)
    try {
      const qs = new URLSearchParams()
      if (filterType)  qs.set('filter_type',  filterType)
      if (filterValue) qs.set('filter_value', filterValue)
      const url = `/api/performance/deepdive/captacao${qs.size ? `?${qs}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const json = await res.json() as { data: DeepDiveCaptacao }
      setDados(json.data)
      setOpen(true)
    } catch {
      setErro(true)
    } finally {
      setLoading(false)
    }
  }

  const items = [
    { label: 'Captação Bruta',   value: captacao.bruta,    up: true,                    clickable: false },
    { label: 'Resgates',         value: captacao.resgates,  up: false,                   clickable: false },
    { label: 'Captação Líquida', value: captacao.liquida,   up: captacao.liquida >= 0,   clickable: true  },
  ]

  return (
    <div style={{
      background: 'var(--bg-elev)', borderRadius: 8, marginBottom: 20,
      border: '1px solid var(--line)',
      boxShadow: '0 1px 4px var(--n-50)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        borderBottom: '1px solid var(--line)', background: 'var(--bg-deep)',
        borderRadius: open ? '8px 8px 0 0' : 8,
      }}>
        <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
          Captação — {mesLabel}
        </span>
        <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>mês corrente</span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '20px' }}>
        {items.map((item, i) => (
          <div
            key={item.label}
            onClick={item.clickable ? toggle : undefined}
            style={{
              padding: '0 18px',
              borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
              cursor: item.clickable ? 'pointer' : 'default',
              borderRadius: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (item.clickable) e.currentTarget.style.background = 'var(--n-50)' }}
            onMouseLeave={e => { if (item.clickable) e.currentTarget.style.background = 'transparent' }}
          >
            <p style={{ fontSize: 10, color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {item.label}
              {item.clickable && (
                <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: 'var(--c-gold)' }}>
                  {loading ? '...' : open ? '▲' : '▼'}
                </span>
              )}
            </p>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 28, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>
              {fBRL(item.value)}
            </p>
            <span style={pill(item.up)}>
              {item.up ? '↑' : '↓'} {item.label === 'Captação Líquida' ? 'resultado do mês' : item.label.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Deepdive painel */}
      {open && dados && (
        <div style={{
          borderTop: '1px solid var(--line)',
          padding: '20px 28px 24px',
          background: 'var(--bg-deep)',
          borderRadius: '0 0 8px 8px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'var(--f-mono)', marginBottom: 16 }}>
            Deepdive — {dados.mesLabel}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <DeepDiveTable titulo="Maiores Aportes" dados={dados.aportes}  cor="var(--color-positive)" />
            <DeepDiveTable titulo="Maiores Resgates" dados={dados.resgates} cor="var(--color-negative)" />
          </div>
        </div>
      )}

      {erro && (
        <div style={{ padding: '12px 24px', color: 'var(--color-negative)', fontSize: 12, borderTop: '1px solid var(--color-negative)' }}>
          Erro ao carregar detalhes. Tente novamente.
        </div>
      )}
    </div>
  )
}
