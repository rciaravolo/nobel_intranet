'use client'

import { cn } from '@/lib/utils'
import type { Categoria } from './CategoriaBadge'

/** Valor possível de filtro — inclui 'Todos' para exibir todos. */
export type FiltroComunicado = Categoria | 'Todos'

const FILTROS: FiltroComunicado[] = ['Todos', 'RH', 'Produtos', 'PJ2']

interface FiltrosComunicadosProps {
  /** Filtro atualmente selecionado. Controla externamente o estado. */
  filtroAtivo: FiltroComunicado
  /** Chamado quando o usuário clica em um filtro. */
  onFiltroChange: (categoria: FiltroComunicado) => void
}

/**
 * Barra de filtros rápidos para a listagem de comunicados.
 *
 * Componente controlado — recebe `filtroAtivo` e emite `onFiltroChange`.
 * Estado gerenciado pelo componente pai (ComunicadosList).
 *
 * Pills: Todos | RH | Produtos | PJ2
 * - Pill ativo: fundo sólido dourado Nobel (#B8963E)
 * - Pill inativo: borda sutil, fundo transparente
 */
export function FiltrosComunicados({ filtroAtivo, onFiltroChange }: FiltrosComunicadosProps) {
  return (
    <nav
      aria-label="Filtros de categoria de comunicados"
      className="flex items-center gap-1.5 flex-wrap mb-4"
    >
      {FILTROS.map((filtro) => {
        const isAtivo = filtro === filtroAtivo
        return (
          <button
            key={filtro}
            type="button"
            onClick={() => onFiltroChange(filtro)}
            aria-pressed={isAtivo}
            aria-label={
              filtro === 'Todos' ? 'Exibir todos os comunicados' : `Filtrar por categoria ${filtro}`
            }
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 leading-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8963E] focus-visible:ring-offset-1',
              isAtivo
                ? 'bg-[#B8963E] text-white shadow-sm'
                : 'border border-[rgba(184,150,62,0.3)] text-[rgba(26,18,9,0.55)] hover:border-[#B8963E] hover:text-[#B8963E] bg-transparent',
            )}
          >
            {filtro}
          </button>
        )
      })}
    </nav>
  )
}
