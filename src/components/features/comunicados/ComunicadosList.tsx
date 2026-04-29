'use client'

import type { Comunicado } from '@/lib/api/comunicados'
import { comunicadosApi } from '@/lib/api/comunicados'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { ComunicadoCard } from '@/components/features/comunicados/ComunicadoCard'
import { ComunicadoSkeleton } from '@/components/features/comunicados/ComunicadoSkeleton'
import { EmptyState } from '@/components/features/comunicados/EmptyState'
import {
  type FiltroComunicado,
  FiltrosComunicados,
} from '@/components/features/comunicados/FiltrosComunicados'

type Props = {
  initialData: Comunicado[]
  podeNovo: boolean
}

export function ComunicadosList({ initialData, podeNovo }: Props) {
  const [filtro, setFiltro] = useState<FiltroComunicado>('Todos')

  const {
    data: comunicados = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['comunicados', filtro],
    queryFn: () => comunicadosApi.list(filtro !== 'Todos' ? { categoria: filtro } : undefined),
    initialData: filtro === 'Todos' ? initialData : undefined,
  })

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
          onClick={() => refetch()}
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

      {comunicados.length === 0 ? (
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
          {comunicados.map((c) => (
            <ComunicadoCard
              key={c.id}
              id={c.id}
              titulo={c.titulo}
              conteudo={c.conteudo}
              categoria={c.categoria}
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
