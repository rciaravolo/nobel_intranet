---
name: d1-schema
description: Schema completo do Nobel Performance DB (PERF_DB) — quais tabelas existem, seus campos e quando usar cada uma
type: dominio
version: 1
---

## Canonical
Registro do modelo de dados do Cloudflare D1 `PERF_DB`. Consultar antes de escrever qualquer query para saber quais tabelas e campos estão disponíveis.

## Entry Point
**Invocar quando:**
- "qual tabela tem [dado]?"
- escrever uma query nova envolvendo dados de clientes, assessores, carteiras ou receita
- decidir se criar VIEW, tabela materializada ou query inline
- "tem campo X na tabela Y?"

**NÃO invocar para:**
- padrões de escrita de queries (ver `padroes/d1-query.md`)
- filtros por role (ver `dominio/role-system.md`)
- como executar migrations (ver `workflows/d1-migration.md`)

## Source of Truth
- `data-intranet.md` (seção Schema D1) — atualizado via ETL
- `server/src/routes/performance.ts` — queries existentes como referência viva
- Wrangler: `wrangler d1 execute PERF_DB --command ".schema"` para verificar estado atual

## Scope Resolver
**DENTRO:** estrutura de tabelas, campos, tipos, relações entre tabelas, quando usar VIEW vs tabela

**FORA:** lógica de filtro por role (`dominio/role-system.md`), performance de query (`padroes/d1-query.md`), como criar tabela nova (`workflows/d1-migration.md`)

## Evidence Gates
- Antes de referenciar um campo, confirmar que ele existe neste registro
- `analitico_rf` **não tem campo `ativo`** — só `tipo_ativo` (categoria). Verificar antes de usar.
- `tb_diversificador` **não tem `id_assessor`** — requer JOIN com `tb_positivador`

## Mutation Boundary
**PODE:** consultar este arquivo para escrever queries
**NUNCA:** modificar este arquivo diretamente sem rodar `wrangler d1 execute PERF_DB --command ".schema"` para confirmar o estado real

## Verification Protocol
1. Rodar `wrangler d1 execute PERF_DB --command ".schema"` e comparar com este registro
2. Se divergir, atualizar este arquivo e notificar o Rafa

## Output Contract
Skill de referência — não produz output. Consultado para informar queries e migrations.

## Companion Reference
- `dominio/role-system.md` — como filtrar os dados por permissão
- `padroes/d1-query.md` — como escrever queries seguras e performáticas
- `workflows/d1-migration.md` — como adicionar tabela/coluna
- Agente: `data-intranet`, `backend-intranet`

## Feedback Loop
Quando uma tabela for adicionada ou modificada via migration, atualizar este arquivo no mesmo PR.

---

## Tabelas de Posição e Carteira

```sql
tb_diversificador       -- posições individuais por cliente
  id_cliente            INTEGER
  produto               TEXT      -- ex: 'Renda Fixa', 'Renda Variável'
  sub_produto           TEXT
  ativo                 TEXT      -- ticker/nome do ativo individual
  emissor               TEXT
  data_vencimento       TEXT
  quantidade            REAL
  net                   REAL      -- valor financeiro
  data_posicao          TEXT      -- data do snapshot (filtrar por MAX)
  -- ⚠️ NÃO tem id_assessor — usar JOIN com tb_positivador

tb_positivador          -- snapshot AUM/status por assessor
  id_cliente            INTEGER
  status                TEXT      -- 'Ativo', 'Inativo', etc.
  tipo_pessoa           TEXT      -- 'PF', 'PJ'
  net_em_m              REAL      -- AUM em milhões
  afd_ajustada          REAL
  nome_assessor         TEXT
  equipe                TEXT
  id_assessor           TEXT
  data_posicao          TEXT

base_clientes           -- master data de clientes
  id_cliente            INTEGER   PRIMARY KEY
  nome_cliente          TEXT
  suitability           TEXT
  email_cliente         TEXT
  telefone              TEXT
```

## Tabelas Analíticas (pré-processadas pelo ETL)

```sql
analitico_rf            -- Renda Fixa agregada
  id_cliente            INTEGER
  id_assessor           TEXT
  indexador             TEXT      -- 'CDI', 'IPCA', 'Prefixado', etc.
  tipo_ativo            TEXT      -- ⚠️ categoria, NÃO ativo individual
  vencimento            TEXT
  posicao_atual         REAL
  flag_marcacao         TEXT      -- 'MaM', 'Na Curva'

analitico_rv            -- Renda Variável
  id_cliente            INTEGER
  id_assessor           TEXT
  ativo                 TEXT      -- ticker (ex: 'PETR4')
  setor                 TEXT
  produto               TEXT
  auc                   REAL
  variacao              REAL

posicao_coe             -- COE
  id_cliente            INTEGER
  id_assessor           TEXT
  tipo                  TEXT
  valor_compra          REAL
  posicao_atual         REAL
  cupom_recebido        REAL

custodia_ld             -- Liquidez Diária
  id_cliente            INTEGER
  id_assessor           TEXT
  indexador             TEXT
  custodia              REAL
```

## Tabelas de Receita

```sql
-- Tabelas (dados reais):
receita_rv, receita_rf, receita_feefixo, receita_seguros,
receita_cambio, receita_consorcio, receita_dominion,
receita_oferta_fundos, receita_coe
  id_assessor           TEXT
  receita               REAL

-- Views (calculadas em tempo real):
receita_fundos, receita_prev
  id_assessor           TEXT
  receita               REAL
```

## Tabelas de Assessores e Captação

```sql
assessores              -- master data de assessores
  id_assessor           TEXT      PRIMARY KEY
  nome_assessor         TEXT
  equipe                TEXT
  mail_assessor         TEXT

captacao_mensal         -- captação por mês
  id_assessor           TEXT
  mes                   TEXT      -- 'YYYY-MM'
  captacao_bruta        REAL
  resgates              REAL
  captacao_liquida      REAL

historico_aum           -- AUM histórico
  id_assessor           TEXT
  mes                   TEXT      -- 'YYYY-MM'
  aum                   REAL
```

## Guia Rápido: Qual Tabela Usar

| O que preciso | Tabela(s) |
|---------------|-----------|
| AUM por assessor | `tb_positivador` (filtrar `data_posicao = MAX`) |
| Posições de RF por cliente | `analitico_rf` JOIN `assessores` |
| Posições de RV por cliente | `analitico_rv` |
| Clientes de um assessor | `tb_positivador` WHERE `id_assessor = ?` |
| Receita total por assessor | UNION de todas `receita_*` |
| Nome do assessor | `assessores` WHERE `id_assessor = ?` |
| Captação do mês | `captacao_mensal` WHERE `mes = ?` |
| Ativo específico por cliente | `tb_diversificador` JOIN `tb_positivador` |
| Vencimento de RF | `analitico_rf`.`vencimento` |
| Setor de RV | `analitico_rv`.`setor` |

## Relações Importantes

```
tb_positivador.id_cliente  ←→  tb_diversificador.id_cliente (via JOIN)
tb_positivador.id_assessor ←→  assessores.id_assessor
tb_positivador.id_cliente  ←→  base_clientes.id_cliente
analitico_rf.id_assessor   ←→  assessores.id_assessor
```
