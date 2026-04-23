'use client'

/**
 * ComunicadosList — Client Component
 *
 * Recebe os comunicados iniciais como prop (hydration do Server Component),
 * usa TanStack Query para refetch e gerencia o estado de filtro ativo.
 *
 * TODO: instalar @tanstack/react-query quando disponível:
 *   npm install @tanstack/react-query
 * Por ora, usa useState + useEffect para simular o comportamento.
 */

import type { Comunicado } from '@/lib/api/comunicados'
import { comunicadosApi } from '@/lib/api/comunicados'
import { useCallback, useEffect, useState } from 'react'

// Componentes visuais do design-intranet
import { ComunicadoCard } from '@/components/features/comunicados/ComunicadoCard'
import { ComunicadoSkeleton } from '@/components/features/comunicados/ComunicadoSkeleton'
import { EmptyState } from '@/components/features/comunicados/EmptyState'
import {
  type FiltroComunicado,
  FiltrosComunicados,
} from '@/components/features/comunicados/FiltrosComunicados'

// TODO: substituir por useQuery do TanStack Query quando instalado:
// import { useQuery } from '@tanstack/react-query'

type Props = {
  initialData: Comunicado[]
  podeNovo: boolean
}

export function ComunicadosList({ initialData, podeNovo }: Props) {
  const [filtro, setFiltro] = useState<FiltroComunicado>('Todos')
  const [comunicados, setComunicados] = useState<Comunicado[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // TODO: substituir por useQuery quando @tanstack/react-query instalado:
  // const { data: comunicados, isLoading, isError, refetch } = useQuery({
  //   queryKey: ['comunicados', filtro],
  //   queryFn: () =>
  //     comunicadosApi.list(filtro !== 'Todos' ? { categoria: filtro } : undefined),
  //   initialData: filtro === 'Todos' ? initialData : undefined,
  // })

  const fetchComunicados = useCallback(async (categoria: FiltroComunicado) => {
    setIsLoading(true)
    setIsError(false)
    try {
      const data = await comunicadosApi.list(
        categoria !== 'Todos'
          ? { categoria: categoria as Exclude<FiltroComunicado, 'Todos'> }
          : undefined,
      )
      setComunicados(data)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // No mount, já temos initialData para 'Todos'; só busca ao trocar filtro
    if (filtro === 'Todos' && comunicados === initialData) return
    fetchComunicados(filtro)
    // biome-ignore lint/correctness/useExhaustiveDependencies: dependências intencionalmente omitidas — fetchComunicados é estável (useCallback sem deps) e comunicados/initialData são usados apenas como condição de skip no mount
  }, [filtro])

  const fixados = comunicados.filter((c) => c.fixado)
  const normais = comunicados.filter((c) => !c.fixado)

  if (isLoading) {
    return <ComunicadoSkeleton count={4} />
  }

  if (isError) {
    return (
      <div
        role="alert"
        style={{
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: '#991b1b',
        }}
      >
        <span>Não foi possível carregar os comunicados. Tente novamente.</span>
        <button
          type="button"
          onClick={() => fetchComunicados(filtro)}
          style={{
            marginLeft: 16,
            padding: '6px 14px',
            background: '#991b1b',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <FiltrosComunicados filtroAtivo={filtro} onFiltroChange={setFiltro} />

      {/* Comunicados fixados (apenas no filtro "Todos") */}
      {filtro === 'Todos' && fixados.length > 0 && (
        <div className="mb-4 space-y-3">
          {fixados.map((c) => (
            <ComunicadoCard
              key={c.id}
              id={c.id}
              titulo={c.titulo}
              conteudo={c.conteudo}
              categoria={c.categoria}
              fixado={c.fixado}
              autorNome={c.autorNome}
              autorEmail={c.autorEmail}
              criadoEm={c.criadoEm}
              dataExpiracao={c.dataExpiracao}
            />
          ))}
        </div>
      )}

      {/* Lista normal */}
      {normais.length === 0 ? (
        <EmptyState filtroAtivo={filtro} podeNovo={podeNovo} />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'rgba(184,150,62,0.1)',
            border: '1px solid rgba(184,150,62,0.12)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {normais.map((c) => (
            <ComunicadoCard
              key={c.id}
              id={c.id}
              titulo={c.titulo}
              conteudo={c.conteudo}
              categoria={c.categoria}
              fixado={c.fixado}
              autorNome={c.autorNome}
              autorEmail={c.autorEmail}
              criadoEm={c.criadoEm}
              dataExpiracao={c.dataExpiracao}
            />
          ))}
        </div>
      )}
    </div>
  )
}
