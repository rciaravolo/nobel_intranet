import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'

/** Categorias válidas de comunicados conforme spec. */
export type Categoria = 'RH' | 'Produtos' | 'PJ2'

const categoriaBadge = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase leading-none',
  {
    variants: {
      categoria: {
        RH: 'bg-blue-100 text-blue-700',
        Produtos: 'bg-green-100 text-green-700',
        PJ2: 'bg-purple-100 text-purple-700',
      },
    },
    defaultVariants: {
      categoria: 'RH',
    },
  },
)

interface CategoriaBadgeProps extends VariantProps<typeof categoriaBadge> {
  className?: string
}

/**
 * Badge colorido para categorias de comunicados.
 *
 * - RH → azul
 * - Produtos → verde
 * - PJ2 → roxo
 *
 * @example
 * <CategoriaBadge categoria="RH" />
 */
export function CategoriaBadge({ categoria, className }: CategoriaBadgeProps) {
  return <span className={cn(categoriaBadge({ categoria }), className)}>{categoria}</span>
}
