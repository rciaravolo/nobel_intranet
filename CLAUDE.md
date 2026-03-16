# INTRA — Orquestrador Principal

## Visão Geral
Sistema de intranet corporativo da Nobel Capital. Este repositório é gerenciado por um time de agentes especializados coordenados por este arquivo.

## Time de Agentes

| Agente | Cor | Responsabilidade |
|--------|-----|-----------------|
| `pm-intranet` | 🟡 Amarelo | Coordenação, planejamento, breakdown de tasks |
| `backend-intranet` | 🟢 Verde | APIs, Prisma, DB, Cloudflare Auth |
| `frontend-intranet` | 🔵 Azul | Next.js pages, React components |
| `design-intranet` | 🟣 Magenta | Design system, UI/UX, Tailwind |
| `devops-intranet` | 🔴 Vermelho | Vercel, Cloudflare Access/R2/Tunnel |
| `content-architect` | 🩵 Ciano | Info architecture, navigation, content types |

## Protocolo de Orquestração

### Como Despachar para Agentes

Ao receber uma solicitação, siga este fluxo:

```
1. ANALISE o escopo da tarefa
2. IDENTIFIQUE quais agentes são necessários
3. CHAME pm-intranet primeiro para tarefas complexas (>1 agente)
4. EXECUTE os agentes em paralelo quando não há dependência entre eles
5. EXECUTE em sequência quando há dependência (ex: design antes de frontend)
6. CONSOLIDE os resultados e reporte ao usuário
```

### Ordem Natural de Dependência

```
content-architect → design-intranet → frontend-intranet
                                    ↘
pm-intranet (coordena tudo)          backend-intranet
                                    ↗
devops-intranet (infra base)
```

### Quando Usar Cada Agente

**Apenas backend-intranet:**
- "Cria uma API de X"
- "Adiciona campo Y no banco"
- "Implementa autenticação para Z"

**Apenas frontend-intranet:**
- "Cria a página de X"
- "Adiciona componente Y"
- "Corrige o layout de Z"

**Apenas design-intranet:**
- "Cria um novo componente visual"
- "Ajusta o design system"
- "Define tokens de cor/tipografia"

**Apenas devops-intranet:**
- "Configura o deploy de X"
- "Adiciona variável de ambiente"
- "Configura Cloudflare para Y"

**Apenas content-architect:**
- "Reorganiza a navegação"
- "Define estrutura de conteúdo para X"
- "Mapeia os tipos de página"

**pm-intranet + múltiplos:**
- "Implementa a feature completa de X" (envolve 3+ agentes)
- "Planeja o próximo sprint"
- "Faz um levantamento do que precisa mudar para Y"

## Stack do Projeto

```
Frontend:   Next.js 15 (App Router) + React 19 + TypeScript
Styling:    Tailwind CSS v4 + shadcn/ui
Linting:    Biome (lint + format — substitui ESLint + Prettier)
Testes:     Vitest + Testing Library
Backend:    Cloudflare Workers + Hono
ORM:        Prisma (com D1 adapter)
Banco:      Cloudflare D1 (SQLite edge)
Storage:    Cloudflare R2
Auth:       Cloudflare Access (zero-trust)
Deploy:     Vercel (frontend) + Cloudflare Workers (API)
CI/CD:      GitHub Actions
Notif:      Telegram Bot
```

## Estrutura do Projeto

```
INTRA/
├── CLAUDE.md                    # Este arquivo (orquestrador)
├── .claude/
│   └── settings.json           # Permissões automáticas dos agentes
├── agents/                     # Prompts/contexto de cada agente
│   ├── pm-intranet.md
│   ├── backend-intranet.md
│   ├── frontend-intranet.md
│   ├── design-intranet.md
│   ├── devops-intranet.md
│   └── content-architect.md
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Rotas protegidas
│   │   ├── (public)/           # Rotas públicas
│   │   └── api/                # API Routes Next.js
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn)
│   │   └── features/           # Componentes de feature
│   ├── lib/
│   │   ├── api/                # Client de API
│   │   ├── auth/               # Helpers de autenticação
│   │   └── utils/              # Utilitários gerais
│   └── db/
│       └── schema.prisma       # Schema do banco
├── server/                     # Cloudflare Worker (API)
│   ├── src/
│   │   ├── index.ts            # Entry point Hono
│   │   ├── routes/             # Rotas da API
│   │   └── middleware/         # Middlewares
│   └── wrangler.toml
├── docs/
│   └── architecture.md        # Decisões arquiteturais
├── scripts/                    # Scripts de automação
└── .github/
    └── workflows/
        ├── ci.yml              # CI no PR
        └── deploy-prod.yml     # Deploy ao merge na main
```

## Convenções de Commit

Usar **Conventional Commits**:
```
feat(scope): descrição curta
fix(scope): descrição curta
chore(scope): descrição curta
test(scope): descrição curta
docs(scope): descrição curta
refactor(scope): descrição curta
```

Scopes válidos: `auth`, `dashboard`, `ui`, `api`, `db`, `infra`, `ci`

## Convenções de Branch

```
feat/nome-da-feature
fix/descricao-do-bug
chore/o-que-foi-feito
refactor/o-que-foi-refatorado
```

## Comandos do Projeto

```bash
# Desenvolvimento
npm run dev              # Next.js dev server
npm run dev:worker       # Cloudflare Worker local

# Qualidade
npm run check            # Biome: lint + format check
npm run check:fix        # Biome: auto-fix
npm run typecheck        # TypeScript check
npm run test             # Vitest

# Build
npm run build            # Build frontend
npm run build:worker     # Build Worker

# Deploy
npm run deploy:worker    # Deploy Worker para produção
```

## Regras de Segurança (NUNCA violar)

1. **NUNCA commitar** `.env`, `.env.local`, `.env.production`
2. **NUNCA colocar** tokens, API keys ou secrets em código
3. **SEMPRE usar** variáveis de ambiente para configurações sensíveis
4. **NUNCA expor** endpoints sem autenticação (toda rota deve validar Cloudflare Access JWT)
5. **SEMPRE validar** inputs com Zod no backend
6. **NUNCA fazer** `git push --force` na branch `main`
7. O arquivo `.gitignore` deve sempre incluir `*.env*`, `.wrangler/`, `.vercel/`

## Variáveis de Ambiente

```bash
# .env.local (desenvolvimento — NUNCA commitar)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
DATABASE_URL=
NEXT_PUBLIC_API_URL=
CF_ACCESS_AUD=
CF_ACCESS_TEAM_DOMAIN=

# GitHub Secrets (CI/CD)
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## Fluxo de PR

1. Agente cria branch e implementa
2. `gh pr create` com título e descrição
3. GitHub Actions executa: Biome → TypeScript → Vitest
4. Cloudflare Pages / Vercel cria preview URL
5. Telegram envia link para o Rafa testar
6. Rafa aprova → merge → deploy automático em produção
