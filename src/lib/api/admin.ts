import { apiFetch as workerFetch } from './fetch'

export type UsuarioAcesso = {
  email: string
  nome: string
  role: string
  ultimoAcesso: string
  totalDias: number
  diasUltimos7: number
  diasUltimos30: number
  acessouHoje: number // 0 or 1
}

export type ResumoAcessos = {
  ativosHoje: number
  ativosUltimos7Dias: number
  ativosUltimos30Dias: number
  totalUsuarios: number
}

export type RelatorioAcessos = {
  usuarios: UsuarioAcesso[]
  resumo: ResumoAcessos
}

export async function logDailyAccess(session: {
  email: string
  name: string
  role: string
}): Promise<void> {
  try {
    await workerFetch('/admin/log-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.email, nome: session.name, role: session.role }),
      cache: 'no-store',
    })
  } catch {
    // silently fail — logging must never break the app
  }
}

export async function getRelatorioAcessos(role: string): Promise<RelatorioAcessos> {
  const res = await workerFetch('/admin/acessos', {
    headers: { 'X-User-Role': role },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`)
  const json = (await res.json()) as { data: RelatorioAcessos }
  return json.data
}
