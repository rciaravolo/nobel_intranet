import type { SessionPayload } from './session'

/**
 * Monta os headers X-User-* padrão para chamadas Next→Worker.
 * Omite campos ausentes na sessão (equipe, idAssessor).
 */
export function authHeaders(session: SessionPayload, extras?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = {
    'X-User-Role': session.role,
    'X-User-Email': session.email,
  }
  if (session.equipe) h['X-User-Equipe'] = session.equipe
  if (session.idAssessor) h['X-User-Id-Assessor'] = session.idAssessor
  if (extras) Object.assign(h, extras)
  return h
}
