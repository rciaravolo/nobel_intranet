---
name: hono-route
description: Template TypeScript completo de rota Hono — Zod validation, auth middleware, error handling, tipagem de resposta
type: padrao
version: 1
---

## Canonical
Template de código para rotas Hono no Cloudflare Worker do INTRA. Toda rota nova deve seguir este padrão para manter consistência de auth, validação e tratamento de erro.

## Entry Point
**Invocar quando:**
- escrever código de rota Hono
- "como estruturo o handler?"
- precisar de exemplo de Zod + Hono integrado

**NÃO invocar para:**
- decidir o que a rota retorna (ver `dominio/d1-schema.md`)
- aplicar role filter (ver `dominio/role-system.md`)
- passo a passo de criação (ver `workflows/nova-rota-api.md`)

## Source of Truth
- `server/src/routes/performance.ts` — rotas em produção como referência viva
- `server/src/middleware/auth.ts` — middleware de autenticação

## Scope Resolver
**DENTRO:** estrutura de código da rota, imports, Zod schema, handler pattern, tipagem de resposta, error handling

**FORA:** SQL da query (ver `padroes/d1-query.md`), role filter (ver `dominio/role-system.md`), registro no index (ver `workflows/nova-rota-api.md`)

## Evidence Gates
- Verificar que `@hono/zod-validator` está instalado antes de usar `zValidator`
- Verificar que os tipos de `Env` (bindings) estão definidos em `server/src/index.ts`

## Mutation Boundary
**PODE:** usar como template para criar novos arquivos de rota
**NUNCA:** modificar este template sem atualizar as rotas existentes que o seguem

## Verification Protocol
1. `cd server && npx tsc --noEmit` → sem erros de tipo?
2. `wrangler dev` → rota responde com status correto?
3. Payload inválido → retorna 400 com detalhes do erro Zod?

## Output Contract
Referência de template — consultado; o agente produz o arquivo de rota com base neste padrão.

## Companion Reference
- `dominio/role-system.md` — como adicionar role filter
- `padroes/d1-query.md` — query dentro do handler
- `workflows/nova-rota-api.md` — contexto de criação completo
- Agente: `backend-intranet`

## Feedback Loop
Se um pattern novo surgir em produção (ex: streaming, SSE), adicionar aqui.

---

## Template de Rota GET (listagem com filtros)

```typescript
// server/src/routes/[feature].ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { resolveFilter, buildAndFilter } from './performance'

const feature = new Hono<{ Bindings: Env }>()

// Schema de query params
const listSchema = z.object({
  mes:   z.string().regex(/^\d{4}-\d{2}$/).optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
})

// Tipagem do resultado
interface FeatureRow {
  id_assessor: string
  nome_assessor: string
  total: number
}

feature.get('/', zValidator('query', listSchema), async (c) => {
  const db = c.env.PERF_DB
  const { mes, limit } = c.req.valid('query')

  // Auth: role filter (obrigatório para dados individuais)
  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  const wa = buildAndFilter(filter)

  try {
    const { results } = await db
      .prepare(`
        SELECT
          a.id_assessor,
          a.nome_assessor,
          SUM(t.valor) AS total
        FROM tabela_x t
        JOIN assessores a ON t.id_assessor = a.id_assessor
        WHERE 1=1${wa}${mes ? ' AND t.mes = ?' : ''}
        GROUP BY a.id_assessor, a.nome_assessor
        ORDER BY total DESC
        LIMIT ?
      `)
      .bind(...(mes ? [mes] : []), limit)
      .all<FeatureRow>()

    return c.json({ data: results })
  } catch (err) {
    console.error('[feature] query error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export { feature }
```

## Template de Rota POST (mutação)

```typescript
const createSchema = z.object({
  id_assessor: z.string().min(1),
  mes:         z.string().regex(/^\d{4}-\d{2}$/),
  valor:       z.number().positive(),
})

feature.post('/', zValidator('json', createSchema), async (c) => {
  const db = c.env.DB  // Prisma/D1
  const body = c.req.valid('json')

  // Auth: apenas admin/master podem criar
  const role = c.req.header('X-User-Role')
  if (role !== 'admin' && role !== 'master') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  try {
    await db.prepare(`
      INSERT INTO feature_table (id_assessor, mes, valor)
      VALUES (?, ?, ?)
    `)
    .bind(body.id_assessor, body.mes, body.valor)
    .run()

    return c.json({ success: true }, 201)
  } catch (err) {
    console.error('[feature] insert error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})
```

## Registro no Index

```typescript
// server/src/routes/index.ts
import { feature } from './[feature]'

export function registerRoutes(app: Hono<{ Bindings: Env }>) {
  // ... rotas existentes ...
  app.route('/feature', feature)
}
```

## Padrões de Resposta

| Status | Quando | Formato |
|--------|--------|---------|
| `200` | GET com resultado | `{ data: T[] }` |
| `201` | POST criação | `{ success: true }` ou `{ data: T }` |
| `400` | Zod validation fail | automático pelo `zValidator` |
| `401` | Sem JWT | `{ error: 'Unauthorized' }` |
| `403` | Role insuficiente | `{ error: 'Forbidden' }` |
| `500` | Erro interno | `{ error: 'Internal Server Error' }` |

## Nunca

- `return c.json(error)` com stack trace — esconder em produção
- `c.req.query()` sem validar com Zod primeiro
- Interpolar input do usuário direto no SQL
