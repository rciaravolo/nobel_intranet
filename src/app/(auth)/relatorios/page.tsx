import { MateriaisList } from '@/components/features/materiais/MateriaisList'
import { requireSession } from '@/lib/auth/session'
import { PageGreeting } from '../_components/PageGreeting'

const WRITE_ROLES = new Set(['admin', 'master'])

export const metadata = {
  title: 'Relatórios — INTRA Nobel Capital',
}

export default async function RelatoriosPage() {
  const session = await requireSession()
  const canManage = WRITE_ROLES.has(session.role)

  return (
    <div style={{ maxWidth: 1000 }}>
      <PageGreeting name={session.name} label="Relatórios · Materiais" />
      <MateriaisList canManage={canManage} />
    </div>
  )
}
