import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-brand-500/10 text-brand-600 border border-brand-500/20',
        secondary:
          'bg-[oklch(95%_0_0)] text-[oklch(40%_0_0)] border border-[oklch(88%_0_0)]',
        destructive:
          'bg-red-100 text-red-700 border border-red-200',
        warning:
          'bg-yellow-100 text-yellow-700 border border-yellow-200',
        success:
          'bg-green-100 text-green-700 border border-green-200',
        outline:
          'border border-[oklch(88%_0_0)] text-[oklch(40%_0_0)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge genérico do design system.
 * Para categorias de comunicados, usar CategoriaBadge.
 */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
