import { getCloudflareContext } from '@opennextjs/cloudflare'

const API_BASE = process.env.API_URL ?? 'https://intra-api.rafaelciaravolo.workers.dev'
const SECRET = process.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'

type Env = { INTRA_API?: { fetch: typeof fetch } }

/**
 * Chama o intra-api Worker.
 * Em produção usa Service Binding (bypassa Cloudflare Access).
 * Em dev local usa fetch HTTP normal.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${SECRET}`)

  let binding: Env['INTRA_API'] | undefined
  try {
    const { env } = getCloudflareContext() as { env: Env }
    binding = env.INTRA_API
  } catch {
    // fora do contexto Cloudflare (dev local) — usa HTTP
  }

  if (binding) {
    return binding.fetch(`https://intra-api.internal${path}`, { ...init, headers })
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers })
}
