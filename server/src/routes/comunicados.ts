import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, and, or, gt, isNull, SQL } from 'drizzle-orm'
import { createDb } from '../db/client'
import { comunicados, userRoles } from '../db/schema'
import { cfAccessAuth } from '../lib/auth'
import {
  criarComunicadoSchema,
  atualizarComunicadoSchema,
  listarComunicadosSchema,
} from '../schemas/comunicados'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Aplica autenticação a todas as rotas deste router
app.use('*', cfAccessAuth)

// ---------------------------------------------------------------------------
// Helper: verifica se o usuário tem permissão de escrita (RH ou Diretoria)
// ---------------------------------------------------------------------------
async function temPermissaoEscrita(db: ReturnType<typeof createDb>, email: string): Promise<boolean> {
  // Emails com domínio contendo "rh" têm acesso direto
  const domain = email.split('@')[1] ?? ''
  if (domain.toLowerCase().includes('rh')) return true

  const record = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.email, email))
    .get()

  return record?.role === 'RH' || record?.role === 'Diretoria'
}

// ---------------------------------------------------------------------------
// GET /comunicados — listar comunicados ativos (com filtros opcionais)
// ---------------------------------------------------------------------------
app.get('/', zValidator('query', listarComunicadosSchema), async (c) => {
  const { categoria, incluirExpirados } = c.req.valid('query')
  const db = createDb(c.env.DB)
  const agora = new Date().toISOString()

  try {
    const conditions: SQL[] = [eq(comunicados.ativo, true)]

    if (categoria) {
      conditions.push(eq(comunicados.categoria, categoria))
    }

    if (!incluirExpirados) {
      const naoExpirado = or(isNull(comunicados.dataExpiracao), gt(comunicados.dataExpiracao, agora))
      if (naoExpirado) conditions.push(naoExpirado)
    }

    const rows = await db
      .select()
      .from(comunicados)
      .where(and(...conditions))
      .orderBy(comunicados.criadoEm)
      .all()

    return c.json({ data: rows })
  } catch (err) {
    console.error('Erro ao listar comunicados:', err)
    return c.json({ error: 'Erro interno ao listar comunicados' }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /comunicados/:id — detalhe de um comunicado
// ---------------------------------------------------------------------------
app.get('/:id', async (c) => {
  const { id } = c.req.param()
  const db = createDb(c.env.DB)

  try {
    const row = await db
      .select()
      .from(comunicados)
      .where(and(eq(comunicados.id, id), eq(comunicados.ativo, true)))
      .get()

    if (!row) return c.json({ error: 'Comunicado não encontrado' }, 404)

    return c.json({ data: row })
  } catch (err) {
    console.error('Erro ao buscar comunicado:', err)
    return c.json({ error: 'Erro interno ao buscar comunicado' }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /comunicados — criar comunicado (requer role RH ou Diretoria)
// ---------------------------------------------------------------------------
app.post('/', zValidator('json', criarComunicadoSchema), async (c) => {
  const user = c.get('user')
  const body = c.req.valid('json')
  const db = createDb(c.env.DB)

  try {
    const autorizado = await temPermissaoEscrita(db, user.email)
    if (!autorizado) {
      return c.json({ error: 'Sem permissão para criar comunicados' }, 403)
    }

    const novo = await db
      .insert(comunicados)
      .values({
        titulo: body.titulo,
        conteudo: body.conteudo,
        categoria: body.categoria,
        autorEmail: user.email,
        autorNome: user.name,
        dataExpiracao: body.dataExpiracao ?? null,
      })
      .returning()
      .get()

    return c.json({ data: novo }, 201)
  } catch (err) {
    console.error('Erro ao criar comunicado:', err)
    return c.json({ error: 'Erro interno ao criar comunicado' }, 500)
  }
})

// ---------------------------------------------------------------------------
// PUT /comunicados/:id — editar comunicado (apenas autor ou admin)
// ---------------------------------------------------------------------------
app.put('/:id', zValidator('json', atualizarComunicadoSchema), async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')
  const body = c.req.valid('json')
  const db = createDb(c.env.DB)

  try {
    const existente = await db
      .select()
      .from(comunicados)
      .where(and(eq(comunicados.id, id), eq(comunicados.ativo, true)))
      .get()

    if (!existente) return c.json({ error: 'Comunicado não encontrado' }, 404)

    // Autor pode editar o próprio; admins (RH/Diretoria) podem editar qualquer um
    const ehAutor = existente.autorEmail === user.email
    const ehAdmin = await temPermissaoEscrita(db, user.email)

    if (!ehAutor && !ehAdmin) {
      return c.json({ error: 'Sem permissão para editar este comunicado' }, 403)
    }

    const atualizado = await db
      .update(comunicados)
      .set({
        ...(body.titulo !== undefined && { titulo: body.titulo }),
        ...(body.conteudo !== undefined && { conteudo: body.conteudo }),
        ...(body.categoria !== undefined && { categoria: body.categoria }),
        ...(body.dataExpiracao !== undefined && { dataExpiracao: body.dataExpiracao ?? null }),
        atualizadoEm: new Date().toISOString(),
      })
      .where(eq(comunicados.id, id))
      .returning()
      .get()

    return c.json({ data: atualizado })
  } catch (err) {
    console.error('Erro ao atualizar comunicado:', err)
    return c.json({ error: 'Erro interno ao atualizar comunicado' }, 500)
  }
})

// ---------------------------------------------------------------------------
// DELETE /comunicados/:id — soft delete (apenas autor ou admin)
// ---------------------------------------------------------------------------
app.delete('/:id', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')
  const db = createDb(c.env.DB)

  try {
    const existente = await db
      .select()
      .from(comunicados)
      .where(and(eq(comunicados.id, id), eq(comunicados.ativo, true)))
      .get()

    if (!existente) return c.json({ error: 'Comunicado não encontrado' }, 404)

    const ehAutor = existente.autorEmail === user.email
    const ehAdmin = await temPermissaoEscrita(db, user.email)

    if (!ehAutor && !ehAdmin) {
      return c.json({ error: 'Sem permissão para excluir este comunicado' }, 403)
    }

    await db
      .update(comunicados)
      .set({ ativo: false, atualizadoEm: new Date().toISOString() })
      .where(eq(comunicados.id, id))

    return c.json({ message: 'Comunicado removido com sucesso' })
  } catch (err) {
    console.error('Erro ao remover comunicado:', err)
    return c.json({ error: 'Erro interno ao remover comunicado' }, 500)
  }
})

export default app
