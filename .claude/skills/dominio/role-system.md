---
name: role-system
description: Sistema de roles Nobel (admin/master/lider/lider_pj/assessor) e o padrão resolveFilter — obrigatório em toda query que expõe dados individuais
type: dominio
version: 2
---

## Canonical
Define os 5 roles do INTRA, o que cada um pode ver, e as funções `resolveFilter` / `resolveFilterFromCtx` / `buildAndFilter` / `buildWhereFilter` que devem ser aplicadas em toda rota que expõe dados por cliente ou assessor.

## Entry Point
**Invocar quando:**
- escrever qualquer rota que retorne dados por cliente, assessor ou equipe
- "como filtrar dados para o role X?"
- adicionar uma nova rota ao `performance.ts`
- revisar se uma rota existente está aplicando controle de acesso corretamente

**NÃO invocar para:**
- autenticação JWT Cloudflare Access (ver `padroes/security-checklist.md`)
- schema das tabelas (ver `dominio/d1-schema.md`)

## Source of Truth
- `server/src/routes/performance.ts` — implementação canônica de `resolveFilter`, `buildAndFilter`, `buildWhereFilter`
- Header `X-User-Role` passado pelo Cloudflare Access middleware

## Scope Resolver
**DENTRO:** roles e suas permissões, funções de filtro, como aplicar o filtro em queries com e sem JOIN

**FORA:** validação de JWT (ver `padroes/security-checklist.md`), schema das tabelas (ver `dominio/d1-schema.md`)

## Evidence Gates
- Verificar que `resolveFilter` está importado de `performance.ts` (não reimplementar)
- Se `filter.type === 'denied'`, retornar 403 imediatamente — nunca continuar
- `tb_diversificador` não tem `id_assessor` — exige JOIN via `buildAndFilter(filter, 'p.id_assessor')`

## Mutation Boundary
**PODE:** usar as funções de filtro em rotas novas
**NUNCA:** modificar `resolveFilter` sem entender o impacto em TODAS as rotas existentes; nunca expor dados sem aplicar o filtro

## Verification Protocol
1. Testar rota como role `admin` → deve retornar todos os dados
2. Testar como role `assessor` com email real → deve retornar apenas os dados do assessor
3. Testar sem header `X-User-Role` → deve retornar 403
4. Confirmar que `filter.type === 'denied'` retorna 403 e não 500

## Output Contract
Skill de referência — não produz output. Informa como aplicar filtros em rotas.

## Companion Reference
- `dominio/d1-schema.md` — quais tabelas têm `id_assessor` diretamente vs via JOIN
- `padroes/d1-query.md` — como construir a query completa com o filtro
- `workflows/nova-rota-api.md` — passo a passo para criar rota com role filter
- Agente: `data-intranet`, `backend-intranet`

## Feedback Loop
Se um role precisar de novo comportamento, documentar abaixo em "Histórico" antes de alterar o código.

---

## Os 5 Roles

| Role | Quem é | Vê |
|------|--------|-----|
| `admin` | Equipe Nobel (diretoria, BI) | Todos os dados, todos os assessores |
| `master` | Gestores sênior | Todos os dados (mesmo que admin) |
| `lider` | Líder de equipe | Apenas sua equipe |
| `lider_pj` | Líder sem equipe (área PJ) | Escopo por rota — OnePage: só o dele (via `idAssessor`). Carteiras/Clientes: geral (todos). P&L/Indicadores/Plano-Carreira: negado. |
| `assessor` | Assessor individual | Apenas seus próprios clientes |

## Tipo de Retorno de resolveFilter

```typescript
// Existe em: server/src/routes/performance.ts
type FilterResult =
  | { type: 'all' }                          // admin, master ou lider_pj em rota "geral"
  | { type: 'assessor'; id: string }         // filtra por id_assessor (assessor ou lider_pj "self")
  | { type: 'equipe'; equipe: string }       // filtra por equipe
  | { type: 'denied' }                       // acesso negado — retornar 403
```

## Como Usar em uma Rota

Padrão: usar o helper `resolveFilterFromCtx(c)` que lê todos os headers X-User-*.
Nunca chamar `resolveFilter(...)` diretamente com args posicionais.

```typescript
import { buildAndFilter, buildWhereFilter } from './performance'

app.get('/minha-rota', async (c) => {
  const db = c.env.PERF_DB

  // 1. Resolver o filtro baseado no usuário autenticado
  const filter = await resolveFilterFromCtx(c)

  // 2. Se negado, parar imediatamente
  if (filter.type === 'denied') return c.json({ error: 'Forbidden' }, 403)

  // 3a. Tabela COM id_assessor diretamente (ex: analitico_rf, tb_positivador)
  const wa = buildAndFilter(filter)                      // adiciona " AND id_assessor = ?"
  const sql = `SELECT * FROM analitico_rf WHERE 1=1${wa}`

  // 3b. Tabela SEM id_assessor (ex: tb_diversificador) — via JOIN
  const wa2 = buildAndFilter(filter, 'p.id_assessor')   // referencia alias do JOIN
  const sql2 = `
    SELECT d.*
    FROM tb_diversificador d
    INNER JOIN tb_positivador p ON d.id_cliente = p.id_cliente
    WHERE 1=1${wa2}
  `

  // 3c. Sem WHERE existente — buildWhereFilter cria o WHERE completo
  const w = buildWhereFilter(filter)
  const sql3 = `SELECT * FROM assessores${w}`

  const rows = await db.prepare(sql).all()
  return c.json({ data: rows.results })
})
```

## Comportamento do `lider_pj` (escopo por rota)

Sem equipe. Default: filtra pelo `idAssessor` da session (visão "self").
Rotas de **visão geral** (Carteiras/Clientes) usam path-inference — `lider_pj` vê a base inteira.

```typescript
// Em server/src/routes/performance.ts:
const LIDER_PJ_ALL_PATHS = ['/carteiras', '/clientes']
// ↑ adicionar aqui prefixos novos de rotas "gerais"
```

Para forçar manualmente em uma chamada específica: `resolveFilterFromCtx(c, { scopeForLiderPj: 'all' })`.

## Propagação do `idAssessor` (Next → Worker)

O header `X-User-Id-Assessor` viaja em toda chamada proxy Next → Worker.
Use o helper `authHeaders(session)` em `src/lib/auth/api-headers.ts`:

```typescript
import { authHeaders } from '@/lib/auth/api-headers'
const res = await apiFetch('/performance/xyz', { headers: authHeaders(session) })
```

## Tabelas que Exigem JOIN para Filtrar

```sql
-- tb_diversificador não tem id_assessor
-- SEMPRE usar JOIN com tb_positivador:
FROM tb_diversificador d
INNER JOIN tb_positivador p ON d.id_cliente = p.id_cliente
WHERE 1=1 AND p.id_assessor = ?   -- aplicado via buildAndFilter(filter, 'p.id_assessor')
```

## Histórico de Mudanças

- **2026-07-01** — Adicionado role `lider_pj` para Luis Vieira (área PJ1, sem equipe).
  Escopo por rota via path-inference no helper `resolveFilterFromCtx`.
  Novo campo `idAssessor?` na `SessionPayload`. Helper `authHeaders()` para consolidar headers proxy.
