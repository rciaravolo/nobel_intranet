# Arquitetura do INTRA

## Visão Geral

O INTRA é o sistema de intranet da Nobel Capital. Toda a infraestrutura de aplicação roda na Cloudflare (edge global), com o frontend deployado na Vercel.

## Diagrama

```
┌─────────────────────────────────────────────────────────┐
│                    DESENVOLVIMENTO                       │
│                                                          │
│  Rafa → Termius SSH → VPS Hostinger                     │
│                            │                            │
│                       tmux + Claude Code                 │
│                       (agente persistente)               │
└────────────────────────────┼────────────────────────────┘
                             │ git push / gh pr create
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      GitHub                              │
│                                                          │
│  main branch ← PR ← feature branches                    │
│       │                    │                            │
│       │              GitHub Actions                      │
│       │              ├── biome check                     │
│       │              ├── tsc --noEmit                    │
│       │              ├── vitest                          │
│       │              └── deploy preview (Vercel)         │
│       │                    │                            │
│       │                    └── Telegram → 📱 Rafa        │
└───────┼────────────────────────────────────────────────┘
        │ merge
        ▼
┌─────────────────────────────────────────────────────────┐
│                    PRODUÇÃO                              │
│                                                          │
│  Cloudflare Access (Zero Trust)                          │
│  └── Somente @nobelcapital.com.br pode acessar          │
│                                                          │
│  Vercel (Frontend — Next.js)                             │
│  └── intra.nobelcapital.com.br                          │
│                                                          │
│  Cloudflare Workers (API — Hono)                         │
│  └── api.intra.nobelcapital.com.br                      │
│                                                          │
│  Cloudflare D1 (Banco — SQLite edge)                     │
│  Cloudflare R2 (Storage — arquivos/uploads)              │
└─────────────────────────────────────────────────────────┘
```

## Decisões Arquiteturais

### Por que Cloudflare Access para auth?
Zero-trust significa que não precisamos construir login/cadastro. A Cloudflare valida a identidade do usuário (Google SSO com email @nobelcapital.com.br) e injeta um JWT assinado em cada request. O Worker valida esse JWT. Segurança de nível enterprise sem código de auth próprio.

### Por que Vercel para o frontend?
Next.js tem suporte de primeira classe na Vercel. Preview deployments por PR são nativos e gratuitos, o que é central para o nosso fluxo de trabalho com o Claude.

### Por que Cloudflare D1 e não PostgreSQL?
D1 é SQLite na edge — zero latência para queries simples, sem cold start de conexão. Para um intranet corporativo com volume moderado, é mais que suficiente e elimina a necessidade de gerenciar um servidor de banco.

### Por que Hono e não tRPC?
Hono é agnóstico de runtime, funciona perfeitamente no Workers, é extremamente rápido e tem tipagem forte. O tRPC adiciona complexidade de setup que não se justifica no início.

### Por que Biome e não ESLint + Prettier?
Biome é 50-100x mais rápido, menos configuração, e já vem com linting e formatting integrados. Sem problemas de conflito entre as duas ferramentas.

## Segurança — Camadas

```
Layer 1: Cloudflare Access
  → Bloqueia qualquer request sem JWT válido
  → Apenas emails @nobelcapital.com.br autorizados

Layer 2: Cloudflare Workers (middleware de auth)
  → Valida o JWT do Cloudflare Access em cada rota
  → Extrai o email do usuário do JWT

Layer 3: Zod validation
  → Todo input de usuário validado no Worker antes de tocar o banco

Layer 4: Prisma (prepared statements)
  → Zero risco de SQL injection

Layer 5: HTTPS everywhere
  → Cloudflare força HTTPS em toda a cadeia
```

## Fluxo de Deploy

```
1. Claude abre PR no GitHub
2. GitHub Actions executa CI (biome, tsc, vitest)
3. Vercel cria preview deploy automaticamente
4. GitHub Actions pega a URL do preview
5. Telegram envia link para o Rafa
6. Rafa testa no celular
7. Rafa aprova e faz merge na main
8. GitHub Actions executa:
   a. wrangler deploy (Worker para Cloudflare)
   b. wrangler d1 migrations apply (migrations do banco)
   c. vercel --prod (frontend para Vercel)
9. Telegram notifica deploy concluído
```

## Variáveis de Ambiente

| Variável | Onde usar | Descrição |
|----------|-----------|-----------|
| `CLOUDFLARE_API_TOKEN` | GitHub Secrets | Token da API Cloudflare (CI/CD) |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Secrets | ID da conta Cloudflare |
| `CF_ACCESS_AUD` | Worker env | AUD tag do Cloudflare Access |
| `CF_ACCESS_TEAM_DOMAIN` | Worker env | Domínio do time no Access |
| `VERCEL_TOKEN` | GitHub Secrets | Token de deploy Vercel |
| `VERCEL_ORG_ID` | GitHub Secrets | ID da org Vercel |
| `VERCEL_PROJECT_ID` | GitHub Secrets | ID do projeto Vercel |
| `TELEGRAM_BOT_TOKEN` | GitHub Secrets | Token do bot Telegram |
| `TELEGRAM_CHAT_ID` | GitHub Secrets | Chat ID do Rafa |
| `NEXT_PUBLIC_API_URL` | Vercel env | URL do Worker (público) |
| `ANTHROPIC_API_KEY` | VPS ~/.bashrc | Chave do Claude Code (VPS apenas) |
