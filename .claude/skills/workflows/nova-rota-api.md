---
name: nova-rota-api
description: Passo a passo para adicionar rota Hono ao Worker — Zod schema, role filter, auth middleware, teste
type: workflow
version: 1
---

## Canonical
Processo para criar uma rota nova no Cloudflare Worker (Hono). Toda rota deve seguir este fluxo: schema Zod → handler → role filter → middleware auth → teste → registro.

## Entry Point
**Invocar quando:**
- "adiciona endpoint de X"
- "cria rota GET/POST para Y"
- `backend-intranet` vai implementar novo endpoint

**NÃO invocar para:**
- query SQL em si (ver `padroes/d1-query.md` e `dominio/role-system.md`)
- migration de banco (ver `workflows/d1-migration.md`)
- componente de UI que consome a rota (ver `padroes/client-component.md`)

## Source of Truth
- `server/src/routes/performance.ts` — rotas existentes como referência
- `server/src/index.ts` — onde as rotas são registradas
- `padroes/hono-route.md` — template de código

## Scope Resolver
**DENTRO:** criação do arquivo de rota, schema Zod, handler, role filter, registro no index, teste unitário

**FORA:** migration de schema D1 (ver `d1-migration.md`), UI que consome (ver `frontend-intranet`), deploy (ver `pr-deploy.md`)

## Evidence Gates
- Verificar que a rota não existe em `server/src/routes/` antes de criar
- Verificar que o schema D1 tem os campos necessários (`dominio/d1-schema.md`)
- Role filter é obrigatório em toda rota que retorna dados por cliente/assessor

## Mutation Boundary
**PODE:** criar arquivo em `server/src/routes/`, editar `server/src/routes/index.ts`, criar teste
**NUNCA:** editar `wrangler.toml` sem consultar `devops-intranet`; fazer query sem prepared statement

## Verification Protocol
1. `cd server && npm run dev` → rota responde localmente?
2. Teste com role `admin` → retorna todos os dados?
3. Teste com role `assessor` → retorna só os dados do assessor?
4. Teste sem header auth → retorna 401/403?
5. `npx vitest run` → testes passando?

## Output Contract
Produz: arquivo `server/src/routes/[feature].ts` + linha em `server/src/routes/index.ts` + arquivo de teste.

## Companion Reference
- `padroes/hono-route.md` — template de código completo
- `dominio/role-system.md` — como aplicar o role filter
- `dominio/d1-schema.md` — quais campos estão disponíveis
- `padroes/d1-query.md` — como escrever a query com segurança
- Agente: `backend-intranet`, `data-intranet`

## Feedback Loop
Se o template precisar de ajuste para um caso específico, documentar em `padroes/hono-route.md`.

---

## Checklist de uma Nova Rota

```
[ ] 1. Definir o que a rota retorna (endpoint, método HTTP, resposta esperada)
[ ] 2. Verificar schema D1 (dominio/d1-schema.md)
[ ] 3. Criar arquivo server/src/routes/[feature].ts
[ ] 4. Definir schema Zod de input (query params ou body)
[ ] 5. Aplicar resolveFilter (dominio/role-system.md)
[ ] 6. Escrever query com prepared statement (padroes/d1-query.md)
[ ] 7. Retornar c.json({ data: ... })
[ ] 8. Registrar rota em server/src/routes/index.ts
[ ] 9. Escrever teste mínimo
[ ] 10. Testar manualmente com wrangler dev
```

## Estrutura de Arquivos

```
server/src/
├── routes/
│   ├── index.ts              ← registrar aqui
│   ├── performance.ts        ← rota existente — referência
│   └── [nova-feature].ts     ← criar aqui
└── schemas/
    └── [nova-feature].ts     ← schema Zod separado se complexo
```

## Template Mínimo

```typescript
// server/src/routes/[feature].ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { resolveFilter, buildAndFilter } from './performance'

const feature = new Hono<{ Bindings: Env }>()

// Schema de query params (se necessário)
const querySchema = z.object({
  mes: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
})

feature.get('/', zValidator('query', querySchema), async (c) => {
  const db = c.env.PERF_DB
  const { mes, limit } = c.req.valid('query')

  // 1. Resolver role filter
  const filter = await resolveFilter(
    db,
    c.req.header('X-User-Role'),
    c.req.header('X-User-Email'),
    c.req.header('X-User-Equipe'),
  )
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  // 2. Construir WHERE
  const wa = buildAndFilter(filter)

  // 3. Query com prepared statement
  const rows = await db
    .prepare(`
      SELECT id_assessor, SUM(valor) as total
      FROM tabela_x
      WHERE 1=1${wa}${mes ? ' AND mes = ?' : ''}
      GROUP BY id_assessor
      ORDER BY total DESC
      LIMIT ?
    `)
    .bind(...(mes ? [mes] : []), limit)
    .all<{ id_assessor: string; total: number }>()

  return c.json({ data: rows.results })
})

export { feature }
```

## Registro no Index

```typescript
// server/src/routes/index.ts
import { feature } from './[feature]'

// adicionar dentro do app.route():
app.route('/feature', feature)
```
