import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { createDb } from '../db/client'
import { loginEvents } from '../db/schema'
import type { Env, Variables } from '../types'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// ---------------------------------------------------------------------------
// Auth middleware — INTERNAL_API_SECRET Bearer token (mesma lógica do performance.ts)
// ---------------------------------------------------------------------------
app.use('*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? ''
  const secret = c.env.INTERNAL_API_SECRET ?? 'dev-perf-secret-2026'
  if (auth !== `Bearer ${secret}`) return c.json({ error: 'Unauthorized' }, 401)
  await next()
})

// ---------------------------------------------------------------------------
// POST /admin/log-access
// Registra acesso diário do usuário (idempotente via INSERT OR IGNORE).
// Body: { email: string, nome: string, role: string }
// ---------------------------------------------------------------------------
app.post('/log-access', async (c) => {
  let body: { email?: string; nome?: string; role?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Body inválido' }, 400)
  }

  const email = (body.email ?? '').trim()
  const nome = (body.nome ?? '').trim()
  const role = (body.role ?? '').trim()

  if (!email) return c.json({ error: 'Campo email obrigatório' }, 400)

  // Data local BR: usar date('now') do SQLite (UTC) é aceitável para granularidade diária
  const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

  try {
    await c.env.DB.prepare(
      `INSERT OR IGNORE INTO login_events (email, nome, role, data) VALUES (?, ?, ?, ?)`,
    )
      .bind(email, nome, role, today)
      .run()

    return c.json({ ok: true })
  } catch (err) {
    console.error('[admin/log-access] Erro ao registrar acesso:', err)
    return c.json({ error: 'Erro interno ao registrar acesso' }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /admin/acessos
// Retorna estatísticas agregadas de acesso por usuário.
// Requer X-User-Role: master ou admin.
// ---------------------------------------------------------------------------
app.get('/acessos', async (c) => {
  const role = c.req.header('X-User-Role') ?? ''
  if (role !== 'master' && role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const db = createDb(c.env.DB)

  try {
    const rows = await db
      .select({
        email: loginEvents.email,
        nome: loginEvents.nome,
        role: loginEvents.role,
        ultimoAcesso: sql<string>`MAX(${loginEvents.loggedAt})`,
        totalDias: sql<number>`COUNT(DISTINCT ${loginEvents.data})`,
        diasUltimos7: sql<number>`COUNT(DISTINCT CASE WHEN ${loginEvents.data} >= date('now', '-7 days') THEN ${loginEvents.data} END)`,
        diasUltimos30: sql<number>`COUNT(DISTINCT CASE WHEN ${loginEvents.data} >= date('now', '-30 days') THEN ${loginEvents.data} END)`,
        acessouHoje: sql<number>`MAX(CASE WHEN ${loginEvents.data} = date('now') THEN 1 ELSE 0 END)`,
      })
      .from(loginEvents)
      .groupBy(loginEvents.email)
      .orderBy(sql`MAX(${loginEvents.loggedAt}) DESC`)
      .all()

    const ativosHoje = rows.filter((r) => r.acessouHoje === 1).length
    const ativosUltimos7 = rows.filter((r) => r.diasUltimos7 > 0).length
    const ativosUltimos30 = rows.filter((r) => r.diasUltimos30 > 0).length

    return c.json({
      data: {
        usuarios: rows,
        resumo: {
          ativosHoje,
          ativosUltimos7Dias: ativosUltimos7,
          ativosUltimos30Dias: ativosUltimos30,
          totalUsuarios: rows.length,
        },
      },
    })
  } catch (err) {
    console.error('[admin/acessos] Erro ao buscar acessos:', err)
    return c.json({ error: 'Erro interno ao buscar acessos' }, 500)
  }
})

export default app
