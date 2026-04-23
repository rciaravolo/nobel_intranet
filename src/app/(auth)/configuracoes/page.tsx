import { requireSession } from '@/lib/auth/session'

export default async function ConfiguracoesPage() {
  const session = await requireSession()
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', marginBottom: 4 }}>Conta e preferências</p>
        <h1 style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 24, fontWeight: 600, color: '#1A1209' }}>Configurações</h1>
      </div>

      {/* Perfil */}
      <div style={{ background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,18,9,0.05)', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(184,150,62,0.09)', background: '#F6F3ED' }}>
          <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>Perfil</span>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #B8963E, #8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-lora, serif)', flexShrink: 0 }}>
              {session.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1209', marginBottom: 3 }}>{session.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(26,18,9,0.45)', textTransform: 'capitalize' }}>{session.role} · Nobel Capital</div>
            </div>
          </div>
          {[
            { label: 'Nome',  value: session.name },
            { label: 'Cargo', value: session.role  },
            { label: 'E-mail', value: 'rafael.brandao@nobelcapital.com.br' },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: '1px solid rgba(184,150,62,0.07)' }}>
              <span style={{ fontSize: 12, color: 'rgba(26,18,9,0.4)', width: 80, flexShrink: 0 }}>{f.label}</span>
              <span style={{ fontSize: 13, color: '#1A1209', fontWeight: 500 }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integrações */}
      <div style={{ background: '#fff', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(26,18,9,0.05)', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(184,150,62,0.09)', background: '#F6F3ED' }}>
          <span style={{ fontFamily: 'var(--font-lora, serif)', fontSize: 14, fontWeight: 500, color: '#1A1209' }}>Integrações</span>
        </div>
        <div style={{ padding: '4px 0' }}>
          {[
            { name: 'Microsoft Outlook', desc: 'Calendário e e-mail corporativo', status: process.env.MSGRAPH_CLIENT_ID ? 'conectado' : 'não configurado', icon: '📅' },
            { name: 'XP Hub',            desc: 'Plataforma de assessoria XP',    status: 'externo', icon: '⭐' },
            { name: 'Alocação Nobel',    desc: 'Plataforma de alocação interna', status: 'externo', icon: '🏆' },
          ].map((int) => (
            <div key={int.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid rgba(184,150,62,0.07)' }}>
              <span style={{ fontSize: 20 }}>{int.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1209' }}>{int.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(26,18,9,0.4)', marginTop: 1 }}>{int.desc}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '3px 10px', borderRadius: 20,
                background: int.status === 'conectado' ? 'rgba(5,150,105,0.1)' : int.status === 'externo' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                color:      int.status === 'conectado' ? '#059669'             : int.status === 'externo' ? '#2563eb'             : '#d97706',
              }}>
                {int.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 18px', background: 'rgba(184,150,62,0.05)', border: '1px solid rgba(184,150,62,0.12)', borderRadius: 8, fontSize: 12, color: 'rgba(26,18,9,0.5)', lineHeight: 1.6 }}>
        Para configurar a integração com o Outlook Calendar, adicione as variáveis <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3 }}>MSGRAPH_TENANT_ID</code>, <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3 }}>MSGRAPH_CLIENT_ID</code> e <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3 }}>MSGRAPH_CLIENT_SECRET</code> ao projeto no Vercel.
      </div>
    </div>
  )
}
