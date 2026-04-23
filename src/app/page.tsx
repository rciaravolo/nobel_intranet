import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Landing from './_landing/Landing'

export default async function RootPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')
  return <Landing />
}
