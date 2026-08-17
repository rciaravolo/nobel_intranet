import type { Context } from 'hono'
import type { Env, Variables } from '../types'

/* ─── Filtro por role ────────────────────────────────────────────────────────
   admin/master → acesso total (sem filtro)
   lider        → filtro por equipe (subquery em assessores)
   lider_pj     → líder sem equipe. Default: filtra pelo id_assessor da session.
                  Rotas de Carteiras/Clientes chamam com { scopeForLiderPj: 'all' }
                  para forçar visão geral.
   assessor     → filtro por id_assessor (lookup por email)
   denied       → acesso negado
 ─────────────────────────────────────────────────────────────────────────── */
export type FilterResult =
  | { type: 'all' }
  | { type: 'assessor'; id: string }
  | { type: 'equipe'; equipe: string }
  | { type: 'denied' }

export type ResolveOpts = { scopeForLiderPj?: 'all' }

export async function resolveFilter(
  db: D1Database,
  role: string | undefined,
  email: string | undefined,
  equipe: string | undefined,
  idAssessor: string | undefined,
  filterType?: string | undefined,
  filterValue?: string | undefined,
  opts?: ResolveOpts,
): Promise<FilterResult> {
  if (role === 'admin' || role === 'master') {
    if (filterType === 'equipe' && filterValue) return { type: 'equipe', equipe: filterValue }
    if (filterType === 'assessor' && filterValue) return { type: 'assessor', id: filterValue }
    return { type: 'all' }
  }
  if (role === 'lider') {
    if (!equipe) return { type: 'denied' }
    if (filterType === 'assessor' && filterValue) return { type: 'assessor', id: filterValue }
    return { type: 'equipe', equipe }
  }
  if (role === 'lider_pj') {
    if (opts?.scopeForLiderPj === 'all') {
      if (filterType === 'equipe' && filterValue) return { type: 'equipe', equipe: filterValue }
      if (filterType === 'assessor' && filterValue) return { type: 'assessor', id: filterValue }
      return { type: 'all' }
    }
    if (!idAssessor) return { type: 'denied' }
    return { type: 'assessor', id: idAssessor }
  }
  if (!email) return { type: 'denied' }
  const row = await db
    .prepare('SELECT id_assessor FROM assessores WHERE LOWER(mail_assessor) = LOWER(?)')
    .bind(email)
    .first<{ id_assessor: string }>()
  return row ? { type: 'assessor', id: row.id_assessor } : { type: 'denied' }
}

/** Rotas em que `lider_pj` vê a base inteira (visão geral). */
export const LIDER_PJ_ALL_PATHS = ['/performance/carteiras', '/performance/clientes', '/performance/pj1']

/** Boilerplate helper — lê os headers X-User-* do contexto e chama resolveFilter. */
export async function resolveFilterFromCtx(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  opts?: ResolveOpts,
): Promise<FilterResult> {
  const path = c.req.path
  const inferredScope = LIDER_PJ_ALL_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
    ? 'all'
    : undefined
  return resolveFilter(
    c.env.PERF_DB,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
    c.req.header('X-User-Id-Assessor'),
    c.req.header('X-Filter-Type'),
    c.req.header('X-Filter-Value'),
    { scopeForLiderPj: opts?.scopeForLiderPj ?? inferredScope },
  )
}

export function buildWhereFilter(f: FilterResult, col = 'id_assessor'): string {
  if (f.type === 'all')      return ''
  if (f.type === 'assessor') return ` WHERE ${col} = '${f.id}'`
  if (f.type === 'equipe')   return ` WHERE ${col} IN (SELECT id_assessor FROM assessores WHERE equipe = '${f.equipe}')`
  return ''
}

export function buildAndFilter(f: FilterResult, col = 'id_assessor'): string {
  if (f.type === 'all')      return ''
  if (f.type === 'assessor') return ` AND ${col} = '${f.id}'`
  if (f.type === 'equipe')   return ` AND ${col} IN (SELECT id_assessor FROM assessores WHERE equipe = '${f.equipe}')`
  return ''
}

export function buildDivFilter(f: FilterResult): string {
  if (f.type === 'all')      return ''
  if (f.type === 'assessor') return ` WHERE id_cliente IN (SELECT id_cliente FROM tb_positivador WHERE id_assessor = '${f.id}')`
  if (f.type === 'equipe')   return ` WHERE id_cliente IN (SELECT id_cliente FROM tb_positivador WHERE id_assessor IN (SELECT id_assessor FROM assessores WHERE equipe = '${f.equipe}'))`
  return ''
}
