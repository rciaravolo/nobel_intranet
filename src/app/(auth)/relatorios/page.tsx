'use client'

import { useState } from 'react'

const REPORTS = [
  { id: 'r1', type: 'Performance', title: 'XPerformance — Fevereiro 2026',          period: 'Fev 2026', pages: 24, size: '2,4 MB', date: '14 Mar 2026', status: 'novo', icon: '📈' },
  { id: 'r2', type: 'Captação',    title: 'Captação Líquida — Fevereiro 2026',      period: 'Fev 2026', pages: 12, size: '1,1 MB', date: '10 Mar 2026', status: 'novo', icon: '💹' },
  { id: 'r3', type: 'Gerencial',   title: 'Relatório Gerencial — Q1 2026',          period: 'Q1 2026',  pages: 48, size: '5,7 MB', date: '05 Mar 2026', status: 'lido', icon: '📊' },
  { id: 'r4', type: 'Compliance',  title: 'Compliance & Risco — Mar 2026',          period: 'Mar 2026', pages: 18, size: '1,8 MB', date: '01 Mar 2026', status: 'lido', icon: '🛡️' },
  { id: 'r5', type: 'Performance', title: 'XPerformance — Janeiro 2026',            period: 'Jan 2026', pages: 24, size: '2,3 MB', date: '14 Fev 2026', status: 'lido', icon: '📈' },
  { id: 'r6', type: 'Captação',    title: 'Captação Líquida — Janeiro 2026',        period: 'Jan 2026', pages: 11, size: '0,9 MB', date: '10 Fev 2026', status: 'lido', icon: '💹' },
  { id: 'r7', type: 'Gerencial',   title: 'Relatório Gerencial — Q4 2025',          period: 'Q4 2025',  pages: 52, size: '6,1 MB', date: '05 Jan 2026', status: 'lido', icon: '📊' },
  { id: 'r8', type: 'Compliance',  title: 'Compliance & Risco — Dez 2025',          period: 'Dez 2025', pages: 16, size: '1,6 MB', date: '15 Jan 2026', status: 'lido', icon: '🛡️' },
]

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Performance': { bg: 'rgba(184,150,62,0.1)',  text: '#B8963E' },
  'Captação':    { bg: 'rgba(16,185,129,0.1)',   text: '#059669' },
  'Gerencial':   { bg: 'rgba(59,130,246,0.1)',   text: '#2563eb' },
  'Compliance':  { bg: 'rgba(139,92,246,0.1)',   text: '#7c3aed' },
}

const TYPES = ['Todos', ...Object.keys(TYPE_COLORS)] as const
type TypeFilter = typeof TYPES[number]

const STATS = [
  { label: 'Relatórios este mês', value: '4'      },
  { label: 'Total acumulado',      value: '38'     },
  { label: 'Último gerado',        value: '14 Mar' },
]

export default function RelatoriosPage() {
  const [activeType, setActiveType] = useState<TypeFilter>('Todos')

  const filtered = activeType === 'Todos'
    ? REPORTS
    : REPORTS.filter((r) => r.type === activeType)

  const novos = filtered.filter((r) => r.status === 'novo').length

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', marginBottom: 4 }}>
            {novos > 0 ? `${novos} novo${novos > 1 ? 's' : ''} disponíve${novos > 1 ? 'is' : 'l'}` : 'Sem novidades'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 24, fontWeight: 600, color: '#1A1209' }}>Relatórios</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#fff', border: '1px solid rgba(184,150,62,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#1A1209', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/></svg>
            Filtrar
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#1A1209', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: '#F6F3ED', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Solicitar relatório
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 28, background: 'rgba(184,150,62,0.1)', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 8, overflow: 'hidden' }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ flex: 1, background: '#fff', padding: '14px 20px' }}>
            <div style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)', marginBottom: 4, letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 22, fontWeight: 600, color: '#1A1209' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Type filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: activeType === t ? '1.5px solid #1A1209' : '1.5px solid rgba(184,150,62,0.2)',
              background: activeType === t ? '#1A1209' : 'transparent',
              color: activeType === t ? '#F6F3ED' : 'rgba(26,18,9,0.5)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t}
            {t !== 'Todos' && (
              <span style={{ marginLeft: 5, opacity: 0.6, fontSize: 11 }}>
                ({REPORTS.filter((r) => r.type === t).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,18,9,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 80px 100px 100px', padding: '10px 20px', borderBottom: '1px solid rgba(184,150,62,0.1)', background: '#F6F3ED' }}>
          {['Relatório', 'Período', 'Páginas', 'Tamanho', 'Disponível', ''].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(26,18,9,0.4)' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(26,18,9,0.35)', fontSize: 13 }}>
            Nenhum relatório encontrado para &quot;{activeType}&quot;.
          </div>
        ) : filtered.map((r, i) => {
          const colors = TYPE_COLORS[r.type] ?? { bg: 'rgba(0,0,0,0.05)', text: '#555' }
          return (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 80px 80px 100px 100px',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(184,150,62,0.08)' : 'none',
                background: r.status === 'novo' ? '#fffef9' : '#fff',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,150,62,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = r.status === 'novo' ? '#fffef9' : '#fff')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>{r.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text, background: colors.bg, padding: '2px 7px', borderRadius: 3 }}>{r.type}</span>
                    {r.status === 'novo' && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B8963E' }}>NOVO</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>{r.title}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.5)' }}>{r.period}</span>
              <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.5)' }}>{r.pages} págs</span>
              <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.5)' }}>{r.size}</span>
              <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)' }}>{r.date}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(184,150,62,0.1)', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 500, color: '#B8963E', cursor: 'pointer' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="11" height="11"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
