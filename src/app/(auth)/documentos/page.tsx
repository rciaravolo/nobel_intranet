import { requireSession } from '@/lib/auth/session'

export default async function DocumentosPage() {
  await requireSession()
  return (
    <ComingSoon
      title="Documentos"
      desc="Repositório centralizado de documentos, contratos, formulários e materiais regulatórios da Nobel Capital."
      icon="📁"
      items={[
        'Contratos e termos de adesão',
        'Formulários ANBIMA e CVM',
        'Materiais de suitability',
        'Procurações e documentos PJ',
        'Templates de proposta comercial',
      ]}
    />
  )
}

function ComingSoon({
  title,
  desc,
  icon,
  items,
}: { title: string; desc: string; icon: string; items: string[] }) {
  return (
    <div style={{ maxWidth: 700, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 20 }}>{icon}</div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#B8963E',
          background: 'rgba(184,150,62,0.1)',
          padding: '4px 12px',
          borderRadius: 20,
        }}
      >
        Em desenvolvimento
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-lora, serif)',
          fontSize: 32,
          fontWeight: 600,
          color: '#1A1209',
          margin: '18px 0 12px',
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(26,18,9,0.5)', lineHeight: 1.7, marginBottom: 36 }}>
        {desc}
      </p>
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(184,150,62,0.12)',
          borderRadius: 12,
          padding: '28px 32px',
          textAlign: 'left',
          boxShadow: '0 1px 4px rgba(26,18,9,0.05)',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(26,18,9,0.35)',
            marginBottom: 16,
          }}
        >
          Funcionalidades planejadas
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: '#1A1209',
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#B8963E',
                  flexShrink: 0,
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
