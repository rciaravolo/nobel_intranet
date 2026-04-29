'use client'

import { useMemo, useState } from 'react'

const CLIENTES = [
  {
    id: 'cl1',
    name: 'Álvaro Mendonça',
    type: 'PF',
    aum: 'R$ 4,2M',
    aumNum: 4.2,
    status: 'ativo',
    assessor: 'Rafael Brandão',
    lastContact: '15 Mar 2026',
    risk: 'Moderado',
    initials: 'AM',
    color: '#B8963E',
  },
  {
    id: 'cl2',
    name: 'Construtora Vitória S.A.',
    type: 'PJ',
    aum: 'R$ 18,7M',
    aumNum: 18.7,
    status: 'ativo',
    assessor: 'Pedro Oliveira',
    lastContact: '14 Mar 2026',
    risk: 'Agressivo',
    initials: 'CV',
    color: '#8b5cf6',
  },
  {
    id: 'cl3',
    name: 'Beatriz Lacerda',
    type: 'PF',
    aum: 'R$ 1,1M',
    aumNum: 1.1,
    status: 'ativo',
    assessor: 'Ana Lima',
    lastContact: '12 Mar 2026',
    risk: 'Conservador',
    initials: 'BL',
    color: '#10b981',
  },
  {
    id: 'cl4',
    name: 'Grupo Horizonte Ltda.',
    type: 'PJ',
    aum: 'R$ 32,5M',
    aumNum: 32.5,
    status: 'ativo',
    assessor: 'Rafael Brandão',
    lastContact: '10 Mar 2026',
    risk: 'Moderado',
    initials: 'GH',
    color: '#3b82f6',
  },
  {
    id: 'cl5',
    name: 'Carlos Eduardo Pires',
    type: 'PF',
    aum: 'R$ 780K',
    aumNum: 0.78,
    status: 'ativo',
    assessor: 'Pedro Oliveira',
    lastContact: '08 Mar 2026',
    risk: 'Conservador',
    initials: 'CE',
    color: '#f59e0b',
  },
  {
    id: 'cl6',
    name: 'Fernanda Queiroz',
    type: 'PF',
    aum: 'R$ 2,3M',
    aumNum: 2.3,
    status: 'ativo',
    assessor: 'Ana Lima',
    lastContact: '06 Mar 2026',
    risk: 'Moderado',
    initials: 'FQ',
    color: '#ec4899',
  },
  {
    id: 'cl7',
    name: 'TechVenture Capital',
    type: 'PJ',
    aum: 'R$ 9,8M',
    aumNum: 9.8,
    status: 'inativo',
    assessor: 'Rafael Brandão',
    lastContact: '22 Fev 2026',
    risk: 'Agressivo',
    initials: 'TV',
    color: '#6366f1',
  },
  {
    id: 'cl8',
    name: 'Marcos Augusto Silva',
    type: 'PF',
    aum: 'R$ 550K',
    aumNum: 0.55,
    status: 'prospecto',
    assessor: 'Pedro Oliveira',
    lastContact: '18 Fev 2026',
    risk: '—',
    initials: 'MA',
    color: '#14b8a6',
  },
  {
    id: 'cl9',
    name: 'Indústrias Nobre S.A.',
    type: 'PJ',
    aum: 'R$ 6,1M',
    aumNum: 6.1,
    status: 'ativo',
    assessor: 'Ana Lima',
    lastContact: '15 Fev 2026',
    risk: 'Moderado',
    initials: 'IN',
    color: '#f97316',
  },
  {
    id: 'cl10',
    name: 'Juliana Fonseca',
    type: 'PF',
    aum: 'R$ 1,9M',
    aumNum: 1.9,
    status: 'ativo',
    assessor: 'Rafael Brandão',
    lastContact: '10 Fev 2026',
    risk: 'Moderado',
    initials: 'JF',
    color: '#84cc16',
  },
]

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ativo: { bg: 'rgba(16,185,129,0.1)', text: '#059669', label: 'Ativo' },
  inativo: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', label: 'Inativo' },
  prospecto: { bg: 'rgba(245,158,11,0.1)', text: '#d97706', label: 'Prospecto' },
}

const STATS = [
  { label: 'Clientes ativos', value: '1.847', sub: '+34 este mês' },
  { label: 'AuM total', value: 'R$ 2,4B', sub: '+12,4% vs mês anterior' },
  { label: 'Ticket médio', value: 'R$ 1,3M', sub: 'por cliente ativo' },
  { label: 'Prospectos', value: '28', sub: 'em negociação' },
]

type Filter = 'Todos' | 'PF' | 'PJ' | 'Ativos' | 'Prospectos'
const FILTERS: Filter[] = ['Todos', 'PF', 'PJ', 'Ativos', 'Prospectos']

export default function ClientesPage() {
  const [filter, setFilter] = useState<Filter>('Todos')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = CLIENTES
    if (filter === 'PF') list = list.filter((c) => c.type === 'PF')
    if (filter === 'PJ') list = list.filter((c) => c.type === 'PJ')
    if (filter === 'Ativos') list = list.filter((c) => c.status === 'ativo')
    if (filter === 'Prospectos') list = list.filter((c) => c.status === 'prospecto')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.assessor.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.risk.toLowerCase().includes(q),
      )
    }
    return list
  }, [filter, search])

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', marginBottom: 4 }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado
            {filtered.length !== 1 ? 's' : ''}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-lora, serif)',
              fontSize: 24,
              fontWeight: 600,
              color: '#1A1209',
            }}
          >
            Clientes
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#fff',
              border: '1px solid rgba(184,150,62,0.2)',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: '#1A1209',
              cursor: 'pointer',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="13"
              height="13"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Exportar
          </button>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#1A1209',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#F6F3ED',
              cursor: 'pointer',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="13"
              height="13"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              background: '#fff',
              border: '1px solid rgba(184,150,62,0.12)',
              borderRadius: 8,
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(26,18,9,0.04)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'rgba(26,18,9,0.4)',
                marginBottom: 6,
                letterSpacing: '0.06em',
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-lora, serif)',
                fontSize: 22,
                fontWeight: 600,
                color: '#1A1209',
                marginBottom: 3,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#B8963E' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            border: '1px solid rgba(184,150,62,0.18)',
            borderRadius: 6,
            padding: '10px 16px',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(26,18,9,0.3)"
            strokeWidth="1.5"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, assessor, perfil..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              color: '#1A1209',
              width: '100%',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(26,18,9,0.4)',
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 16px',
              background: filter === f ? '#1A1209' : '#fff',
              border: filter === f ? 'none' : '1px solid rgba(184,150,62,0.18)',
              borderRadius: 6,
              fontSize: 12,
              color: filter === f ? '#F6F3ED' : 'rgba(26,18,9,0.5)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(184,150,62,0.12)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 60px 120px 100px 150px 110px 80px',
            padding: '10px 20px',
            background: '#F6F3ED',
            borderBottom: '1px solid rgba(184,150,62,0.1)',
          }}
        >
          {['Cliente', 'Tipo', 'AuM', 'Status', 'Assessor', 'Últ. contato', 'Perfil'].map((h) => (
            <span
              key={h}
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(26,18,9,0.4)',
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'rgba(26,18,9,0.35)',
              fontSize: 13,
            }}
          >
            Nenhum cliente encontrado para &quot;{search}&quot; com filtro &quot;{filter}&quot;.
          </div>
        ) : (
          filtered.map((c, i) => {
            const st = STATUS_STYLE[c.status] ?? {
              bg: 'rgba(0,0,0,0.05)',
              text: '#555',
              label: c.status,
            }
            return (
              <div
                key={c.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 60px 120px 100px 150px 110px 80px',
                  padding: '12px 20px',
                  alignItems: 'center',
                  borderBottom:
                    i < filtered.length - 1 ? '1px solid rgba(184,150,62,0.07)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(184,150,62,0.03)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${c.color}, ${c.color}99)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {c.initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>{c.name}</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: c.type === 'PJ' ? '#3b82f6' : '#B8963E',
                    background: c.type === 'PJ' ? 'rgba(59,130,246,0.1)' : 'rgba(184,150,62,0.1)',
                    padding: '2px 7px',
                    borderRadius: 3,
                    width: 'fit-content',
                  }}
                >
                  {c.type}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1A1209',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {c.aum}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: st.text,
                    background: st.bg,
                    padding: '3px 9px',
                    borderRadius: 20,
                    width: 'fit-content',
                  }}
                >
                  {st.label}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.6)' }}>{c.assessor}</span>
                <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)' }}>{c.lastContact}</span>
                <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.5)' }}>{c.risk}</span>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 16,
        }}
      >
        <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)' }}>
          Mostrando {filtered.length} de 1.847 clientes
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['‹', '1', '2', '3', '...', '185', '›'].map((p) => (
            <button
              key={`page-${p}`}
              type="button"
              style={{
                width: 32,
                height: 32,
                background: p === '1' ? '#1A1209' : 'transparent',
                border: '1px solid rgba(184,150,62,0.15)',
                borderRadius: 5,
                fontSize: 12,
                color: p === '1' ? '#F6F3ED' : 'rgba(26,18,9,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
