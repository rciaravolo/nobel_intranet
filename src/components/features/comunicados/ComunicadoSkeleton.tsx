import { cn } from '@/lib/utils'

interface ComunicadoSkeletonProps {
  /** Quantidade de skeletons a renderizar. Padrão: 4 */
  count?: number
  className?: string
}

/**
 * Bloco pulsante que simula o layout de um ComunicadoCard durante o carregamento.
 * Usar `animate-pulse` do Tailwind para o efeito de loading.
 */
function SkeletonItem() {
  return (
    <output
      aria-label="Carregando comunicado"
      className="block bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-5 animate-pulse"
    >
      {/* Linha: badge categoria + eventual badge fixado */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-14 rounded-sm bg-[oklch(88%_0_0)]" />
      </div>

      {/* Título — 2 linhas */}
      <div className="space-y-1.5 mb-2">
        <div className="h-4 w-full rounded bg-[oklch(88%_0_0)]" />
        <div className="h-4 w-3/4 rounded bg-[oklch(88%_0_0)]" />
      </div>

      {/* Preview conteúdo — 3 linhas */}
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full rounded bg-[oklch(92%_0_0)]" />
        <div className="h-3 w-full rounded bg-[oklch(92%_0_0)]" />
        <div className="h-3 w-2/3 rounded bg-[oklch(92%_0_0)]" />
      </div>

      {/* Rodapé: avatar + nome + data */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[oklch(88%_0_0)] flex-shrink-0" />
          <div className="h-3 w-24 rounded bg-[oklch(88%_0_0)]" />
        </div>
        <div className="h-3 w-20 rounded bg-[oklch(92%_0_0)]" />
      </div>
    </output>
  )
}

/**
 * Grade de skeletons para o estado de carregamento da listagem de comunicados.
 *
 * @example
 * // Exibir 4 skeletons enquanto carrega
 * <ComunicadoSkeleton count={4} />
 */
export function ComunicadoSkeleton({ count = 4, className }: ComunicadoSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeletons são itens estáticos de UI, sem identidade
        <SkeletonItem key={i} />
      ))}
    </div>
  )
}
