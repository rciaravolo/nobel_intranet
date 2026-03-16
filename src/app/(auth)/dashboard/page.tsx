import { requireSession } from '@/lib/auth/session'

const KPI_DATA = [
  {
    label: 'AUM Total',
    value: 'R$ 2,4B',
    delta: '+12,4%',
    up: true,
    sub: 'vs mês anterior',
    gold: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="15" height="15">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: 'Clientes Ativos',
    value: '1.847',
    delta: '+34',
    up: true,
    sub: 'este mês',
    gold: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="15" height="15">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: 'Retorno Médio',
    value: '18,7%',
    delta: '+2,1pp',
    up: true,
    sub: 'vs CDI',
    gold: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="15" height="15">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Captação Mar.',
    value: 'R$ 48M',
    delta: '−8,2%',
    up: false,
    sub: 'vs fevereiro',
    gold: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="15" height="15">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
]

const ACTIVITY = [
  { dot: 'gold',  title: 'Novo aporte confirmado — R$ 2,5M',      meta: 'Cliente Pessoa Física · há 12 min' },
  { dot: 'green', title: 'Relatório mensal gerado com sucesso',    meta: 'Fundo Nobel Prev · há 1h' },
  { dot: 'blue',  title: 'Reunião de comitê agendada',            meta: 'Amanhã às 10h · Sala Boardroom' },
  { dot: 'gold',  title: 'Novo cliente onboarding completo',      meta: 'Pessoa Jurídica · há 3h' },
  { dot: 'gray',  title: 'Compliance: documentação aprovada',     meta: '3 documentos · há 5h' },
  { dot: 'gray',  title: 'Rebalanceamento executado — MULT11',    meta: 'Carteira Conservadora · ontem' },
]

const TEAM = [
  { initials: 'RC', name: 'Rafael Ciaravolo', dept: 'Gestão · Sócio',    color: '#B8963E', status: 'online' },
  { initials: 'MS', name: 'Marina Santos',    dept: 'Compliance',         color: '#3b82f6', status: 'online' },
  { initials: 'PO', name: 'Pedro Oliveira',   dept: 'Assessor Sênior',   color: '#8b5cf6', status: 'away'   },
  { initials: 'AL', name: 'Ana Lima',          dept: 'Operações',          color: '#10b981', status: 'online' },
  { initials: 'GF', name: 'Gabriel Ferreira', dept: 'Análise Quant',     color: '#f59e0b', status: 'offline'},
]

const AGENDA = [
  { time: '09:00', ampm: 'AM', title: 'Daily — Time Nobel',          where: 'Google Meet · 30 min',  highlight: true },
  { time: '10:30', ampm: 'AM', title: 'Reunião — Cliente PF',        where: 'Sala Nobel · Jardins',   highlight: false },
  { time: '14:00', ampm: 'PM', title: 'Comitê de Investimentos',     where: 'Boardroom · 2h',         highlight: false },
  { time: '16:30', ampm: 'PM', title: 'Review — Carteiras Q1',       where: 'Google Meet · 1h',       highlight: false },
]

const QUICK = [
  { label: 'Nova Proposta',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
  { label: 'Novo Cliente',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="14" height="14"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
  { label: 'Ver Posições',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { label: 'Base XP',          icon: <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { label: 'Agendar Reunião',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: 'Suporte TI',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="#B8963E" strokeWidth="1.5" width="14" height="14"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
]

const BAR_HEIGHTS = [60, 75, 55, 90, 70, 85, 100, 78]
const BAR_LABELS  = ['02/03','04/03','06/03','08/03','10/03','12/03','14/03','16/03']

const DOT_COLORS: Record<string, string> = {
  gold: '#B8963E', green: '#22c55e', blue: '#3b82f6', gray: '#D1D5DB',
}

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', offline: '#374151',
}

// card styles
const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  overflow: 'hidden',
}

const cardHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 24px 14px',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
}

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-lora, serif)',
  fontSize: 15,
  fontWeight: 500,
  color: '#0A0A0A',
}

const cardAction: React.CSSProperties = {
  fontSize: 12,
  color: '#B8963E',
  fontWeight: 500,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
}

export default async function DashboardPage() {
  const session = await requireSession()
  const firstName = session.name.split(' ')[0]

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 13, color: '#8A8A8A', marginBottom: 4 }}>Bem-vindo de volta</p>
          <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 26, fontWeight: 500, color: '#0A0A0A' }}>
            Bom dia, <span style={{ color: '#B8963E' }}>{firstName}</span> ✦
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#3D3D3D', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Exportar
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#B8963E', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(184,150,62,0.3)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo relatório
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {KPI_DATA.map((kpi) => (
          <div key={kpi.label} style={{ ...card, position: 'relative' }}>
            {kpi.gold && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #B8963E, #D4A96A)' }} />
            )}
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{kpi.label}</span>
                <div style={{ width: 30, height: 30, background: 'rgba(184,150,62,0.06)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{kpi.icon}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 28, fontWeight: 500, color: '#0A0A0A', marginBottom: 6, lineHeight: 1 }}>{kpi.value}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: kpi.up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: kpi.up ? '#16a34a' : '#dc2626' }}>
                {kpi.up ? '↑' : '↓'} {kpi.delta} {kpi.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

        {/* Chart */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>Evolução de Captação</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['7d','30d','90d','12m'].map((t) => (
                <button key={t} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: t === '30d' ? 'rgba(184,150,62,0.12)' : 'transparent', color: t === '30d' ? '#B8963E' : '#8A8A8A', border: 'none' }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: 3, height: 140 }}>
                    <div style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(180deg, #D4A96A, #B8963E)', borderRadius: '4px 4px 0 0' }} />
                    <div style={{ flex: 1, height: `${h * 0.72}%`, background: '#ECEAE4', borderRadius: '4px 4px 0 0' }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#B0B0B0' }}>{BAR_LABELS[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8A8A8A' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#B8963E' }} /> Captação bruta
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8A8A8A' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ECEAE4' }} /> Resgates
              </div>
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>Atividade Recente</span>
            <button style={cardAction}>Ver tudo →</button>
          </div>
          <div>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 24px', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                <div style={{ paddingTop: 5, flexShrink: 0 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: DOT_COLORS[a.dot] ?? '#ccc' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: '#0A0A0A', lineHeight: 1.4 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 2 }}>{a.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16 }}>

        {/* Quick links */}
        <div style={card}>
          <div style={cardHeader}><span style={cardTitle}>Acesso Rápido</span></div>
          <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {QUICK.map((q) => (
              <button key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: '#F5F4F0', borderRadius: 8, cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.15s', textAlign: 'left' }}>
                <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>{q.icon}</div>
                <span style={{ fontSize: 12, color: '#3D3D3D', fontWeight: 500 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>Equipe Online</span>
            <button style={cardAction}>Ver todos →</button>
          </div>
          <div>
            {TEAM.map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${m.color}, ${m.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{m.initials}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: '#0A0A0A' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 1 }}>{m.dept}</div>
                </div>
                <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[m.status], boxShadow: m.status === 'online' ? '0 0 0 2px rgba(34,197,94,0.2)' : 'none' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Agenda */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>Agenda de Hoje</span>
            <button style={cardAction}>Semana →</button>
          </div>
          <div>
            {AGENDA.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '11px 24px' }}>
                <div style={{ textAlign: 'right', flexShrink: 0, width: 42 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#B8963E', fontVariantNumeric: 'tabular-nums' }}>{a.time}</div>
                  <div style={{ fontSize: 9, color: '#B0B0B0', textTransform: 'uppercase' }}>{a.ampm}</div>
                </div>
                <div style={{ width: 2, borderRadius: 2, background: a.highlight ? '#B8963E' : 'rgba(184,150,62,0.15)', flexShrink: 0, alignSelf: 'stretch', marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: '#0A0A0A', lineHeight: 1.3 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: '#8A8A8A', marginTop: 2 }}>{a.where}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
