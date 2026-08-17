# Página NPS — Design Spec

**Data**: 2026-08-11
**Autor**: Rafael (via brainstorming com Claude)
**Status**: Aprovado, pronto para implementação

## Objetivo

Criar uma página `/nps` na intranet para que assessores e gestores visualizem os envios de NPS do mês corrente (KPIs + tabela detalhada) e permitam que cada assessor baixe um CSV dos seus clientes pendentes de resposta.

## Escopo

**Dentro**:
- Nova página autenticada `/nps` (Server Component).
- Novo endpoint `/nps` no Worker (KPIs + linhas da tabela).
- Novo endpoint `/nps/pendentes.csv` no Worker (download CSV).
- Novo item na Sidebar, grupo Principal, após "Clientes".
- Filtro por role usando `resolveFilter()` existente.

**Fora**:
- Filtro temporal (mês corrente sempre — dado versionado externamente).
- Histórico ou séries temporais.
- Exportação em XLSX/PDF (só CSV).
- Testes de UI/página (segue padrão do projeto — só teste de rota).

## Fonte de dados

### Tabela `nps_envios` (D1 `nobel-performance-db`)

Colunas relevantes (mês corrente sempre):
- `id_assessor` (TEXT)
- `id_cliente` (INTEGER)
- `record_date` (TEXT — ISO)
- `email_sent` (TEXT — 'Sim'/'Não')
- `email_opened` (TEXT — 'Sim'/'Não')
- `survey_finished` (TEXT — 'Sim'/'Não')
- `nps_assessor` (REAL — 0-10, usar apenas `> 0` na média)
- `nps_xp` (REAL — atualmente todo NULL, ignorar)

### Merge com `base_clientes`

`LEFT JOIN base_clientes bc ON bc.id_cliente = ne.id_cliente` traz `nome_cliente`, `email_cliente`, `telefone`, `nome_assessor`. Fallback quando cliente não estiver mais na base: `'Cliente ' || ne.id_cliente`.

## Arquitetura

### Frontend

**`src/app/(auth)/nps/page.tsx`** — Server Component async. Padrão idêntico a `clientes/page.tsx`:
- `requireSession()` → `session { email, role, equipe, idAssessor, isDemo, name }`.
- `getNps(session)` → `apiFetch('/nps', { headers: X-User-* })`, retorna `null` em erro (try/catch).
- Se `session.isDemo`, usa `demoNps` mock em `src/lib/mock/demo.ts`.
- Renderiza `PageGreeting` → 4 KPI cards → botão CSV → `NpsTable`.

**`src/app/(auth)/nps/_components/NpsTable.tsx`** — Client Component (`'use client'`). Recebe `envios: Envio[]`. Paginação client-side de 100 rows/página. Colunas: `Cliente` (nome + id_cliente pequeno em mono), `Assessor`, `Envio` (data `DD/MM`), `Aberto` (badge), `Respondido` (badge), `Nota` (mono, cinza se null). Segue estilo de `ClientesTable`.

**`src/app/api/nps/route.ts`** — proxy Next.js → Worker (padrão do projeto para chamadas server-side).

**`src/app/api/nps/pendentes.csv/route.ts`** — proxy Next.js → Worker, encaminha `Content-Type: text/csv` e `Content-Disposition`. Aceita o header `download` do link `<a>`.

**Sidebar** (`src/app/(auth)/_components/Sidebar.tsx`) — adiciona novo item no grupo Principal entre "Clientes" e "Relatórios", seguindo o padrão inline dos outros:

```tsx
{
  href: '/nps',
  label: 'NPS',
  icon: (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5">
      {/* balão de mensagem + estrela — sugestão: */}
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <polygon points="12 8 13.5 10.5 16 11 14 13 14.5 15.5 12 14.3 9.5 15.5 10 13 8 11 10.5 10.5" />
    </svg>
  ),
}
```
(SVG final pode ser refinado na implementação; o importante é seguir o mesmo padrão inline: `viewBox="0 0 24 24"`, `stroke="currentColor"`, `strokeWidth="1.5"`.)

### Backend

**`server/src/routes/nps.ts`** — novo arquivo Hono, montado em `/nps` no `server/src/index.ts`.

**Middleware**: valida Bearer secret OR `Cf-Access-Jwt-Assertion` (padrão dos outros routes). NÃO restringe por role — o filtro é feito por `resolveFilter`.

**Endpoints**:

`GET /nps` → JSON:
```ts
{
  data: {
    kpis: {
      envios: number,
      aberturas: number,
      respostas: number,
      mediaNota: number | null
    },
    envios: Array<{
      idCliente: number,
      nomeCliente: string,
      emailCliente: string | null,
      telefone: string | null,
      nomeAssessor: string | null,
      recordDate: string,
      emailOpened: 'Sim' | 'Não' | null,
      surveyFinished: 'Sim' | 'Não' | null,
      nota: number | null
    }>
  }
}
```

`GET /nps/pendentes.csv` → `text/csv` com header:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="nps-pendentes-YYYY-MM-DD.csv"
```

Body: `nome_cliente,email_cliente,telefone,nome_assessor,record_date\n...`. Escape de `"`, `,` e `\n` via helper local (5 linhas, sem dependência nova).

## Queries SQL

Todas as queries recebem filtro por role via `resolveFilter()` (reuso do helper em `server/src/routes/performance.ts`).

### KPIs

```sql
SELECT
  SUM(CASE WHEN email_sent      = 'Sim' THEN 1 ELSE 0 END) AS envios,
  SUM(CASE WHEN email_opened    = 'Sim' THEN 1 ELSE 0 END) AS aberturas,
  SUM(CASE WHEN survey_finished = 'Sim' THEN 1 ELSE 0 END) AS respostas,
  ROUND(
    AVG(CASE WHEN survey_finished = 'Sim' AND nps_assessor > 0 THEN nps_assessor END),
    2
  ) AS media_nota
FROM nps_envios ne
WHERE 1=1
  {{ + filtro role }}
```

### Envios (tabela)

```sql
SELECT
  ne.id_cliente,
  COALESCE(bc.nome_cliente, 'Cliente ' || ne.id_cliente) AS nome_cliente,
  bc.email_cliente,
  bc.telefone,
  bc.nome_assessor,
  ne.record_date,
  ne.email_opened,
  ne.survey_finished,
  ne.nps_assessor AS nota
FROM nps_envios ne
LEFT JOIN base_clientes bc ON bc.id_cliente = ne.id_cliente
WHERE 1=1
  {{ + filtro role }}
ORDER BY ne.record_date DESC
```

### CSV de pendentes

```sql
SELECT
  COALESCE(bc.nome_cliente, 'Cliente ' || ne.id_cliente) AS nome_cliente,
  bc.email_cliente,
  bc.telefone,
  bc.nome_assessor,
  ne.record_date
FROM nps_envios ne
LEFT JOIN base_clientes bc ON bc.id_cliente = ne.id_cliente
WHERE ne.email_sent = 'Sim'
  AND (ne.survey_finished IS NULL OR ne.survey_finished != 'Sim')
  {{ + filtro role }}
ORDER BY ne.record_date DESC
```

## Filtro por role (padrão `resolveFilter`)

| Role | Escopo |
|------|--------|
| `admin` / `master` | Base inteira (sem cláusula extra) |
| `lider` | `AND ne.id_assessor IN (SELECT id_assessor FROM assessores WHERE equipe = ?)` |
| `lider_pj` / `assessor` | `AND ne.id_assessor = ?` |

`id_assessor` do usuário logado vem do header `X-User-Id-Assessor` já resolvido pelo Next.

## UI — tokens e padrão

### KPI cards (cópia fiel de `clientes/page.tsx:73-119`)

```ts
const card = {
  background: 'var(--bg-elev)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  boxShadow: 'var(--e-float)',
  overflow: 'hidden',
}
const kpiLabel = {
  fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500,
  color: 'var(--fg-faint)', textTransform: 'uppercase',
  letterSpacing: '.10em', marginBottom: 14,
}
const kpiValue = {
  fontFamily: 'var(--f-text)', fontSize: 34, fontWeight: 700,
  color: 'var(--fg)', lineHeight: 1,
  letterSpacing: '-.02em', marginBottom: 12,
}
const kpiPill = {
  fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 500,
  padding: '3px 10px', borderRadius: 'var(--r-pill)',
  background: 'var(--bg-deep)', color: 'var(--fg-mute)',
}
```

Grid: `repeat(4, 1fr)`, gap `var(--s-3)`, padding interno `22px 24px`.

### Accent bar dourada (só no 1º card — ENVIOS)

```tsx
<div style={{ position:'absolute', top:0, left:0, right:0, height:2,
              background:'linear-gradient(90deg, var(--c-gold), #D4AF6A)' }} />
```

### Os 4 KPIs

| # | Card | Value | Pill |
|---|------|-------|------|
| 1 | ENVIOS *(+accent bar)* | `envios` (locale pt-BR) | `base completa` (padrão cinza) |
| 2 | ABERTURAS | `aberturas` | verde (`pos-bg`/`pos-fg`), `X% dos envios` |
| 3 | RESPOSTAS | `respostas` | verde (`pos-bg`/`pos-fg`), `X% dos envios` |
| 4 | MÉDIA NOTA | `mediaNota.toFixed(2).replace('.', ',')` ou `—` | `sobre N respostas` (padrão) |

### Botão CSV

```tsx
<a href="/api/nps/pendentes.csv" download
   style={{
     display: 'inline-flex', alignItems: 'center', gap: 8,
     padding: '10px 16px', borderRadius: 10,
     border: '1px solid var(--line-strong)',
     background: 'var(--bg-elev)',
     color: 'var(--fg)', fontFamily: 'var(--f-mono)',
     fontSize: 12, textDecoration: 'none',
   }}>
  ↓ Baixar clientes pendentes (CSV)
</a>
```

### Tabela

- Wrapper: `border: 1px solid var(--line)`, `borderRadius: 12`, sem shadow (regra do design system para tabelas).
- Header linha: mono 11px uppercase `fg-faint`.
- Body: `f-text` 14px normal.
- Badges `Aberto`/`Respondido`: `filled` (não outline). Positivo (`Sim`): `pos-bg`/`pos-fg`. Negativo (`Não` ou NULL): `neg-bg`/`neg-fg`.
- Coluna `Nota`: `f-mono`, 500. NULL renderiza como `—` em `fg-faint`.
- Paginação 100 rows/página (padrão de Clientes).

## Estados

| Estado | UI |
|--------|----|
| Loading | Skeletons (padrão Suspense do projeto) |
| Sucesso | KPIs + tabela normal |
| Vazio (0 envios no escopo) | KPIs mostram `0`/`—`. Tabela: "Sem envios de NPS no período." |
| Erro (fetch falha) | Página inteira: "Não foi possível carregar dados de NPS." |
| Demo (`session.isDemo`) | Renderiza mock `demoNps` |

## Testes

**Estado atual do projeto**: não existem testes automatizados em `server/src/` (verificado — nenhum `.test.ts` no backend). Frontend também não tem testes de página.

**Estratégia desta feature**: seguir o padrão atual (validação manual, sem teste automatizado), para não inaugurar convenção nova em um ticket que já entrega valor por si só. Se quisermos começar a testar backend, isso vira uma iniciativa separada (spec próprio, aplicada retroativamente a todas as rotas).

**Validação manual obrigatória**:
- Rodar `npm run dev` (Next) + `cd server && npm run dev` (Worker).
- KPIs como admin batem com valores conhecidos: envios=744, aberturas=311, respostas=26, média=9,14 (números de 2026-08-11; mudam quando a base atualizar).
- Filtro por role: logar como assessor e conferir que só vê os próprios envios.
- CSV baixa com nome `nps-pendentes-YYYY-MM-DD.csv`, abre no Excel sem erro de encoding, e mostra apenas os pendentes (`survey_finished != 'Sim'`) do escopo do usuário.
- Botão renderiza para todos os roles (admin/master/lider/assessor).

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| `nps_envios` não versionada em `schema.ts` — alguém pode assumir que não existe | Documentar no spec (aqui) e no comentário do arquivo da rota |
| Se `nps_xp` começar a ter dados, KPI atual não muda automaticamente | Fora do escopo desta feature — abrir issue futura |
| `record_date` é TEXT ISO — ordenação lexicográfica pode falhar se formato mudar | Fora do escopo — hoje formato é consistente na base |
| Cliente removido de `base_clientes` gera "Cliente {id}" na UI | Aceitável — indica que o assessor perdeu o cliente e o envio ficou órfão |
| CSV com caracteres especiais quebrando no Excel | BOM UTF-8 (`﻿`) no início do body |

## Passos de implementação (referência para writing-plans)

1. Backend: criar `server/src/routes/nps.ts` com os dois endpoints + tipagem.
2. Montar rota em `server/src/index.ts`.
3. Frontend: criar `src/app/api/nps/route.ts` (proxy) e `src/app/api/nps/pendentes.csv/route.ts` (proxy).
4. Frontend: criar `src/app/(auth)/nps/page.tsx` (Server Component).
5. Frontend: criar `src/app/(auth)/nps/_components/NpsTable.tsx` (Client Component).
6. Mock demo: adicionar `demoNps` em `src/lib/mock/demo.ts`.
7. Sidebar: adicionar item "NPS" em `src/app/(auth)/_components/Sidebar.tsx`.
8. Validação manual: dev server, testar como admin e como assessor.
9. Commit incremental por camada (backend → proxy → page → sidebar).
