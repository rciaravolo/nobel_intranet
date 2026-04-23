import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { type Categoria, CategoriaBadge } from './CategoriaBadge'

export type ComunicadoCardProps = {
  id: string
  titulo: string
  conteudo: string
  categoria: Categoria
  autorNome: string
  autorEmail: string
  criadoEm: string
  dataExpiracao?: string | null
}

/**
 * Extrai texto puro de Markdown, removendo marcações.
 * Não renderiza — apenas exibe como preview de texto.
 */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // headings
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // bold / italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/^[-*>+]\s+/gm, '') // list markers / blockquotes
    .replace(/\n+/g, ' ')
    .trim()
}

/**
 * Formata data ISO 8601 para pt-BR: "23 abr. 2026".
 */
function formatarData(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return isoString
  }
}

/**
 * Calcula dias restantes até uma data.
 * Retorna null se a data for nula/inválida ou já passou.
 */
function diasRestantes(isoString: string): number | null {
  try {
    const diff = new Date(isoString).getTime() - Date.now()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return dias > 0 ? dias : null
  } catch {
    return null
  }
}

/**
 * Card de comunicado para uso na listagem `/comunicados`.
 *
 * Aceita as props individualmente (spread) OU um objeto único via `comunicado`.
 *
 * Inclui:
 * - Badge de categoria colorida
 * - Título (max 2 linhas)
 * - Preview do conteúdo em texto puro (max 3 linhas, 120 chars)
 * - Avatar + nome do autor
 * - Data formatada em pt-BR
 * - Indicador de fixado (ícone Pin + borda dourada Nobel #B8963E)
 * - Badge de expiração próxima (< 3 dias)
 */
export function ComunicadoCard(props: ComunicadoCardProps) {
  const { titulo, conteudo, categoria, autorNome, criadoEm, dataExpiracao } = props

  const preview = stripMarkdown(conteudo).slice(0, 120)
  const dataFormatada = formatarData(criadoEm)
  const diasParaExpirar = dataExpiracao ? diasRestantes(dataExpiracao) : null
  const expiraEmBreve = diasParaExpirar !== null && diasParaExpirar <= 3

  return (
    <article
      className={cn(
        'relative bg-white rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden',
        'hover:shadow-md hover:-translate-y-px',
        'border-[rgba(0,0,0,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
      )}
    >
      <div className="p-5">
        {/* Linha superior: categoria + expiração */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <CategoriaBadge categoria={categoria} />

          {expiraEmBreve && diasParaExpirar !== null && (
            <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] leading-none bg-yellow-100 text-yellow-700">
              Expira em {diasParaExpirar} {diasParaExpirar === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="text-sm font-semibold text-[#1A1209] leading-snug line-clamp-2 mb-2">
          {titulo}
        </h3>

        {/* Preview do conteúdo */}
        <p className="text-xs text-[rgba(26,18,9,0.5)] leading-relaxed line-clamp-3 mb-4">
          {preview}
        </p>

        {/* Rodapé: autor + data */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar nome={autorNome} size="sm" />
            <span className="text-xs font-medium text-[#3D3D3D] truncate">{autorNome}</span>
          </div>

          <time
            dateTime={criadoEm}
            className="text-[11px] text-[rgba(26,18,9,0.35)] flex-shrink-0 whitespace-nowrap"
          >
            {dataFormatada}
          </time>
        </div>
      </div>
    </article>
  )
}
