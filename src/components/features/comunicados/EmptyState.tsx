import { cn } from '@/lib/utils'
import { Megaphone, Plus } from 'lucide-react'
import type { FiltroComunicado } from './FiltrosComunicados'

interface EmptyStateProps {
  /**
   * Filtro atualmente ativo.
   * Se diferente de 'Todos', exibe mensagem específica para a categoria.
   */
  filtroAtivo: FiltroComunicado
  /** Se true, exibe o botão "+ Novo comunicado" (visível apenas para RH/Diretoria) */
  podeNovo?: boolean
  /** Ação ao clicar em "+ Novo comunicado" */
  onNovoComunicado?: () => void
  className?: string
}

/**
 * Estado vazio para a listagem de comunicados.
 *
 * Dois modos:
 * - `filtroAtivo !== 'Todos'` → "Nenhum comunicado em [categoria]."
 * - `filtroAtivo === 'Todos'` → "Nenhum comunicado publicado ainda." + CTA opcional
 *
 * O botão "+ Novo comunicado" só é renderizado quando `podeNovo=true` e
 * não há filtro ativo. Nunca exibir desabilitado — simplesmente omitir para `membro`.
 */
export function EmptyState({
  filtroAtivo,
  podeNovo = false,
  onNovoComunicado,
  className,
}: EmptyStateProps) {
  const comFiltro = filtroAtivo !== 'Todos'

  const mensagem = comFiltro
    ? `Nenhum comunicado em ${filtroAtivo}.`
    : 'Nenhum comunicado publicado ainda.'

  const submensagem = comFiltro
    ? 'Tente selecionar outra categoria ou remover o filtro.'
    : 'Os comunicados publicados aparecerão aqui.'

  return (
    <output
      aria-label={mensagem}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-[rgba(184,150,62,0.12)] bg-white px-6 py-12 text-center',
        className,
      )}
    >
      {/* Ícone decorativo */}
      <span
        aria-hidden="true"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(184,150,62,0.08)]"
      >
        <Megaphone size={28} className="text-[#B8963E] opacity-70" strokeWidth={1.5} />
      </span>

      {/* Texto */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#3D3D3D]">{mensagem}</p>
        <p className="text-xs text-[rgba(26,18,9,0.4)]">{submensagem}</p>
      </div>

      {/* CTA — somente para quem pode criar e sem filtro ativo */}
      {podeNovo && !comFiltro && (
        <button
          type="button"
          onClick={onNovoComunicado}
          aria-label="Criar novo comunicado"
          className={cn(
            'mt-2 inline-flex items-center gap-1.5 rounded-md px-4 py-2',
            'bg-[#1A1209] text-white text-xs font-semibold tracking-[0.05em] uppercase',
            'transition-all duration-150',
            'hover:bg-[#2a1f0d] hover:shadow-md',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8963E] focus-visible:ring-offset-1',
          )}
        >
          <Plus size={13} aria-hidden="true" strokeWidth={2.5} />
          Novo comunicado
        </button>
      )}
    </output>
  )
}
