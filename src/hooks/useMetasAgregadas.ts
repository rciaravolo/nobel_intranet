'use client'

import { useQuery } from '@tanstack/react-query'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

export type MetaAgregada = { realizado: number; meta: number }

export type MetasAgregadasData = {
  captacao: MetaAgregada
  receita: MetaAgregada
}

/* ─── Fetch ──────────────────────────────────────────────────────────────── */
/*
 * Busca via proxy Next.js (mesmo padrão de BlocoCaptacao/BlocoReceita — nunca
 * chamar o Worker direto do client, o proxy é quem injeta os headers de auth).
 * BlocoMetaCaptacao e BlocoMetaReceita usam este mesmo hook com a mesma
 * queryKey, então o TanStack Query deduplica e só dispara UM fetch de rede
 * mesmo com os 2 componentes montados na página.
 */
async function fetchMetasAgregadas(
  filterType?: string,
  filterValue?: string,
): Promise<MetasAgregadasData> {
  const qs = new URLSearchParams()
  if (filterType) qs.set('filter_type', filterType)
  if (filterValue) qs.set('filter_value', filterValue)
  const url = `/api/performance/metas-agregadas${qs.size ? `?${qs}` : ''}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`)

  const json = (await res.json()) as { data: MetasAgregadasData }
  return json.data
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useMetasAgregadas(filterType?: string, filterValue?: string) {
  return useQuery({
    queryKey: ['analises', 'metas-agregadas', filterType ?? null, filterValue ?? null],
    queryFn: () => fetchMetasAgregadas(filterType, filterValue),
    staleTime: 5 * 60 * 1000,
  })
}
