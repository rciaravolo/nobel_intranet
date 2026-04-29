/**
 * Helper de sessão para Cloudflare Access.
 *
 * Em produção, o CF Access injeta o JWT no header `Cf-Access-Jwt-Assertion`.
 * O payload contém `email` e `name` do usuário autenticado.
 *
 * A role é resolvida consultando a API do Worker (/me/role) ou, como fallback,
 * retornada como null quando não encontrada na tabela user_roles.
 *
 * Em desenvolvimento local (sem CF Access), retorna um usuário mock de diretoria
 * para facilitar o desenvolvimento.
 */
import { headers } from 'next/headers'

export type SessionUser = {
  email: string
  name: string
  /** null = usuário autenticado mas sem role na tabela user_roles */
  role: 'rh' | 'diretoria' | 'membro' | null
}

// ---------------------------------------------------------------------------
// Decode simples do payload JWT (sem verificação de assinatura —
// a verificação é feita pelo Cloudflare Access antes de chegar aqui)
// ---------------------------------------------------------------------------

function decodeJwtPayload(token: string): { email?: string; name?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = Buffer.from(parts[1] as string, 'base64url').toString('utf8')
    return JSON.parse(payload) as { email?: string; name?: string }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Mock de desenvolvimento
// ---------------------------------------------------------------------------

const DEV_USER: SessionUser = {
  email: 'rafael.brandao@nobelcapital.com.br',
  name: 'Rafael Brandão',
  role: 'diretoria',
}

// ---------------------------------------------------------------------------
// getSessionUser
// ---------------------------------------------------------------------------

/**
 * Extrai os dados do usuário a partir do header `Cf-Access-Jwt-Assertion`.
 *
 * - Em dev local (NODE_ENV !== 'production' e sem header CF), retorna DEV_USER.
 * - Em produção sem header válido, retorna null.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const headerStore = await headers()
  const jwtAssertion = headerStore.get('cf-access-jwt-assertion')

  // Ambiente de desenvolvimento sem CF Access
  if (!jwtAssertion) {
    if (process.env.NODE_ENV !== 'production') {
      return DEV_USER
    }
    return null
  }

  const payload = decodeJwtPayload(jwtAssertion)
  if (!payload?.email) return null

  // Consulta a role do usuário na API do Worker
  // TODO: quando /v1/me/role estiver disponível no Worker, descomentar:
  // try {
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/role`, {
  //     headers: { 'Cf-Access-Jwt-Assertion': jwtAssertion },
  //     cache: 'no-store',
  //   })
  //   const json = await res.json() as { role?: SessionUser['role'] }
  //   role = json.role ?? null
  // } catch {
  //   role = null
  // }

  return {
    email: payload.email,
    name: payload.name ?? payload.email,
    role: null, // será resolvido quando endpoint /me/role existir
  }
}

/**
 * Retorna true se o usuário tem permissão para criar/editar comunicados.
 */
export function podeCriarComunicado(user: SessionUser | null): boolean {
  return user?.role === 'rh' || user?.role === 'diretoria'
}

/**
 * Retorna true se o usuário pode editar/arquivar um comunicado específico.
 * Diretoria pode editar qualquer um; RH só pode editar os próprios.
 */
export function podeEditarComunicado(user: SessionUser | null, autorEmail: string): boolean {
  if (!user) return false
  if (user.role === 'diretoria') return true
  if (user.role === 'rh' && user.email === autorEmail) return true
  return false
}
