'use client'

import { useMemo, useState } from 'react'
import type { Missao } from '../page'

const PAGE_SIZE = 100

function fMoney(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function StatusBadge({ status }: { status: string | null }) {
  const palette: Record<string, { bg: string; fg: string }> = {
    Premiado: { bg: 'var(--pos-bg)', fg: 'var(--pos-fg)' },
    Ativado: { bg: 'var(--bg-deep)', fg: 'var(--color-b-500)' },
    Elegível: { bg: 'var(--bg-deep)', fg: 'var(--fg-mute)' },
  }
  const p = (status && palette[status]) || { bg: 'var(--bg-deep)', fg: 'var(--fg-mute)' }
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    fontWeight: 500,
    background: p.bg,
    color: p.fg,
    borderColor: 'transparent',
  }
  return <span style={style}>{status ?? '—'}</span>
}

export function MissoesTable({ rows }: { rows: Missao[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const csvHref = useMemo(() => {
    const header = 'id_assessor,nome_assessor,equipe,produto,valor,status'
    const body = rows
      .map((r) => {
        const cells = [
          r.idAssessor ?? '',
          r.nomeAssessor ?? '',
          r.equipe ?? '',
          r.produto ?? '',
          r.valor ?? '',
          r.status ?? '',
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
  }, [rows])

  const wrapper: React.CSSProperties = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    overflow: 'hidden',
  }
  const th: React.CSSProperties = {
    textAlign: 'left',
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
  }
  const idMono: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    color: 'var(--fg-faint)',
    marginTop: 2,
  }
  const valorCell: React.CSSProperties = {
    ...td,
    fontFamily: 'var(--f-mono)',
    fontWeight: 500,
    textAlign: 'right',
    fontFeatureSettings: '"tnum"',
  }

  return (
    <div>
      {/* Botão CSV */}
      <div style={{ marginBottom: 'var(--s-3)', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={csvHref}
          download={`missoes-${new Date().toISOString().slice(0, 10)}.csv`}
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
          ↓ Baixar missões (CSV)
        </a>
      </div>

      <div style={wrapper}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 60 }}>Badge</th>
              <th style={th}>Assessor</th>
              <th style={th}>Equipe</th>
              <th style={th}>Produto</th>
              <th style={{ ...th, textAlign: 'right' }}>Valor</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={`${r.idAssessor}-${r.produto}-${i}`}>
                <td style={td}>
                  {r.urlImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.urlImg}
                      alt=""
                      width={36}
                      height={36}
                      style={{ display: 'block', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--fg-faint)' }}>—</span>
                  )}
                </td>
                <td style={td}>
                  <div>{r.nomeAssessor ?? '—'}</div>
                  <div style={idMono}>{r.idAssessor}</div>
                </td>
                <td style={{ ...td, fontFamily: 'var(--f-mono)', fontSize: 12 }}>
                  {r.equipe ?? '—'}
                </td>
                <td style={td}>{r.produto ?? '—'}</td>
                <td style={valorCell}>
                  {r.valor !== null && r.valor < 0 ? (
                    <span style={{ color: 'var(--color-negative)' }}>{fMoney(r.valor)}</span>
                  ) : (
                    fMoney(r.valor)
                  )}
                </td>
                <td style={td}>
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--fg-faint)' }}>
                  Sem missões no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
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
            Página {page + 1} de {totalPages} · {rows.length} missões
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
