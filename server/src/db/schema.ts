import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const comunicados = sqliteTable('comunicados', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  titulo: text('titulo').notNull(),
  conteudo: text('conteudo').notNull(),
  categoria: text('categoria', { enum: ['RH', 'Produtos', 'PJ2'] }).notNull(),
  autorEmail: text('autor_email').notNull(),
  autorNome: text('autor_nome').notNull(),
  dataExpiracao: text('data_expiracao'), // ISO date string, nullable
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  criadoEm: text('criado_em').notNull().default(sql`(datetime('now'))`),
  atualizadoEm: text('atualizado_em').notNull().default(sql`(datetime('now'))`),
})

export const userRoles = sqliteTable('user_roles', {
  email: text('email').primaryKey(),
  role: text('role', { enum: ['RH', 'Diretoria', 'Membro'] }).notNull().default('Membro'),
  criadoEm: text('criado_em').notNull().default(sql`(datetime('now'))`),
})

export type Comunicado = typeof comunicados.$inferSelect
export type NovoComunicado = typeof comunicados.$inferInsert
export type UserRole = typeof userRoles.$inferSelect
