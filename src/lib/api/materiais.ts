export type Material = {
  id: string
  titulo: string
  descricao: string | null
  arquivoNome: string
  arquivoKey: string
  arquivoSize: number
  arquivoMime: string
  publicadoPor: string
  publicadoEm: string
  atualizadoEm: string
}

export type EditarMaterialInput = {
  titulo?: string
  descricao?: string | null
}

async function extractError(res: Response): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string }
    if (json.error) return json.error
  } catch {
    // segue
  }
  return `Erro HTTP ${res.status}`
}

export const materiaisApi = {
  list: async (): Promise<Material[]> => {
    const res = await fetch('/api/materiais', { cache: 'no-store' })
    if (!res.ok) throw new Error(await extractError(res))
    const json = (await res.json()) as { data: Material[] }
    return json.data
  },

  upload: async (payload: {
    titulo: string
    descricao?: string
    arquivo: File
  }): Promise<Material> => {
    const fd = new FormData()
    fd.append('titulo', payload.titulo)
    if (payload.descricao) fd.append('descricao', payload.descricao)
    fd.append('arquivo', payload.arquivo)

    const res = await fetch('/api/materiais', { method: 'POST', body: fd })
    if (!res.ok) throw new Error(await extractError(res))
    const json = (await res.json()) as { data: Material }
    return json.data
  },

  update: async (id: string, patch: EditarMaterialInput): Promise<Material> => {
    const res = await fetch(`/api/materiais/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error(await extractError(res))
    const json = (await res.json()) as { data: Material }
    return json.data
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`/api/materiais/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(await extractError(res))
  },

  downloadUrl: (id: string): string => `/api/materiais/${id}/download`,
}
