'use client'

import { useMemo, useState } from 'react'
import type { SaudeRow } from '../page'

const PAGE_SIZE = 100

function fMoney(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function scoreColor(v: number | null): string {
  if (v == null) return 'var(--fg-faint)'
  if (v >= 70) return 'var(--color-positive)'
  if (v >= 40) return 'var(--c-gold)'
  return 'var(--color-negative)'
}

function ModeloBadge({ modelo }: { modelo: string | null }) {
  if (!modelo) return <span style={{ color: 'var(--fg-faint)' }}>—</span>
  const isFee = modelo === 'FEE BASED'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        fontWeight: 500,
        background: isFee ? 'var(--pos-bg)' : 'var(--bg-deep)',
        color: isFee ? 'var(--pos-fg)' : 'var(--fg-mute)',
        borderColor: 'transparent',
      }}
    >
      {isFee ? 'FEE' : 'COMISSION'}
    </span>
  )
}

function IndiceSaudeBar({ value }: { value: number | null }) {
  const v = value ?? 0
  const color = scoreColor(v)
  const pct = Math.min(100, Math.max(0, v))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 13,
          fontWeight: 600,
          color,
          minWidth: 32,
          textAlign: 'right',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {v.toFixed(0)}
      </div>
      <div
        style={{
          flex: 1,
          maxWidth: 100,
          height: 6,
          background: 'var(--bg-deep)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width .2s',
          }}
        />
      </div>
    </div>
  )
}

function ComponenteMini({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <span style={{ color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>—</span>
    )
  }
  const color = scoreColor(value)
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          fontWeight: 500,
          color,
          minWidth: 24,
          textAlign: 'right',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value.toFixed(0)}
      </span>
      <div
        style={{
          width: 40,
          height: 4,
          background: 'var(--bg-deep)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
          }}
        />
      </div>
    </div>
  )
}

export function SaudeClienteTable({
  rows,
  showAssessor = true,
}: { rows: SaudeRow[]; showAssessor?: boolean }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const hay = [String(r.idCliente), r.nomeCliente, r.idAssessor, r.nomeAssessor ?? '']
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [rows, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const csvHref = useMemo(() => {
    const header =
      'id_cliente,nome_cliente,id_assessor,nome_assessor,modelo,auc,indice_saude,pont_aportes,pont_rentabilidade,pont_cross_sell,qtde_meses_aporte_u12m,qtde_cross_sell'
    const body = filtered
      .map((r) => {
        const cells = [
          r.idCliente,
          r.nomeCliente,
          r.idAssessor,
          r.nomeAssessor ?? '',
          r.modelo ?? '',
          r.auc ?? '',
          r.indiceSaude ?? '',
          r.pontAportes ?? '',
          r.pontRentabilidade ?? '',
          r.pontCrossSell ?? '',
          r.qtdeMesesAporteU12m ?? '',
          r.qtdeCrossSell ?? '',
        ].map((v) => {
          const s = String(v)
          if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
          return s
        })
        return cells.join(',')
      })
      .join('\n')
    const csv = `﻿${header}\n${body}\n`
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
  }, [filtered])

  const wrapper: React.CSSProperties = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    overflow: 'hidden',
  }
  const th: React.CSSProperties = {
    textAlign: 'center',
    padding: '10px 12px',
    fontFamily: 'var(--f-mono)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--fg-faint)',
    textTransform: 'uppercase',
    letterSpacing: '.10em',
    borderBottom: '1px solid var(--line)',
    background: 'var(--bg-deep)',
  }
  const td: React.CSSProperties = {
    padding: '12px 12px',
    fontFamily: 'var(--f-text)',
    fontSize: 14,
    color: 'var(--fg)',
    borderBottom: '1px solid var(--line)',
    verticalAlign: 'middle',
    textAlign: 'center',
  }
  const idMono: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    color: 'var(--fg-faint)',
    marginTop: 2,
  }
  const aucCell: React.CSSProperties = {
    ...td,
    fontFamily: 'var(--f-mono)',
    fontWeight: 500,
    fontFeatureSettings: '"tnum"',
  }

  return (
    <div>
      {/* Toolbar: busca + CSV */}
      <div
        style={{
          marginBottom: 'var(--s-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <input
          type="search"
          placeholder="Buscar por cliente, assessor ou ID..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          style={{
            flex: 1,
            maxWidth: 380,
            height: 36,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px solid var(--line-strong)',
            background: 'var(--bg-elev)',
            color: 'var(--fg)',
            fontFamily: 'var(--f-text)',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <a
          href={csvHref}
          download={`saude-cliente-${new Date().toISOString().slice(0, 10)}.csv`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
            background: 'var(--bg-elev)',
            color: 'var(--fg)',
            fontFamily: 'var(--f-mono)',
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          ↓ Baixar CSV
        </a>
      </div>

      <div style={wrapper}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Cliente</th>
              {showAssessor && <th style={th}>Assessor</th>}
              <th style={{ ...th, width: 90 }}>Modelo</th>
              <th style={th}>AUC</th>
              <th style={{ ...th, width: 160 }}>Índice Saúde</th>
              <th style={{ ...th, width: 110 }}>Aportes</th>
              <th style={{ ...th, width: 110 }}>Rentabilidade</th>
              <th style={{ ...th, width: 110 }}>Cross-Sell</th>
              <th style={{ ...th, width: 80 }}>Meses Aporte</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={`${r.idCliente}-${r.idAssessor}`}>
                <td style={td}>
                  <div>{r.nomeCliente}</div>
                  <div style={idMono}>#{r.idCliente}</div>
                </td>
                {showAssessor && (
                  <td style={td}>
                    <div>{r.nomeAssessor ?? '—'}</div>
                    <div style={idMono}>{r.idAssessor}</div>
                  </td>
                )}
                <td style={td}>
                  <ModeloBadge modelo={r.modelo} />
                </td>
                <td style={aucCell}>{fMoney(r.auc)}</td>
                <td style={td}>
                  <IndiceSaudeBar value={r.indiceSaude} />
                </td>
                <td style={td}>
                  <ComponenteMini value={r.pontAportes} />
                </td>
                <td style={td}>
                  <ComponenteMini value={r.pontRentabilidade} />
                </td>
                <td style={td}>
                  <ComponenteMini value={r.pontCrossSell} />
                </td>
                <td style={{ ...td, fontFamily: 'var(--f-mono)', fontFeatureSettings: '"tnum"' }}>
                  {r.qtdeMesesAporteU12m == null ? '—' : Math.round(r.qtdeMesesAporteU12m)}
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={showAssessor ? 9 : 8}
                  style={{ ...td, textAlign: 'center', color: 'var(--fg-faint)' }}
                >
                  {query
                    ? 'Nenhum cliente encontrado para essa busca.'
                    : 'Sem clientes monitorados no período.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            color: 'var(--fg-mute)',
          }}
        >
          <span>
            Página {page + 1} de {totalPages} · {filtered.length}
            {query && rows.length !== filtered.length ? ` de ${rows.length}` : ''} clientes
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--line-strong)',
                background: 'var(--bg-elev)',
                color: page === 0 ? 'var(--fg-faint)' : 'var(--fg)',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--line-strong)',
                background: 'var(--bg-elev)',
                color: page >= totalPages - 1 ? 'var(--fg-faint)' : 'var(--fg)',
                fontFamily: 'var(--f-mono)',
                fontSize: 11,
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
