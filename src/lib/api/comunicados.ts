/**
 * Cliente tipado para a API de comunicados.
 * Consome o Cloudflare Worker em NEXT_PUBLIC_API_URL.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export type ComunicadoCategoria = 'RH' | 'Produtos' | 'PJ2'

export type Comunicado = {
  id: string
  titulo: string
  conteudo: string
  categoria: ComunicadoCategoria
  fixado: boolean
  autorEmail: string
  autorNome: string
  criadoEm: string
  atualizadoEm: string
  dataExpiracao: string | null
  ativo: boolean
}

export type CriarComunicadoInput = {
  titulo: string
  conteudo: string
  categoria: ComunicadoCategoria
  fixado?: boolean
  dataExpiracao?: string | null
}

export type ListarComunicadosParams = {
  categoria?: ComunicadoCategoria
  incluirExpirados?: boolean
}

// ---------------------------------------------------------------------------
// Helper interno: fetch com tratamento de erro HTTP
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let message = `Erro HTTP ${res.status}`
    try {
      const json = (await res.json()) as { error?: string }
      if (json.error) message = json.error
    } catch {
      // não conseguiu parsear — mantém a mensagem genérica
    }
    throw new Error(message)
  }

  const json = (await res.json()) as { data: T }
  return json.data
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export const comunicadosApi = {
  /**
   * Lista comunicados ativos. Por padrão exclui expirados.
   */
  list: (params?: ListarComunicadosParams): Promise<Comunicado[]> => {
    const qs = new URLSearchParams()
    if (params?.categoria) qs.set('categoria', params.categoria)
    if (params?.incluirExpirados !== undefined) {
      qs.set('incluirExpirados', String(params.incluirExpirados))
    }
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return apiFetch<Comunicado[]>(`/comunicados${query}`)
  },

  /**
   * Busca um comunicado pelo ID (inclui expirados/arquivados).
   */
  get: (id: string): Promise<Comunicado> => {
    return apiFetch<Comunicado>(`/comunicados/${id}`)
  },

  /**
   * Cria um novo comunicado. Requer role RH ou Diretoria no Worker.
   */
  create: (data: CriarComunicadoInput): Promise<Comunicado> => {
    return apiFetch<Comunicado>('/comunicados', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza campos de um comunicado existente.
   */
  update: (id: string, data: Partial<CriarComunicadoInput>): Promise<Comunicado> => {
    return apiFetch<Comunicado>(`/comunicados/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Soft delete — define ativo=false no Worker.
   */
  delete: (id: string): Promise<void> => {
    return apiFetch<void>(`/comunicados/${id}`, { method: 'DELETE' })
  },
}
