import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Mescla classes Tailwind de forma segura, resolvendo conflitos.
 * Usar em todos os componentes para classes condicionais.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
