'use client'

import { useState } from 'react'
import type { Envio } from '../page'

const PAGE_SIZE = 100

function fDate(iso: string): string {
  // record_date vem como "2026-07-15T10:32:00.000000"
  const d = new Date(iso.slice(0, 19))
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

function fNota(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toFixed(1).replace('.', ',')
}

function Badge({ ok }: { ok: boolean }) {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    fontWeight: 500,
    background: ok ? 'var(--pos-bg)' : 'var(--neg-bg)',
    color: ok ? 'var(--pos-fg)' : 'var(--neg-fg)',
    borderColor: 'transparent',
  }
  return <span style={style}>{ok ? 'Sim' : 'Não'}</span>
}

export function NpsTable({ envios }: { envios: Envio[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(envios.length / PAGE_SIZE))
  const rows = envios.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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
    verticalAlign: 'top',
  }
  const idMono: React.CSSProperties = {
    fontFamily: 'var(--f-mono)',
    fontSize: 10,
    color: 'var(--fg-faint)',
    marginTop: 2,
  }
  const notaCell: React.CSSProperties = {
    ...td,
    fontFamily: 'var(--f-mono)',
    fontWeight: 500,
    textAlign: 'right',
    fontFeatureSettings: '"tnum"',
  }

  return (
    <div>
      <div style={wrapper}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Cliente</th>
              <th style={th}>Assessor</th>
              <th style={th}>Envio</th>
              <th style={th}>Aberto</th>
              <th style={th}>Respondido</th>
              <th style={{ ...th, textAlign: 'right' }}>Nota</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.idCliente}-${r.recordDate}-${i}`}>
                <td style={td}>
                  <div>{r.nomeCliente}</div>
                  <div style={idMono}>#{r.idCliente}</div>
                </td>
                <td style={td}>{r.nomeAssessor ?? '—'}</td>
                <td style={{ ...td, fontFamily: 'var(--f-mono)', fontSize: 13 }}>
                  {fDate(r.recordDate)}
                </td>
                <td style={td}>
                  <Badge ok={r.emailOpened === 'Sim'} />
                </td>
                <td style={td}>
                  <Badge ok={r.surveyFinished === 'Sim'} />
                </td>
                <td style={notaCell}>
                  {r.nota === null ? (
                    <span style={{ color: 'var(--fg-faint)' }}>—</span>
                  ) : (
                    fNota(r.nota)
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: 'center', color: 'var(--fg-faint)' }}>
                  Sem envios de NPS no período.
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
            Página {page + 1} de {totalPages} · {envios.length} envios
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
