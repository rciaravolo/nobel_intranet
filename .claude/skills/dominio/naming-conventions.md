---
name: naming-conventions
description: Convenções de nomenclatura Nobel INTRA — rotas, entidades, labels de UI, termos de domínio em português
type: dominio
version: 1
---

## Canonical
Regras de nomenclatura para qualquer elemento nomeado no INTRA: URLs, entidades de negócio, labels de UI, variáveis de domínio. Garante consistência sem depender de memória individual.

## Entry Point
**Invocar quando:**
- definir rota URL para página ou API nova
- nomear entidade de negócio (cliente, assessor, carteira, captação...)
- escrever labels de botão, título de página ou mensagem de erro
- revisar se uma nomenclatura existente segue o padrão

**NÃO invocar para:**
- nomear variáveis TypeScript internas (convenção da linguagem se aplica)
- nomear tabelas D1 (ver `dominio/d1-schema.md`)
- estrutura de navegação (ver `dominio/navigation-map.md`)

## Source of Truth
- `content-architect.md` seção "Convenções de Nomenclatura"
- Páginas existentes em `src/app/` como referência viva

## Scope Resolver
**DENTRO:** URLs de página, rotas de API, nomes de entidades de negócio Nobel, labels de UI (botões, títulos, erros)

**FORA:** nomes de componentes React (PascalCase é regra da linguagem), nomes de tabelas SQL (ver `d1-schema.md`)

## Evidence Gates
- Verificar que novas rotas estão em português (não em inglês)
- Verificar que verbos de ação estão no infinitivo (não gerúndio)
- Verificar que termos Nobel estão na lista de domínio abaixo antes de inventar novos

## Mutation Boundary
**PODE:** adicionar novos termos de domínio à lista abaixo quando uma feature introduz entidade nova
**NUNCA:** renomear entidade já em uso sem update completo de todas as ocorrências

## Verification Protocol
1. Verificar URL no browser — está em português e kebab-case?
2. Verificar labels no componente — verbos no infinitivo nos botões, substantivos nos títulos?
3. Conferir se termo usado está na lista de domínio ou foi documentado aqui

## Output Contract
Skill de referência — consultado; o agente produz o nome com base nessas regras.

## Companion Reference
- `dominio/navigation-map.md` — onde a rota se encaixa na hierarquia
- `content-architect.md` — agente que aplica essas convenções
- Agente: `content-architect`, `frontend-intranet`

## Feedback Loop
Quando uma feature introduzir entidade nova, adicionar à lista de domínio abaixo antes de codificar.

---

## Rotas (URLs de página)

| Regra | Exemplo correto | Exemplo errado |
|-------|-----------------|----------------|
| Português | `/carteiras` | `/portfolios` |
| Kebab-case | `/relatorios-financeiros` | `/relatoriosFinanceiros` |
| Plural para listagens | `/assessores` | `/assessor` |
| Singular para ações | `/novo`, `/editar`, `/duplicar` | `/criar`, `/editing` |
| ID como segmento | `/assessores/[id]` | `/assessores?id=123` |

**Padrão de feature:**
```
/[entidade]               ← listagem
/[entidade]/novo          ← criação
/[entidade]/[id]          ← detalhe/edição
/[entidade]/[id]/duplicar ← ação secundária
```

## Rotas de API

| Regra | Exemplo correto |
|-------|-----------------|
| Prefixo `/api/v1/` | `/api/v1/assessores` |
| Verbos HTTP (não na URL) | `GET /carteiras` não `GET /buscar-carteiras` |
| Plural | `/api/v1/clientes` |
| Ação especial: POST em sub-recurso | `POST /api/v1/assessores/[id]/metas` |

## Labels de UI

| Contexto | Regra | Exemplo correto | Exemplo errado |
|----------|-------|-----------------|----------------|
| Botão de ação | Verbo no infinitivo | "Criar assessor" | "Criando", "Novo assessor" |
| Título de página | Substantivo (plural) | "Assessores" | "Ver assessores" |
| Título de seção | Substantivo | "Carteiras por equipe" | "Visualizar carteiras" |
| Mensagem de erro | Descritiva + acionável | "Não foi possível carregar. Tentar novamente." | "Erro 500" |
| Mensagem vazia | Descritiva + CTA | "Nenhum assessor encontrado. Adicionar assessor." | "Sem dados" |
| Confirmação de ação | Verbo no passado | "Assessor criado com sucesso" | "OK" |

## Termos de Domínio Nobel

| Termo | Significado | Usar / Evitar |
|-------|-------------|---------------|
| Assessor | Profissional de investimentos | "Assessor" (não "advisor") |
| Cliente | Investidor atendido pelo assessor | "Cliente" (não "customer" ou "investidor") |
| Equipe | Grupo de assessores | "Equipe" (não "time" ou "team") |
| Captação | Entrada líquida de recursos | "Captação" (não "captação bruta" para o líquido) |
| Captação bruta | Entradas sem descontar resgates | "Captação bruta" explícito |
| Resgates | Saída de recursos | "Resgates" (não "saques") |
| AUM | Assets Under Management — patrimônio gerido | "AUM" ou "Patrimônio" |
| Custódia | Valor total em custódia | "Custódia" (não "saldo" ou "patrimônio total") |
| Carteira | Portfolio de um cliente ou assessor | "Carteira" (não "portfolio") |
| RF | Renda Fixa | "RF" ou "Renda Fixa" |
| RV | Renda Variável | "RV" ou "Renda Variável" |
| Metas | Objetivos mensais por assessor | "Metas" (não "goals" ou "targets") |
| Dashboard | Tela de visão geral | "Dashboard" (aceito em PT) |
| Drill-down | Detalhar ao clicar | "Drill-down" ou "detalhar" |

## Histórico de Mudanças
<!-- Adicionar novas entidades aqui quando forem introduzidas -->
