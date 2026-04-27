'use client'

import { useState } from 'react'

type ClienteRow = { id_cliente: string; nome_cliente: string | null; valor: number }

type DeepDiveCaptacao = {
  mesLabel: string
  aportes:  ClienteRow[]
  resgates: ClienteRow[]
}

type Props = {
  captacao: { bruta: number; resgates: number; liquida: number }
  mesLabel: string
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
  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
  background: up ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
  color: up ? '#16a34a' : '#dc2626',
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
            <th style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textAlign: 'left', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cliente
            </th>
            <th style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textAlign: 'right', paddingBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {dados.map((r, i) => (
            <tr key={r.id_cliente} style={{ borderTop: '1px solid rgba(184,150,62,0.07)' }}>
              <td style={{ padding: '7px 0', fontSize: 12 }}>
                <span style={{ fontWeight: 500, color: '#1A1209', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {r.nome_cliente ?? `Cliente ${r.id_cliente}`}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(26,18,9,0.35)' }}>#{r.id_cliente}</span>
              </td>
              <td style={{ padding: '7px 0', textAlign: 'right', fontSize: 13, fontWeight: 600, color: cor }}>
                {fBRL(r.valor)}
              </td>
            </tr>
          ))}
          {dados.length === 0 && (
            <tr>
              <td colSpan={2} style={{ padding: '16px 0', fontSize: 12, color: 'rgba(26,18,9,0.35)', textAlign: 'center' }}>
                Sem movimentações no mês
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function BlocoCaptacao({ captacao, mesLabel }: Props) {
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [dados, setDados]   = useState<DeepDiveCaptacao | null>(null)
  const [erro, setErro]     = useState(false)

  async function toggle() {
    if (open) { setOpen(false); return }
    if (dados) { setOpen(true); return }

    setLoading(true)
    setErro(false)
    try {
      const res = await fetch('/api/performance/deepdive/captacao')
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
      background: '#fff', borderRadius: 10, marginBottom: 20,
      border: '1px solid rgba(184,150,62,0.12)',
      boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(184,150,62,0.09)', background: '#FDFAF5',
        borderRadius: open ? '10px 10px 0 0' : 10,
      }}>
        <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>
          Captação — {mesLabel}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)' }}>mês corrente</span>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '20px' }}>
        {items.map((item, i) => (
          <div
            key={item.label}
            onClick={item.clickable ? toggle : undefined}
            style={{
              padding: '0 18px',
              borderLeft: i > 0 ? '1px solid rgba(184,150,62,0.1)' : 'none',
              cursor: item.clickable ? 'pointer' : 'default',
              borderRadius: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (item.clickable) e.currentTarget.style.background = 'rgba(184,150,62,0.04)' }}
            onMouseLeave={e => { if (item.clickable) e.currentTarget.style.background = 'transparent' }}
          >
            <p style={{ fontSize: 10, color: 'rgba(26,18,9,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {item.label}
              {item.clickable && (
                <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: '#B8963E' }}>
                  {loading ? '...' : open ? '▲' : '▼'}
                </span>
              )}
            </p>
            <p style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 22, fontWeight: 600, color: '#1A1209', marginBottom: 6 }}>
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
          borderTop: '1px solid rgba(184,150,62,0.09)',
          padding: '20px 28px 24px',
          background: '#FDFAF5',
          borderRadius: '0 0 10px 10px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,18,9,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
            Deepdive — {dados.mesLabel}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <DeepDiveTable titulo="Maiores Aportes" dados={dados.aportes}  cor="#16a34a" />
            <DeepDiveTable titulo="Maiores Resgates" dados={dados.resgates} cor="#dc2626" />
          </div>
        </div>
      )}

      {erro && (
        <div style={{ padding: '12px 24px', color: '#dc2626', fontSize: 12, borderTop: '1px solid rgba(220,38,38,0.1)' }}>
          Erro ao carregar detalhes. Tente novamente.
        </div>
      )}
    </div>
  )
}
