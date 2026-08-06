---
name: d1-migration
description: Como adicionar tabela ou coluna ao D1 — SQL, wrangler apply, Prisma sync, update do d1-schema.md
type: workflow
version: 1
---

## Canonical
Processo para modificar o schema do Cloudflare D1. Toda mudança de banco passa por este fluxo: escrever SQL → aplicar local → aplicar produção → atualizar documentação.

## Entry Point
**Invocar quando:**
- "adiciona tabela X"
- "adiciona coluna Y na tabela Z"
- feature nova requer dados persistidos que não existem no banco
- `data-intranet` ou `backend-intranet` precisa modificar o schema

**NÃO invocar para:**
- criar VIEW (não é migration — ver `dominio/d1-schema.md` seção Views)
- alterar query existente sem mudar schema
- adicionar índice sem alterar estrutura de tabela (pode ser migration simples)

## Source of Truth
- `server/prisma/schema.prisma` — schema Prisma (sincronizado com D1)
- Histórico de migrations: `npx wrangler d1 migrations list intra-db`
- `dominio/d1-schema.md` — documentação do schema (deve ser atualizada)

## Scope Resolver
**DENTRO:** criação de migration SQL, apply local e produção, sync Prisma, documentação do schema

**FORA:** lógica de query (ver `padroes/d1-query.md`), role filter (ver `dominio/role-system.md`), deploy da aplicação (ver `workflows/pr-deploy.md`)

## Evidence Gates
- Verificar que a tabela/coluna não existe já (`wrangler d1 execute PERF_DB --command ".schema"`)
- SQLite D1 **não suporta** `ALTER TABLE ADD COLUMN NOT NULL` sem default — verificar antes
- Em produção: migrations são irreversíveis — confirmar com Rafa antes de aplicar

## Mutation Boundary
**PODE:** criar arquivo de migration, aplicar em `--local`, aplicar em produção após aprovação
**NUNCA:** aplicar migration em produção sem ter testado localmente; dropar tabela existente sem autorização explícita

## Verification Protocol
1. `wrangler d1 execute PERF_DB --local --command ".schema"` → tabela aparece?
2. Inserir dado de teste e fazer SELECT?
3. `npx prisma generate` sem erros?
4. Aplicar em produção e verificar via `wrangler d1 execute PERF_DB --command ".schema"`
5. Atualizar `dominio/d1-schema.md` e confirmar que o registro está correto

## Output Contract
Produz: arquivo SQL em `server/prisma/migrations/` + schema Prisma atualizado + `dominio/d1-schema.md` atualizado.

## Companion Reference
- `dominio/d1-schema.md` — atualizar após a migration
- `padroes/d1-query.md` — como usar a nova tabela com segurança
- Agente: `data-intranet`, `backend-intranet`, `devops-intranet` (produção)

## Feedback Loop
Se uma migration falhar em produção, documentar o erro e a solução no PR para referência.

---

## Limitações SQLite/D1 que Afetam Migrations

| Limitação | Workaround |
|-----------|-----------|
| `ALTER TABLE ADD COLUMN NOT NULL` sem default | Adicionar com default: `ADD COLUMN x TEXT NOT NULL DEFAULT ''` |
| Sem `ALTER TABLE DROP COLUMN` (SQLite < 3.35) | Recriar a tabela |
| Sem `ALTER TABLE RENAME COLUMN` (SQLite < 3.25) | Recriar a tabela |
| Sem transactions cross-statement no D1 | Cada `prepare().run()` é atômico |

## Passo a Passo

### 1. Criar Arquivo de Migration

```bash
npx wrangler d1 migrations create intra-db nome-descritivo
# Cria: server/prisma/migrations/0001_nome-descritivo.sql
```

### 2. Escrever o SQL

```sql
-- server/prisma/migrations/0001_add-tabela-metas.sql

-- Nova tabela
CREATE TABLE IF NOT EXISTS metas_mensais (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  id_assessor TEXT    NOT NULL,
  mes         TEXT    NOT NULL,  -- 'YYYY-MM'
  meta_cap    REAL    NOT NULL DEFAULT 0,
  meta_rec    REAL    NOT NULL DEFAULT 0,
  criado_em   TEXT    NOT NULL DEFAULT (date('now'))
);

-- Índices para colunas de filtro frequente
CREATE INDEX IF NOT EXISTS idx_metas_assessor ON metas_mensais(id_assessor);
CREATE INDEX IF NOT EXISTS idx_metas_mes      ON metas_mensais(mes);
```

### 3. Aplicar Localmente

```bash
npx wrangler d1 migrations apply intra-db --local

# Verificar
npx wrangler d1 execute intra-db --local --command ".schema"
npx wrangler d1 execute intra-db --local --command "SELECT * FROM metas_mensais LIMIT 5"
```

### 4. Sincronizar Prisma

```bash
# Se usar Prisma, adicionar o modelo em schema.prisma
# Depois:
npx prisma generate
```

Exemplo de modelo Prisma para a tabela acima:
```prisma
model MetasMensais {
  id          Int    @id @default(autoincrement())
  id_assessor String
  mes         String
  meta_cap    Float  @default(0)
  meta_rec    Float  @default(0)
  criado_em   String @default(dbgenerated("date('now')"))

  @@index([id_assessor])
  @@index([mes])
  @@map("metas_mensais")
}
```

### 5. Aplicar em Produção

```bash
# SEMPRE testar localmente antes
npx wrangler d1 migrations apply intra-db

# Verificar em produção
npx wrangler d1 execute intra-db --command ".schema"
```

### 6. Atualizar Documentação

- Adicionar tabela em `dominio/d1-schema.md`
- Incluir migration no PR (automático via git)
- O `deploy-prod.yml` aplica migrations automaticamente no merge

## Template de Nova Tabela (Boas Práticas)

```sql
CREATE TABLE IF NOT EXISTS [nome_snake_case] (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  id_assessor TEXT    NOT NULL,              -- se filtrável por assessor
  id_cliente  INTEGER,                        -- se relacionado a cliente
  
  -- campos de negócio
  [campo]     [TIPO]  NOT NULL DEFAULT [valor],
  
  -- referência temporal (SEMPRE incluir em tabelas analíticas)
  data_ref    TEXT    NOT NULL DEFAULT (date('now')),
  criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Índices obrigatórios para colunas de filtro
CREATE INDEX IF NOT EXISTS idx_[tabela]_assessor ON [nome_snake_case](id_assessor);
```
