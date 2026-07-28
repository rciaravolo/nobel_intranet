import { NovaSenhaForm } from './NovaSenhaForm'

export default async function NovaSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <NovaSenhaForm token={token ?? ''} />
}
