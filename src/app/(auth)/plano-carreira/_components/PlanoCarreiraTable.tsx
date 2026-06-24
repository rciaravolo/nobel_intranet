'use client'

import { useMemo, useState } from 'react'
import type { PlanAssessor } from '../page'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type SortKey = 'nome' | 'cap_pct' | 'rec_pct' | 'mds_pct'
type SortDir = 'asc' | 'desc'

type Props = {
  assessores: PlanAssessor[]
  mesISO:     string
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)     return `${pre}${(abs / 1_000).toFixed(0)}K`
  return `${pre}${abs.toFixed(0)}`
}

function fPct(v: number): string {
  return `${(v * 100).toFixed(1).replace('.', ',')}%`
}

function getMesLabel(iso: string): string {
  return new Date(`${iso}-15`).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

/* ─── Cores por equipe ───────────────────────────────────────────────────── */

const EQUIPE_COLORS: Record<string, string> = {
  SMART:       'var(--color-b-500)',
  PRIVATE:     'var(--c-gold)',
  'RIO PRETO': '#10B981',
  BRAVO:       '#8B5CF6',
}

/* ─── Status derivado ────────────────────────────────────────────────────── */

function statusColor(pct: number): string {
  if (pct >= 1)   return 'var(--color-positive)'
  if (pct >= 0.8) return '#F59E0B'
  return 'var(--color-negative)'
}

function StatusBadge({ pct }: { pct: number }) {
  const color = statusColor(pct)
  const label = pct >= 1 ? '✓' : pct >= 0.8 ? '~' : '✕'
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        justifyContent: 'center',
        width:        16,
        height:       16,
        borderRadius: 4,
        background:   `color-mix(in oklch, ${color} 15%, transparent)`,
        color,
        fontSize:     10,
        fontWeight:   700,
        flexShrink:   0,
        fontFamily:   'var(--f-mono)',
      }}
    >
      {label}
    </span>
  )
}

/* ─── Progress bar com %, badge ──────────────────────────────────────────── */

function PctCell({ pct }: { pct: number }) {
  const w     = Math.min(100, Math.max(0, pct * 100))
  const color = statusColor(pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
      <div
        style={{
          width: 44, height: 3, borderRadius: 2,
          background: 'var(--bg-deep)', overflow: 'hidden', flexShrink: 0,
        }}
      >
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color, minWidth: 52, textAlign: 'right' }}>
        {fPct(pct)}
      </span>
      <StatusBadge pct={pct} />
    </div>
  )
}

/* ─── Sort header ────────────────────────────────────────────────────────── */

function SortTh({
  label, sortKey, current, dir, onSort, style,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  style?: React.CSSProperties
}) {
  const active = current === sortKey
  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        fontFamily:    'var(--f-mono)',
        fontSize:      11,
        fontWeight:    600,
        color:         active ? 'var(--fg)' : 'var(--fg-faint)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        padding:       '8px 14px',
        borderBottom:  '1px solid var(--line)',
        background:    'var(--bg-deep)',
        whiteSpace:    'nowrap' as const,
        cursor:        'pointer',
        userSelect:    'none' as const,
        ...style,
      }}
    >
      {label}
      {active && (
        <span style={{ marginLeft: 4, opacity: 0.6 }}>{dir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )
}

/* ─── KPI Summary card ───────────────────────────────────────────────────── */

function KpiCard({ label, hit, total }: { label: string; hit: number; total: number }) {
  const pct = total > 0 ? hit / total : 0
  const color = statusColor(pct)
  return (
    <div
      style={{
        background:   'var(--bg-elev)',
        borderRadius: 12,
        border:       '1px solid var(--line)',
        padding:      '16px 20px',
        flex:         1,
        minWidth:     160,
      }}
    >
      <div style={{ fontFamily: 'var(--f-text)', fontSize: 11, color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 28, fontWeight: 600, color, fontFeatureSettings: '"tnum"' }}>
          {hit}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 14, color: 'var(--fg-faint)' }}>
          / {total}
        </span>
      </div>
      <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: 'var(--bg-deep)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 2 }} />
      </div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--fg-faint)', marginTop: 6 }}>
        {fPct(pct)} atingiram o trigger
      </div>
    </div>
  )
}

/* ─── Estilos base ───────────────────────────────────────────────────────── */

const thBase: React.CSSProperties = {
  fontFamily:    'var(--f-mono)',
  fontSize:      11,
  fontWeight:    600,
  color:         'var(--fg-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  padding:       '8px 14px',
  borderBottom:  '1px solid var(--line)',
  background:    'var(--bg-deep)',
  whiteSpace:    'nowrap',
}

const tdBase: React.CSSProperties = {
  fontFamily:          'var(--f-mono)',
  fontSize:            13,
  padding:             '10px 14px',
  borderBottom:        '1px solid var(--line)',
  color:               'var(--fg)',
  fontFeatureSettings: '"tnum"',
}

/* ─── Componente principal ───────────────────────────────────────────────── */

export function PlanoCarreiraTable({ assessores, mesISO }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'nome' ? 'asc' : 'desc')
    }
  }

  const sorted = useMemo(() => {
    return [...assessores].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'nome')    cmp = a.nome.localeCompare(b.nome, 'pt-BR')
      if (sortKey === 'cap_pct') cmp = a.cap_pct - b.cap_pct
      if (sortKey === 'rec_pct') cmp = a.rec_pct - b.rec_pct
      if (sortKey === 'mds_pct') cmp = a.mds_pct - b.mds_pct
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [assessores, sortKey, sortDir])

  const nCap   = assessores.filter((a) => a.cap_pct >= 1).length
  const nRec   = assessores.filter((a) => a.rec_pct >= 1).length
  const nMds   = assessores.filter((a) => a.mds_pct >= 1).length
  const total  = assessores.length

  const destaques = useMemo(() =>
    assessores
      .map((a) => ({
        ...a,
        hits: (a.cap_pct >= 1 ? 1 : 0) + (a.rec_pct >= 1 ? 1 : 0) + (a.mds_pct >= 1 ? 1 : 0),
      }))
      .filter((a) => a.hits >= 2)
      .sort((a, b) => b.hits - a.hits || a.nome.localeCompare(b.nome, 'pt-BR'))
  , [assessores])

  return (
    <div>
      {/* ── KPI cards ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <KpiCard label="Captação"         hit={nCap} total={total} />
        <KpiCard label="Receita"          hit={nRec} total={total} />
        <KpiCard label="Modelo de Servir" hit={nMds} total={total} />

        {/* Card de destaque: ≥2 indicadores atingidos */}
        <div
          style={{
            background:   'var(--bg-elev)',
            borderRadius: 12,
            border:       '1px solid var(--line)',
            padding:      '16px 20px',
            flex:         1,
            minWidth:     200,
          }}
        >
          <div style={{ fontFamily: 'var(--f-text)', fontSize: 11, color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            2+ Triggers atingidos
          </div>

          {destaques.length === 0 ? (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--fg-faint)' }}>
              Nenhum assessor ainda
            </span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {destaques.map((a) => (
                <div key={a.id_assessor} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--f-text)', fontSize: 12, color: 'var(--fg)', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.nome}
                  </span>
                  <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: a.cap_pct >= 1 ? 'color-mix(in oklch, var(--color-positive) 18%, transparent)' : 'color-mix(in oklch, var(--fg) 6%, transparent)', color: a.cap_pct >= 1 ? 'var(--color-positive)' : 'var(--fg-faint)' }}>CAP</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: a.rec_pct >= 1 ? 'color-mix(in oklch, var(--color-positive) 18%, transparent)' : 'color-mix(in oklch, var(--fg) 6%, transparent)', color: a.rec_pct >= 1 ? 'var(--color-positive)' : 'var(--fg-faint)' }}>REC</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: a.mds_pct >= 1 ? 'color-mix(in oklch, var(--color-positive) 18%, transparent)' : 'color-mix(in oklch, var(--fg) 6%, transparent)', color: a.mds_pct >= 1 ? 'var(--color-positive)' : 'var(--fg-faint)' }}>MDS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabela ─────────────────────────────────────────────── */}
      <div
        style={{
          background:   'var(--bg-elev)',
          borderRadius: 12,
          border:       '1px solid var(--line)',
          overflow:     'hidden',
        }}
      >
        {/* Header da tabela */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '13px 20px',
            borderBottom:   '1px solid var(--line)',
            background:     'var(--bg-deep)',
          }}
        >
          <span style={{ fontFamily: 'var(--f-text)', fontSize: 13, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-.01em' }}>
            Assessores
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
            MTD vs Trigger — {getMesLabel(mesISO)}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {/* Assessor */}
                <SortTh label="Assessor" sortKey="nome" current={sortKey} dir={sortDir} onSort={handleSort} style={{ textAlign: 'left', minWidth: 180 }} />
                <th style={{ ...thBase, textAlign: 'left' }}>Equipe</th>
                <th style={{ ...thBase, textAlign: 'left' }}>Classe</th>

                {/* Captação */}
                <th style={{ ...thBase, textAlign: 'right' }}>Cap MTD</th>
                <th style={{ ...thBase, textAlign: 'right' }}>Trigger Cap</th>
                <SortTh label="% Cap" sortKey="cap_pct" current={sortKey} dir={sortDir} onSort={handleSort} style={{ textAlign: 'right', minWidth: 140 }} />

                {/* Receita */}
                <th style={{ ...thBase, textAlign: 'right' }}>Rec MTD</th>
                <th style={{ ...thBase, textAlign: 'right' }}>Trigger Rec</th>
                <SortTh label="% Rec" sortKey="rec_pct" current={sortKey} dir={sortDir} onSort={handleSort} style={{ textAlign: 'right', minWidth: 140 }} />

                {/* Modelo de Servir */}
                <th style={{ ...thBase, textAlign: 'right' }}>MDS</th>
                <th style={{ ...thBase, textAlign: 'right' }}>Trigger MDS</th>
                <SortTh label="% MDS" sortKey="mds_pct" current={sortKey} dir={sortDir} onSort={handleSort} style={{ textAlign: 'right', minWidth: 140 }} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((a, i) => {
                const eqColor = EQUIPE_COLORS[a.equipe] ?? 'var(--fg-faint)'
                return (
                  <tr
                    key={a.id_assessor}
                    style={{ background: i % 2 === 1 ? 'color-mix(in oklch, var(--fg) 2%, transparent)' : 'transparent' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'color-mix(in oklch, var(--fg) 4%, transparent)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 1 ? 'color-mix(in oklch, var(--fg) 2%, transparent)' : 'transparent' }}
                  >
                    {/* Nome */}
                    <td style={{ ...tdBase, textAlign: 'left', fontFamily: 'var(--f-text)', fontWeight: 500, fontSize: 13 }}>
                      {a.nome}
                    </td>

                    {/* Equipe */}
                    <td style={{ ...tdBase, textAlign: 'left' }}>
                      <span
                        style={{
                          display:      'inline-flex',
                          alignItems:   'center',
                          gap:          5,
                          fontFamily:   'var(--f-text)',
                          fontSize:     11,
                          color:        eqColor,
                          fontWeight:   500,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: 2, background: eqColor, flexShrink: 0, display: 'inline-block' }} />
                        {a.equipe}
                      </span>
                    </td>

                    {/* Classe */}
                    <td style={{ ...tdBase, textAlign: 'left' }}>
                      <span
                        style={{
                          fontFamily:   'var(--f-text)',
                          fontSize:     11,
                          color:        'var(--fg-faint)',
                          background:   'color-mix(in oklch, var(--fg) 6%, transparent)',
                          padding:      '2px 7px',
                          borderRadius: 4,
                        }}
                      >
                        {a.classe}
                      </span>
                    </td>

                    {/* Cap MTD */}
                    <td style={{ ...tdBase, textAlign: 'right', color: a.cap_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)' }}>
                      {fBRL(a.cap_mtd)}
                    </td>

                    {/* Trigger Cap */}
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-faint)', fontSize: 12 }}>
                      {fBRL(a.cap_trigger)}
                    </td>

                    {/* % Cap */}
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      <PctCell pct={a.cap_pct} />
                    </td>

                    {/* Rec MTD */}
                    <td style={{ ...tdBase, textAlign: 'right', color: a.rec_mtd < 0 ? 'var(--color-negative)' : 'var(--fg)' }}>
                      {fBRL(a.rec_mtd)}
                    </td>

                    {/* Trigger Rec */}
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-faint)', fontSize: 12 }}>
                      {fBRL(a.rec_trigger)}
                    </td>

                    {/* % Rec */}
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      <PctCell pct={a.rec_pct} />
                    </td>

                    {/* MDS */}
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      {a.mds.toFixed(1).replace('.', ',')}
                    </td>

                    {/* Trigger MDS */}
                    <td style={{ ...tdBase, textAlign: 'right', color: 'var(--fg-faint)', fontSize: 12 }}>
                      {a.mds_trigger}
                    </td>

                    {/* % MDS */}
                    <td style={{ ...tdBase, textAlign: 'right' }}>
                      <PctCell pct={a.mds_pct} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding:     '10px 20px',
            borderTop:   '1px solid var(--line)',
            background:  'var(--bg-deep)',
            fontFamily:  'var(--f-mono)',
            fontSize:    10,
            color:       'var(--fg-faint)',
            letterSpacing: '.04em',
          }}
        >
          {total} assessores · Pleno: cap R$700K / rec R$40K · Senior: cap R$1,4M / rec R$60K · MDS trigger: 65 pts
        </div>
      </div>
    </div>
  )
}
