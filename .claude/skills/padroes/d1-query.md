---
name: d1-query
description: Padrões de query seguras para Cloudflare D1/SQLite — prepared statements, performance, limitações e anti-padrões
type: padrao
version: 1
---

## Canonical
Referência de como escrever queries no D1 com segurança e performance. Toda query no INTRA deve seguir estes padrões — sem exceções para SQL injection ou full scans.

## Entry Point
**Invocar quando:**
- escrever qualquer query SQL para o D1
- "como faço prepared statement no D1?"
- "qual a forma correta de paginar resultados?"
- otimizar query lenta

**NÃO invocar para:**
- decidir qual tabela usar (ver `dominio/d1-schema.md`)
- aplicar role filter (ver `dominio/role-system.md`)
- criar nova tabela (ver `workflows/d1-migration.md`)

## Source of Truth
- `server/src/routes/performance.ts` — queries em produção como referência
- Documentação Cloudflare D1: prepared statements API

## Scope Resolver
**DENTRO:** prepared statements, performance patterns, limitações SQLite, CTEs, CASE WHEN, índices

**FORA:** schema das tabelas (ver `dominio/d1-schema.md`), role filter (ver `dominio/role-system.md`), migrations (ver `workflows/d1-migration.md`)

## Evidence Gates
- NUNCA interpolar input do usuário direto no SQL (SQL injection)
- NUNCA fazer `SELECT *` sem `LIMIT` em tabelas grandes
- Tabelas com histórico: SEMPRE filtrar por `data_posicao = MAX()`

## Mutation Boundary
**PODE:** usar estes padrões em qualquer query
**NUNCA:** usar concatenação de string para construir SQL com input do usuário

## Verification Protocol
1. Query usa `.prepare(sql).bind(...params)` com params separados?
2. Query tem `LIMIT`?
3. Tabelas com histórico têm filtro `data_posicao = (SELECT MAX(data_posicao) FROM ...)`?
4. Testar em `--local` antes de produção

## Output Contract
Referência — não produz output diretamente. Informa como escrever queries.

## Companion Reference
- `dominio/d1-schema.md` — quais tabelas e campos existem
- `dominio/role-system.md` — como adicionar filtro de role
- `padroes/hono-route.md` — contexto de onde a query vive
- Agente: `data-intranet`, `backend-intranet`

## Feedback Loop
Se uma query lenta for otimizada com técnica não documentada aqui, adicionar à seção de performance.

---

## Regra de Ouro: Prepared Statements

```typescript
// ✅ CORRETO — params separados via .bind()
const rows = await db
  .prepare('SELECT * FROM assessores WHERE id_assessor = ? AND equipe = ?')
  .bind(idAssessor, equipe)
  .all<Assessor>()

// ❌ ERRADO — concatenação → SQL injection
const rows = await db
  .prepare(`SELECT * FROM assessores WHERE id_assessor = '${idAssessor}'`)
  .all()
```

## API do D1

```typescript
// Leitura de múltiplas linhas
const { results } = await db
  .prepare('SELECT ...')
  .bind(param1, param2)
  .all<TipoRetorno>()

// Leitura de uma linha
const row = await db
  .prepare('SELECT ...')
  .bind(param1)
  .first<TipoRetorno>()

// Escrita
await db
  .prepare('INSERT INTO ... VALUES (?, ?)')
  .bind(val1, val2)
  .run()

// Batch (múltiplas operações atômicas)
await db.batch([
  db.prepare('INSERT INTO tabela_a ...').bind(...),
  db.prepare('UPDATE tabela_b ...').bind(...),
])
```

## Filtrar por Data (Tabelas com Histórico)

```sql
-- SEMPRE filtrar por data mais recente em tabelas com snapshots
WHERE data_posicao = (SELECT MAX(data_posicao) FROM tb_positivador)

-- Para cross-table:
WITH ultima_data AS (
  SELECT MAX(data_posicao) AS data_max FROM tb_positivador
)
SELECT p.*
FROM tb_positivador p, ultima_data u
WHERE p.data_posicao = u.data_max
```

## Performance Patterns

### CTE para queries complexas
```sql
WITH
base AS (
  SELECT id_assessor, SUM(net) AS total_net
  FROM tb_diversificador d
  INNER JOIN tb_positivador p ON d.id_cliente = p.id_cliente
  WHERE data_posicao = (SELECT MAX(data_posicao) FROM tb_positivador)
  GROUP BY p.id_assessor
),
ranking AS (
  SELECT
    b.*,
    a.nome_assessor,
    a.equipe,
    ROW_NUMBER() OVER (ORDER BY total_net DESC) AS posicao
  FROM base b
  JOIN assessores a ON b.id_assessor = a.id_assessor
)
SELECT * FROM ranking
ORDER BY posicao
LIMIT 20
```

### Janelas de Vencimento (padrão RF)
```sql
CASE
  WHEN vencimento < date('now', '+6 months')  THEN '0-6m'
  WHEN vencimento < date('now', '+12 months') THEN '6-12m'
  WHEN vencimento < date('now', '+24 months') THEN '1-2a'
  WHEN vencimento < date('now', '+60 months') THEN '2-5a'
  ELSE '5+a'
END AS janela
```

### Agregação por Receita Total
```sql
-- UNION ALL para somar todas as fontes de receita
SELECT id_assessor, SUM(receita) AS receita_total
FROM (
  SELECT id_assessor, receita FROM receita_rv
  UNION ALL
  SELECT id_assessor, receita FROM receita_rf
  UNION ALL
  SELECT id_assessor, receita FROM receita_feefixo
  UNION ALL
  SELECT id_assessor, receita FROM receita_seguros
  -- ... demais tabelas
) todas
GROUP BY id_assessor
```

### Paginação
```sql
SELECT * FROM tabela
WHERE condicoes
ORDER BY campo DESC
LIMIT ? OFFSET ?
-- bind: [pageSize, (page - 1) * pageSize]
```

## Limitações SQLite/D1 — Não Tentar

| Limitação | Workaround |
|-----------|-----------|
| Sem `FULL OUTER JOIN` | `LEFT JOIN a ... UNION LEFT JOIN b ...` |
| Sem stored procedures | Lógica em TypeScript no handler |
| Sem triggers | Lógica no ETL ou na rota antes de INSERT |
| Resultado limitado a 1MB | Paginar ou agregar antes de retornar |
| `ALTER TABLE ADD COLUMN NOT NULL` sem default | Adicionar com `DEFAULT ''` ou recriar tabela |

## Anti-padrões

| ❌ Anti-padrão | ✅ Correto |
|----------------|-----------|
| `SELECT *` sem LIMIT | `SELECT campo1, campo2 ... LIMIT 100` |
| Concatenar params no SQL | `.bind(param1, param2)` |
| Não filtrar `data_posicao` | `WHERE data_posicao = (SELECT MAX(...))` |
| Index em toda coluna | Index apenas em colunas de filtro frequente |
| `SELECT *` em JOIN | Selecionar apenas colunas necessárias |
