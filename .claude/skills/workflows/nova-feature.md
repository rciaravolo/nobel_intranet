---
name: nova-feature
description: Fluxo completo para implementar uma feature nova — breakdown por camadas, ordem de agentes, branch e critérios de aceite
type: workflow
version: 1
---

## Canonical
Processo padrão para decompor e executar qualquer feature nova no INTRA. Garante que todas as camadas sejam consideradas e que os agentes recebam contexto adequado.

## Entry Point
**Invocar quando:**
- "implementa [feature X]" (escopo não trivial — envolve >1 agente)
- "planeja a implementação de Y"
- pm-intranet recebe tarefa complexa

**NÃO invocar para:**
- bug fix isolado em 1 arquivo (ir direto ao agente responsável)
- mudança de estilo/texto em componente existente
- query nova sem UI nova

## Source of Truth
- `pm-intranet.md` — template de breakdown
- `CLAUDE.md` seção "Fluxo de PR" — processo de PR e deploy

## Scope Resolver
**DENTRO:** decomposição da feature, ordem de execução, critérios de aceite, criação de branch

**FORA:** implementação em si (cada agente cuida da sua camada), design detalhado (ver `dominio/design-system.md`)

## Evidence Gates
- Confirmar que a feature não está duplicando algo já existente (`dominio/navigation-map.md`)
- Confirmar que as convenções de nomenclatura serão seguidas (`dominio/naming-conventions.md`)
- Confirmar que existe branch criada ANTES de delegar para agentes

## Mutation Boundary
**PODE:** criar branch, criar arquivo de documentação em `docs/features/[nome].md`
**NUNCA:** commitar código diretamente na main; nunca implementar sem breakdown aprovado em tarefas grandes

## Verification Protocol
1. Todos os itens do checklist de sub-tarefas marcados como completos?
2. CI passou (Biome + TypeScript + Vitest)?
3. Preview URL gerado pelo Cloudflare?
4. Rafa aprovou o preview antes do merge?

## Output Contract
Produz: branch criada + breakdown documentado + PR ao final. Formato do branch: `feat/[nome-kebab-case]`.

## Companion Reference
- `dominio/navigation-map.md` — onde a feature se encaixa
- `dominio/naming-conventions.md` — como nomear rotas e entidades
- `workflows/pr-deploy.md` — processo de PR e deploy
- Agentes: `pm-intranet` (coordena), `content-architect` → `design-intranet` → `backend-intranet` + `frontend-intranet` → `devops-intranet`

## Feedback Loop
Se o breakdown subestimou ou superestimou o esforço, registrar no PR description para calibrar futuros estimates.

---

## Processo

### 1. Mapear Impacto

Antes de qualquer código, responder:

| Camada | Afetada? | O quê? |
|--------|----------|--------|
| DB (D1) | sim/não | nova tabela, nova coluna, nova view? |
| API (Worker) | sim/não | nova rota, novo endpoint? |
| UI (Next.js) | sim/não | nova página, novo componente? |
| Infra (CF) | sim/não | novo bucket R2, novo binding? |

### 2. Estimar Complexidade

| Tamanho | Critério | Ação |
|---------|----------|------|
| **Pequena** | 1 agente, <2h | ir direto ao agente |
| **Média** | 2-3 agentes | pm-intranet cria breakdown, executa em sequência |
| **Grande** | todos os agentes | pm-intranet apresenta plano ao Rafa antes de executar |

### 3. Template de Breakdown

```markdown
## Feature: [Nome]

### Contexto
[Por que estamos fazendo isso — motivação de negócio]

### Sub-tarefas

**1. content-architect** (primeiro — define estrutura)
- [ ] Mapear navegação/páginas afetadas
- [ ] Definir tipos de conteúdo
- [ ] Preencher template em docs/features/[nome].md

**2. design-intranet** (segundo — define visual)
- [ ] Criar/adaptar componentes necessários
- [ ] Definir estados (loading, erro, vazio, sucesso)

**3. backend-intranet** (paralelo com frontend)
- [ ] Schema D1 se necessário
- [ ] Endpoints da API com Zod e role filter
- [ ] Testes da rota

**4. frontend-intranet** (paralelo com backend)
- [ ] Páginas Next.js
- [ ] Integração com API
- [ ] Testes de componente

**5. devops-intranet** (somente se necessário)
- [ ] Variáveis de ambiente novas
- [ ] Infra Cloudflare nova

### Branch
feat/[nome-da-feature]

### Critérios de Aceite
- [ ] [O usuário consegue fazer X]
- [ ] [Dado Y está correto]
- [ ] [CI verde]
```

### 4. Ordem de Delegação

```
content-architect → design-intranet → frontend-intranet ─┐
                                    → backend-intranet  ──┴→ devops-intranet (se necessário)
```

Backend e Frontend podem rodar **em paralelo** após design.

### 5. Regras de Delegação

- Sempre criar a branch ANTES de delegar
- Sempre passar contexto explícito a cada agente (não assumir que lembram)
- Para tarefas grandes: apresentar breakdown ao Rafa antes de executar
- Ao final: criar PR via `workflows/pr-deploy.md`
