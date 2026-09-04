import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const comunicados = sqliteTable('comunicados', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
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
  role: text('role', { enum: ['RH', 'Diretoria', 'Membro'] })
    .notNull()
    .default('Membro'),
  criadoEm: text('criado_em').notNull().default(sql`(datetime('now'))`),
})

export const loginEvents = sqliteTable('login_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  nome: text('nome').notNull().default(''),
  role: text('role').notNull().default(''),
  data: text('data').notNull(),
  loggedAt: text('logged_at').notNull().default(sql`(datetime('now'))`),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', {
    enum: ['admin', 'master', 'lider', 'lider_pj', 'assessor'],
  }).notNull(),
  equipe: text('equipe'),
  idAssessor: text('id_assessor'),
  department: text('department').notNull(),
  avatarInitials: text('avatar_initials').notNull(),
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(false),
  criadoEm: text('criado_em').notNull().default(sql`(datetime('now'))`),
  atualizadoEm: text('atualizado_em').notNull().default(sql`(datetime('now'))`),
})

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  criadoEm: text('criado_em').notNull().default(sql`(datetime('now'))`),
})

export const materiais = sqliteTable('materiais', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  arquivoNome: text('arquivo_nome').notNull(),
  arquivoKey: text('arquivo_key').notNull().unique(),
  arquivoSize: integer('arquivo_size').notNull(),
  arquivoMime: text('arquivo_mime').notNull(),
  publicadoPor: text('publicado_por').notNull(),
  publicadoEm: text('publicado_em').notNull().default(sql`(datetime('now'))`),
  atualizadoEm: text('atualizado_em').notNull().default(sql`(datetime('now'))`),
})

export type Comunicado = typeof comunicados.$inferSelect
export type NovoComunicado = typeof comunicados.$inferInsert
export type UserRole = typeof userRoles.$inferSelect
export type LoginEvent = typeof loginEvents.$inferSelect
export type User = typeof users.$inferSelect
export type NovoUser = typeof users.$inferInsert
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
export type Material = typeof materiais.$inferSelect
export type NovoMaterial = typeof materiais.$inferInsert
