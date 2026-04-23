import { z } from 'zod'

export const criarComunicadoSchema = z.object({
  titulo: z.string().min(1).max(200),
  conteudo: z.string().min(1),
  categoria: z.enum(['RH', 'Produtos', 'PJ2']),
  dataExpiracao: z.string().datetime({ offset: true }).nullable().optional(),
})

export const atualizarComunicadoSchema = criarComunicadoSchema.partial()

export const listarComunicadosSchema = z.object({
  categoria: z.enum(['RH', 'Produtos', 'PJ2']).optional(),
  incluirExpirados: z.coerce.boolean().default(false),
})
