'use client'

import { useMemo, useState } from 'react'
import type { FPRow } from '../page'

const PAGE_SIZE = 100

type StatusFPFilter = 'todos' | 'iniciado' | 'nao_iniciado'

function fDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso.slice(0, 19))
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yy = String(d.getUTCFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

function SegmentoBadge({ segmento }: { segmento: string | null }) {
  if (!segmento) return <span style={{ color: 'var(--fg-faint)' }}>—</span>
  const palette: Record<string, { bg: string; fg: string }> = {
    Private: { bg: 'var(--pos-bg)', fg: 'var(--c-gold)' },
    'PF 300K+': { bg: 'var(--pos-bg)', fg: 'var(--pos-fg)' },
    'PF 300K-': { bg: 'var(--bg-deep)', fg: 'var(--fg-mute)' },
    PJ: { bg: 'var(--bg-deep)', fg: 'var(--color-b-500)' },
  }
  const p = palette[segmento] ?? { bg: 'var(--bg-deep)', fg: 'var(--fg-mute)' }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        fontWeight: 500,
        background: p.bg,
        color: p.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {segmento}
    </span>
  )
}

function StatusContaBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: 'var(--fg-faint)' }}>—</span>
  const isAtiva = status === 'A'
  const label = isAtiva ? 'Ativa' : status === 'I' ? 'Inativa' : status
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        fontWeight: 500,
        background: isAtiva ? 'var(--pos-bg)' : 'var(--bg-deep)',
        color: isAtiva ? 'var(--pos-fg)' : 'var(--fg-faint)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function StatusFPBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: 'var(--fg-faint)' }}>—</span>
  const isIniciado = status === 'FP Iniciado'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--f-mono)',
        fontSize: 10,
        fontWeight: 500,
        background: isIniciado ? 'var(--pos-bg)' : 'var(--bg-deep)',
        color: isIniciado ? 'var(--c-gold)' : 'var(--fg-faint)',
        whiteSpace: 'nowrap',
      }}
    >
      {isIniciado ? 'Iniciado' : 'Não Iniciado'}
    </span>
  )
}

function CompletudeBar({ completude }: { completude: number | null }) {
  const c = completude ?? 0
  const color =
    c === 100
      ? 'var(--color-positive)'
      : c >= 70
        ? 'var(--c-gold)'
        : c > 0
          ? 'var(--fg-mute)'
          : 'var(--fg-faint)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 12,
          fontWeight: 600,
          color,
          minWidth: 40,
          textAlign: 'right',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {c.toFixed(0)}%
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
            width: `${Math.max(0, Math.min(100, c))}%`,
            height: '100%',
            background: color,
            transition: 'width .2s',
          }}
        />
      </div>
    </div>
  )
}

function ChipToggle({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 'var(--r-pill)',
        border: `1px solid ${active ? 'var(--fg)' : 'var(--line-strong)'}`,
        background: active ? 'var(--fg)' : 'var(--bg-elev)',
        color: active ? 'var(--bg)' : 'var(--fg)',
        fontFamily: 'var(--f-mono)',
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {label}
      {typeof count === 'number' && (
        <span
          style={{
            fontSize: 10,
            opacity: 0.7,
            fontFeatureSettings: '"tnum"',
          }}
        >
          {count.toLocaleString('pt-BR')}
        </span>
      )}
    </button>
  )
}

export function FinancialPlanningTable({
  rows,
  showAssessor = true,
}: { rows: FPRow[]; showAssessor?: boolean }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFPFilter>('todos')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [page, setPage] = useState(0)

  // Contagens para os chips (sempre calculadas sobre a base já filtrada por conta ativa)
  const activeBase = useMemo(
    () => (includeInactive ? rows : rows.filter((r) => r.statusConta === 'A')),
    [rows, includeInactive],
  )

  const counts = useMemo(
    () => ({
      todos: activeBase.length,
      iniciado: activeBase.filter((r) => r.statusFp === 'FP Iniciado').length,
      nao_iniciado: activeBase.filter((r) => r.statusFp !== 'FP Iniciado').length,
    }),
    [activeBase],
  )

  const filtered = useMemo(() => {
    let out = activeBase
    if (statusFilter === 'iniciado') out = out.filter((r) => r.statusFp === 'FP Iniciado')
    else if (statusFilter === 'nao_iniciado') out = out.filter((r) => r.statusFp !== 'FP Iniciado')
    const q = query.trim().toLowerCase()
    if (q) {
      out = out.filter((r) => {
        const hay = [String(r.idCliente), r.nomeCliente, r.idAssessor, r.nomeAssessor ?? '']
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    }
    return out
  }, [activeBase, statusFilter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const csvHref = useMemo(() => {
    const header =
      'id_cliente,nome_cliente,id_assessor,nome_assessor,segmento_conta,status_conta,status_fp,completude,data_criacao_fp,ultima_atualizacao'
    const body = filtered
      .map((r) => {
        const cells = [
          r.idCliente,
          r.nomeCliente,
          r.idAssessor,
          r.nomeAssessor ?? '',
          r.segmentoConta ?? '',
          r.statusConta ?? '',
          r.statusFp ?? '',
          r.completude ?? '',
          r.dataCriacaoFp ?? '',
          r.ultimaAtualizacao ?? '',
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
  const dateCell: React.CSSProperties = {
    ...td,
    fontFamily: 'var(--f-mono)',
    fontSize: 12,
    color: 'var(--fg-mute)',
  }

  return (
    <div>
      {/* Toolbar 1: chips de status FP + toggle incluir inativos */}
      <div
        style={{
          marginBottom: 'var(--s-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ChipToggle
            label="Todos"
            active={statusFilter === 'todos'}
            onClick={() => {
              setStatusFilter('todos')
              setPage(0)
            }}
            count={counts.todos}
          />
          <ChipToggle
            label="Iniciado"
            active={statusFilter === 'iniciado'}
            onClick={() => {
              setStatusFilter('iniciado')
              setPage(0)
            }}
            count={counts.iniciado}
          />
          <ChipToggle
            label="Não Iniciado"
            active={statusFilter === 'nao_iniciado'}
            onClick={() => {
              setStatusFilter('nao_iniciado')
              setPage(0)
            }}
            count={counts.nao_iniciado}
          />
        </div>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            color: 'var(--fg-mute)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => {
              setIncludeInactive(e.target.checked)
              setPage(0)
            }}
            style={{ cursor: 'pointer' }}
          />
          Incluir contas inativas
        </label>
      </div>

      {/* Toolbar 2: busca + CSV */}
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
          download={`financial-planning-${new Date().toISOString().slice(0, 10)}.csv`}
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
              <th style={{ ...th, width: 100 }}>Segmento</th>
              <th style={{ ...th, width: 80 }}>Conta</th>
              <th style={{ ...th, width: 110 }}>Status FP</th>
              <th style={{ ...th, width: 180 }}>Completude</th>
              <th style={{ ...th, width: 90 }}>Criação</th>
              <th style={{ ...th, width: 100 }}>Atualização</th>
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
                  <SegmentoBadge segmento={r.segmentoConta} />
                </td>
                <td style={td}>
                  <StatusContaBadge status={r.statusConta} />
                </td>
                <td style={td}>
                  <StatusFPBadge status={r.statusFp} />
                </td>
                <td style={td}>
                  <CompletudeBar completude={r.completude} />
                </td>
                <td style={dateCell}>{fDate(r.dataCriacaoFp)}</td>
                <td style={dateCell}>{fDate(r.ultimaAtualizacao)}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={showAssessor ? 8 : 7}
                  style={{ ...td, textAlign: 'center', color: 'var(--fg-faint)' }}
                >
                  {query || statusFilter !== 'todos' || !includeInactive
                    ? 'Nenhum cliente encontrado com os filtros atuais.'
                    : 'Sem clientes no período.'}
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
            {rows.length !== filtered.length ? ` de ${rows.length}` : ''} clientes
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
