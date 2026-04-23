'use client'

import { useState } from 'react'

const PINNED = [
  {
    id: 'p1', tag: 'Gestão', tagColor: '#B8963E',
    title: 'Resultados Q1 2026 — Nobel Capital supera meta em 18%',
    body: 'O primeiro trimestre de 2026 foi histórico para a Nobel Capital. Atingimos R$ 2,4B em AuM, superando nossa meta trimestral em 18%. Agradecemos a dedicação de cada assessor e colaborador nessa conquista.',
    author: 'Rafael Brandão', role: 'Sócio · Gestão', date: '17 Mar 2026', initials: 'RB', color: '#B8963E',
  },
]

const COMUNICADOS = [
  { id: 'c1', tag: 'Compliance', tagColor: '#3b82f6', title: 'Atualização de política KYC — vigência a partir de 01/04',      preview: 'Novas diretrizes para cadastro e atualização de clientes pessoa física e jurídica conforme resolução CVM 35/2026.', author: 'Marina Santos', date: '14 Mar 2026', initials: 'MS', color: '#3b82f6', unread: true  },
  { id: 'c2', tag: 'RH',         tagColor: '#10b981', title: 'Benefícios 2026 — escolha seu plano até 25/03',                  preview: 'O período de escolha do plano de saúde e benefícios para o ano de 2026 está aberto. Acesse o portal RH para selecionar.', author: 'Ana Lima',      date: '12 Mar 2026', initials: 'AL', color: '#10b981', unread: true  },
  { id: 'c3', tag: 'Operações',  tagColor: '#8b5cf6', title: 'Manutenção programada — sistemas XP dia 20/03',                  preview: 'Os sistemas da XP Investimentos passarão por manutenção entre 22h e 2h do dia 20/03. Ordens agendadas podem sofrer atraso.', author: 'Pedro Oliveira', date: '10 Mar 2026', initials: 'PO', color: '#8b5cf6', unread: false },
  { id: 'c4', tag: 'Gestão',    tagColor: '#B8963E', title: 'Missão Q2 2026 — regras e premiações publicadas',               preview: 'As missões do segundo trimestre foram publicadas. Novos desafios com foco em captação líquida, NPS e expansão de base.', author: 'Rafael Brandão', date: '05 Mar 2026', initials: 'RB', color: '#B8963E', unread: false },
  { id: 'c5', tag: 'Compliance', tagColor: '#3b82f6', title: 'Treinamento obrigatório ANBIMA — prazo 31/03',                  preview: 'Todos os assessores certificados devem completar o módulo de atualização ANBIMA CPA-20 antes do prazo.',              author: 'Marina Santos', date: '01 Mar 2026', initials: 'MS', color: '#3b82f6', unread: false },
  { id: 'c6', tag: 'RH',         tagColor: '#10b981', title: 'Bem-vindos — novos colaboradores de abril',                     preview: 'Apresentamos os 3 novos assessores que iniciam em abril: Lucas Mendes (SP), Fernanda Costa (RJ) e Bruno Alves (BH).',  author: 'Ana Lima',      date: '28 Fev 2026', initials: 'AL', color: '#10b981', unread: false },
  { id: 'c7', tag: 'Operações',  tagColor: '#8b5cf6', title: 'Novo fluxo de abertura de contas PJ',                           preview: 'A partir de março, o processo de onboarding de pessoa jurídica terá uma etapa adicional de validação societária.',         author: 'Pedro Oliveira', date: '24 Fev 2026', initials: 'PO', color: '#8b5cf6', unread: false },
]

const TAGS = ['Todos', 'Gestão', 'Compliance', 'RH', 'Operações'] as const
type Tag = typeof TAGS[number]

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 10,
  border: '1px solid rgba(184,150,62,0.12)',
  boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
}

export default function ComunicadosPage() {
  const [activeTag, setActiveTag] = useState<Tag>('Todos')

  const filtered = activeTag === 'Todos'
    ? COMUNICADOS
    : COMUNICADOS.filter((c) => c.tag === activeTag)

  const unreadCount = filtered.filter((c) => c.unread).length

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', marginBottom: 4 }}>
            {unreadCount > 0 ? `${unreadCount} não lido${unreadCount > 1 ? 's' : ''}` : 'Tudo lido'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 24, fontWeight: 600, color: '#1A1209' }}>Comunicados</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1A1209', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: '#F6F3ED', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo comunicado
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(184,150,62,0.12)', paddingBottom: 0 }}>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTag === tag ? '2px solid #B8963E' : '2px solid transparent',
              fontSize: 13,
              fontWeight: activeTag === tag ? 600 : 400,
              color: activeTag === tag ? '#1A1209' : 'rgba(26,18,9,0.45)',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'all 0.15s',
            }}
          >
            {tag}
            {tag !== 'Todos' && (
              <span style={{ marginLeft: 5, fontSize: 10, color: 'rgba(26,18,9,0.35)' }}>
                ({COMUNICADOS.filter((c) => c.tag === tag).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pinned (só exibe no "Todos") */}
      {activeTag === 'Todos' && PINNED.map((p) => (
        <div key={p.id} style={{ ...card, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #B8963E, #D4A96A)' }} />
          <div style={{ padding: '20px 24px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8963E', background: 'rgba(184,150,62,0.1)', padding: '3px 8px', borderRadius: 3 }}>
                📌 Fixado · {p.tag}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 18, fontWeight: 600, color: '#1A1209', marginBottom: 10, lineHeight: 1.35 }}>{p.title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(26,18,9,0.55)', lineHeight: 1.7, marginBottom: 16 }}>{p.body}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${p.color}, ${p.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{p.initials}</div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1209' }}>{p.author}</span>
                <span style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)', marginLeft: 8 }}>{p.date}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(26,18,9,0.35)', fontSize: 13, background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10 }}>
          Nenhum comunicado em &quot;{activeTag}&quot;.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(184,150,62,0.1)', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden' }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: c.unread ? '#fffef9' : '#fff',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                cursor: 'pointer',
                borderLeft: c.unread ? '3px solid #B8963E' : '3px solid transparent',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(184,150,62,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = c.unread ? '#fffef9' : '#fff')}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${c.color}, ${c.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2 }}>{c.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.tagColor }}>{c.tag}</span>
                  {c.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B8963E', flexShrink: 0 }} />}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: c.unread ? 600 : 500, color: '#1A1209', marginBottom: 4, lineHeight: 1.35 }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.45)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(26,18,9,0.3)', whiteSpace: 'nowrap' }}>{c.date}</div>
                <div style={{ fontSize: 11, color: 'rgba(26,18,9,0.35)', marginTop: 2 }}>{c.author}</div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
