import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { createDb } from '../db/client'
import { materiais } from '../db/schema'
import type { Env, Variables } from '../types'

type AppCtx = Context<{ Bindings: Env; Variables: Variables }>

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Limite prático de upload — Cloudflare Worker aceita bem mais, mas
// começamos conservador. Ajustar depois se necessário.
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024 // 20 MB

const EXTENSOES_PERMITIDAS = new Set([
  'pdf',
  'xlsx',
  'xls',
  'pptx',
  'ppt',
  'docx',
  'doc',
  'png',
  'jpg',
  'jpeg',
])

// ---------------------------------------------------------------------------
// Auth middleware — Bearer INTERNAL_API_SECRET (mesmo padrão de admin.ts).
// Identidade e role do usuário chegam via X-User-*.
// ---------------------------------------------------------------------------
app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (auth !== `Bearer ${secret}`) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})

function assertWriteRole(c: AppCtx) {
  const role = c.req.header('X-User-Role') ?? ''
  if (role !== 'admin' && role !== 'master') {
    return c.json({ error: 'Sem permissão para gerenciar materiais' }, 403)
  }
  return null
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\- ]+/g, '_').slice(0, 120)
}

function extensaoDe(nome: string): string {
  const dot = nome.lastIndexOf('.')
  return dot === -1 ? '' : nome.slice(dot + 1).toLowerCase()
}

// ---------------------------------------------------------------------------
// GET /materiais — lista todos os materiais, mais recentes primeiro
// ---------------------------------------------------------------------------
app.get('/', async (c) => {
  const db = createDb(c.env.DB)
  try {
    const rows = await db.select().from(materiais).orderBy(desc(materiais.publicadoEm)).all()
    return c.json({ data: rows })
  } catch (err) {
    console.error('[materiais] listar:', err)
    return c.json({ error: 'Erro ao listar materiais' }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /materiais — upload (multipart/form-data)
// Campos: titulo (string), descricao (string opcional), arquivo (File)
// ---------------------------------------------------------------------------
app.post('/', async (c) => {
  const forbid = assertWriteRole(c)
  if (forbid) return forbid

  const email = c.req.header('X-User-Email') ?? ''
  if (!email) return c.json({ error: 'X-User-Email obrigatório' }, 400)

  let form: Awaited<ReturnType<typeof c.req.parseBody>>
  try {
    form = await c.req.parseBody()
  } catch (err) {
    console.error('[materiais] parseBody:', err)
    return c.json({ error: 'Body inválido (multipart esperado)' }, 400)
  }

  const titulo = String(form['titulo'] ?? '').trim()
  const descricaoRaw = form['descricao']
  const descricao =
    typeof descricaoRaw === 'string' && descricaoRaw.trim() ? descricaoRaw.trim() : null
  const arquivo = form['arquivo']

  if (titulo.length < 3 || titulo.length > 200) {
    return c.json({ error: 'Título deve ter entre 3 e 200 caracteres' }, 400)
  }
  if (!(arquivo instanceof File)) {
    return c.json({ error: 'Arquivo obrigatório' }, 400)
  }
  if (arquivo.size === 0) {
    return c.json({ error: 'Arquivo vazio' }, 400)
  }
  if (arquivo.size > MAX_UPLOAD_BYTES) {
    return c.json({ error: `Arquivo maior que ${MAX_UPLOAD_BYTES / 1024 / 1024} MB` }, 413)
  }

  const nomeOriginal = sanitizeFileName(arquivo.name || 'arquivo')
  const ext = extensaoDe(nomeOriginal)
  if (!EXTENSOES_PERMITIDAS.has(ext)) {
    return c.json({ error: `Extensão .${ext || '?'} não permitida` }, 415)
  }

  const id = crypto.randomUUID()
  const key = `${id}/${nomeOriginal}`

  try {
    await c.env.MATERIAIS_R2.put(key, arquivo.stream(), {
      httpMetadata: {
        contentType: arquivo.type || 'application/octet-stream',
        contentDisposition: `attachment; filename="${nomeOriginal}"`,
      },
    })
  } catch (err) {
    console.error('[materiais] R2.put:', err)
    return c.json({ error: 'Falha ao salvar arquivo' }, 500)
  }

  const db = createDb(c.env.DB)
  try {
    const novo = await db
      .insert(materiais)
      .values({
        id,
        titulo,
        descricao,
        arquivoNome: nomeOriginal,
        arquivoKey: key,
        arquivoSize: arquivo.size,
        arquivoMime: arquivo.type || 'application/octet-stream',
        publicadoPor: email,
      })
      .returning()
      .get()
    return c.json({ data: novo }, 201)
  } catch (err) {
    console.error('[materiais] insert:', err)
    // Rollback: tenta remover o objeto R2 se o insert falhou
    await c.env.MATERIAIS_R2.delete(key).catch(() => undefined)
    return c.json({ error: 'Erro ao registrar material' }, 500)
  }
})

// ---------------------------------------------------------------------------
// PATCH /materiais/:id — edita titulo/descricao (não troca arquivo)
// ---------------------------------------------------------------------------
app.patch('/:id', async (c) => {
  const forbid = assertWriteRole(c)
  if (forbid) return forbid

  const { id } = c.req.param()
  let body: { titulo?: unknown; descricao?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON inválido' }, 400)
  }

  const patch: { titulo?: string; descricao?: string | null; atualizadoEm: string } = {
    atualizadoEm: new Date().toISOString(),
  }

  if (body.titulo !== undefined) {
    const titulo = String(body.titulo).trim()
    if (titulo.length < 3 || titulo.length > 200) {
      return c.json({ error: 'Título deve ter entre 3 e 200 caracteres' }, 400)
    }
    patch.titulo = titulo
  }
  if (body.descricao !== undefined) {
    if (body.descricao === null || body.descricao === '') {
      patch.descricao = null
    } else {
      patch.descricao = String(body.descricao).trim()
    }
  }

  const db = createDb(c.env.DB)
  try {
    const atualizado = await db
      .update(materiais)
      .set(patch)
      .where(eq(materiais.id, id))
      .returning()
      .get()
    if (!atualizado) return c.json({ error: 'Material não encontrado' }, 404)
    return c.json({ data: atualizado })
  } catch (err) {
    console.error('[materiais] update:', err)
    return c.json({ error: 'Erro ao atualizar material' }, 500)
  }
})

// ---------------------------------------------------------------------------
// DELETE /materiais/:id — hard delete (R2 + D1)
// ---------------------------------------------------------------------------
app.delete('/:id', async (c) => {
  const forbid = assertWriteRole(c)
  if (forbid) return forbid

  const { id } = c.req.param()
  const db = createDb(c.env.DB)

  try {
    const existente = await db.select().from(materiais).where(eq(materiais.id, id)).get()
    if (!existente) return c.json({ error: 'Material não encontrado' }, 404)

    await c.env.MATERIAIS_R2.delete(existente.arquivoKey).catch((err) => {
      console.error('[materiais] R2.delete:', err)
    })
    await db.delete(materiais).where(eq(materiais.id, id))

    return c.json({ message: 'Material removido' })
  } catch (err) {
    console.error('[materiais] delete:', err)
    return c.json({ error: 'Erro ao remover material' }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /materiais/:id/download — proxy do R2 com Content-Disposition
// ---------------------------------------------------------------------------
app.get('/:id/download', async (c) => {
  const { id } = c.req.param()
  const db = createDb(c.env.DB)

  const row = await db.select().from(materiais).where(eq(materiais.id, id)).get()
  if (!row) return c.json({ error: 'Material não encontrado' }, 404)

  const obj = await c.env.MATERIAIS_R2.get(row.arquivoKey)
  if (!obj) return c.json({ error: 'Arquivo não encontrado no storage' }, 404)

  const headers = new Headers()
  headers.set('Content-Type', row.arquivoMime || 'application/octet-stream')
  headers.set('Content-Length', String(row.arquivoSize))
  headers.set('Content-Disposition', `attachment; filename="${row.arquivoNome.replace(/"/g, '')}"`)
  headers.set('Cache-Control', 'private, max-age=0, no-store')
  return new Response(obj.body, { headers })
})

export default app
