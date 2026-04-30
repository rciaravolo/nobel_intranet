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
Frontend:   Next.js (App Router) + React 19 + TypeScript
Styling:    Tailwind CSS v4 + shadcn/ui
Linting:    Biome (lint + format — substitui ESLint + Prettier)
Testes:     Vitest + Testing Library
Backend:    Cloudflare Workers + Hono
ORM:        Prisma (com D1 adapter)
Banco:      Cloudflare D1 (SQLite edge)
Storage:    Cloudflare R2
Auth:       Cloudflare Access (zero-trust)
Deploy:     Cloudflare Pages (frontend) + Cloudflare Workers (API)
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
npm run dev              # Next.js dev server (local)
cd server && npm run dev # Cloudflare Worker local

# Qualidade
npm run check            # Biome: lint + format check
npm run check:fix        # Biome: auto-fix
npm run typecheck        # TypeScript check
npm run test             # Vitest

# Build
npm run pages:build      # Build frontend para Cloudflare Pages
npm run deploy:worker    # Deploy Worker para produção

# Deploy
npm run pages:deploy     # Deploy frontend para Cloudflare Pages
```

## Design System — Regras Fundamentais (NUNCA violar)

> Referência canônica: `design system nobel/Nobel Operational System.html`
> Guidelines completas: `NOBEL_DESIGN_GUIDELINES.md`

### Tipografia

- **Inter Tight** é a única fonte permitida em telas operacionais (dashboard, analises, blocos de dados)
- **JetBrains Mono** para: números financeiros, KPI values, labels mono, metadados, timestamps
- **Cormorant Garamond** (`var(--f-display)`) é EXCLUSIVO da página de login (lado editorial/brand) e do logotipo na Sidebar — NUNCA usar em headings, títulos de página ou labels operacionais
- Headings de página: `font-family: var(--f-text)`, `font-weight: 600`, `letter-spacing: -.02em`
- Section headers de bloco: `font-family: var(--f-text)`, `font-weight: 600`, `font-size: 13px`
- Valores financeiros grandes: `font-family: var(--f-mono)`, `font-weight: 500`, `font-feature-settings: "tnum"`

### Tokens de Cor — Fonte de Verdade

```
Azul accent (light): --color-b-500: #2D5FA0   ← NÃO usar #6094D6 no light mode
Azul accent (dark):  --b-500: #6094D6          ← apenas em .dark / [data-theme="dark"]
Linha/border:        --line → var(--color-n-150) → #E2DDD3   (mais suave)
Linha forte:         --line-strong → var(--color-n-200) → #D4CEC1
```

### Elevation — Regra de Uso

- Cards operacionais padrão: `border: 1px solid var(--line)` + `box-shadow: 0 1px 4px var(--n-50)` (flat, sem float)
- Float/destaque especial: `var(--e-float)` apenas para elementos que devem "descolar" visualmente
- Tabelas e feeds: zero shadow, só `border: 1px solid var(--line)`

### Sidebar — Active State

- Item ativo: `background: var(--fg)` (invertido, fundo escuro), texto e ícone `var(--bg)`
- Item hover: `background: var(--bg)` (leve tint)
- Avatar do usuário: circular (`border-radius: 50%`), `background: var(--color-b-500)`, `color: #fff`, `font-family: var(--f-mono)`

### Badges — pos/neg

- Positivo: `background: var(--pos-bg)`, `color: var(--pos-fg)`, `border-color: transparent` (FILLED, não outline)
- Negativo: `background: var(--neg-bg)`, `color: var(--neg-fg)`, `border-color: transparent` (FILLED, não outline)

### Tailwind v4 com Turbopack — Armadilhas Conhecidas

- `@theme` NÃO aceita `var()` — apenas valores estáticos (hex, px, etc.)
- NÃO criar `postcss.config.mjs` — quebra o Turbopack (Next.js 15+ processa Tailwind v4 nativamente)
- Utilities geradas automaticamente: `bg-b-500`, `text-fg`, `font-mono`, etc.

---

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
NEXT_PUBLIC_API_URL
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

## Fluxo de PR

1. Agente cria branch e implementa
2. `gh pr create` com título e descrição
3. GitHub Actions executa: Biome → TypeScript → Vitest
4. Cloudflare Pages cria preview URL automática
5. Telegram envia link para o Rafa testar
6. Rafa aprova → merge → deploy automático em produção
