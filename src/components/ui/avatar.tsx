import { cn } from '@/lib/utils'

interface AvatarProps {
  /** Nome completo — usado para gerar as iniciais de fallback */
  nome: string
  /** URL opcional de imagem de perfil */
  src?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Gera iniciais a partir do nome completo (máx. 2 letras). */
function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    const first = parts[0]
    return first ? first.charAt(0).toUpperCase() : '?'
  }
  const firstChar = parts[0]?.charAt(0) ?? ''
  const lastChar = parts[parts.length - 1]?.charAt(0) ?? ''
  return (firstChar + lastChar).toUpperCase()
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
} as const

/**
 * Avatar com fallback de iniciais.
 * Segue os tokens visuais do design system (gradiente dourado Nobel).
 */
export function Avatar({ nome, src, className, size = 'md' }: AvatarProps) {
  const initials = getInitials(nome)

  if (src) {
    return (
      <img
        src={src}
        alt={`Foto de perfil de ${nome}`}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          sizeClasses[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      aria-label={`Iniciais de ${nome}: ${initials}`}
      className={cn(
        'rounded-full flex-shrink-0 inline-flex items-center justify-center font-semibold text-white',
        'bg-gradient-to-br from-[#B8963E] to-[#8B6914]',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
