'use client'

import { useMemo, useState } from 'react'
import type { RupturaRow, RupturaSinais } from '../page'

const PAGE_SIZE = 100
const MAX_PONTOS = 8

function fMoney(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
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

function MesesBadge({ meses }: { meses: number | null }) {
  const m = meses ?? 0
  if (m === 0)
    return <span style={{ color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)' }}>0</span>
  const isCronico = m >= 3
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--f-mono)',
        fontSize: 11,
        fontWeight: 500,
        background: isCronico ? 'var(--neg-bg)' : 'var(--bg-deep)',
        color: isCronico ? 'var(--neg-fg)' : 'var(--fg-mute)',
      }}
    >
      {m}
    </span>
  )
}

function PontuacaoBar({ pontos }: { pontos: number | null }) {
  const p = pontos ?? 0
  const color = p >= 6 ? 'var(--color-negative)' : p >= 3 ? 'var(--c-gold)' : 'var(--fg-mute)'
  const pct = Math.min(100, (p / MAX_PONTOS) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 13,
          fontWeight: 600,
          color,
          minWidth: 24,
          textAlign: 'right',
        }}
      >
        {p}
      </div>
      <div
        style={{
          flex: 1,
          height: 6,
          background: 'var(--bg-deep)',
          borderRadius: 3,
          overflow: 'hidden',
          minWidth: 60,
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

const SINAL_LABELS: Record<keyof RupturaSinais, string> = {
  monoproduto: 'Monoproduto',
  semAportes: 'Sem Aportes',
  semOrdem: 'Sem Ordem',
  rentNegativa: 'Rent Neg',
  stvmOut: 'STVM Out',
  npsDetrator: 'NPS Detrator',
}

const SINAL_ORDER: (keyof RupturaSinais)[] = [
  'monoproduto',
  'semAportes',
  'semOrdem',
  'rentNegativa',
  'stvmOut',
  'npsDetrator',
]

function SinaisChips({ sinais }: { sinais: RupturaSinais }) {
  const ativos = SINAL_ORDER.filter((k) => sinais[k])
  if (ativos.length === 0) {
    return (
      <span style={{ color: 'var(--fg-faint)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>—</span>
    )
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
      {ativos.map((k) => (
        <span
          key={k}
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 'var(--r-pill)',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            background: 'var(--neg-bg)',
            color: 'var(--neg-fg)',
            whiteSpace: 'nowrap',
          }}
        >
          {SINAL_LABELS[k]}
        </span>
      ))}
    </div>
  )
}

export function RupturaTable({
  rows,
  showAssessor = true,
}: { rows: RupturaRow[]; showAssessor?: boolean }) {
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
      'id_cliente,nome_cliente,id_assessor,nome_assessor,modelo,auc,pont_ruptura,meses_ruptura,sinais_ativos'
    const body = filtered
      .map((r) => {
        const ativos = SINAL_ORDER.filter((k) => r.sinais[k])
          .map((k) => SINAL_LABELS[k])
          .join('; ')
        const cells = [
          r.idCliente,
          r.nomeCliente,
          r.idAssessor,
          r.nomeAssessor ?? '',
          r.modelo ?? '',
          r.auc ?? '',
          r.pontRuptura ?? '',
          r.mesesRuptura ?? '',
          ativos,
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
    padding: '10px 16px',
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
    padding: '12px 16px',
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
          download={`ruptura-${new Date().toISOString().slice(0, 10)}.csv`}
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
              <th style={{ ...th, width: 100 }}>Modelo</th>
              <th style={th}>AUC</th>
              <th style={{ ...th, width: 160 }}>Pontuação</th>
              <th style={{ ...th, width: 110 }}>Meses em Ruptura</th>
              <th style={th}>Sinais</th>
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
                  <PontuacaoBar pontos={r.pontRuptura} />
                </td>
                <td style={td}>
                  <MesesBadge meses={r.mesesRuptura} />
                </td>
                <td style={td}>
                  <SinaisChips sinais={r.sinais} />
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={showAssessor ? 7 : 6}
                  style={{ ...td, textAlign: 'center', color: 'var(--fg-faint)' }}
                >
                  {query
                    ? 'Nenhum cliente encontrado para essa busca.'
                    : 'Sem clientes em ruptura no período.'}
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
