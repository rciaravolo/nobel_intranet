---
name: security-checklist
description: Checklist unificado de segurança INTRA — NUNCA/SEMPRE de todos os agentes consolidados em um só lugar
type: padrao
version: 1
---

## Canonical
Regras de segurança não-negociáveis do INTRA, consolidadas de todos os agentes. Qualquer código que viole uma dessas regras deve ser corrigido antes de mergear.

## Entry Point
**Invocar quando:**
- revisar PR antes de solicitar merge
- "é seguro fazer X?"
- configurar secrets, env vars ou deploy
- criar rota de API nova
- qualquer dúvida sobre o que nunca fazer

**NÃO invocar para:**
- padrões de código sem impacto de segurança (ver `padroes/hono-route.md`)
- performance de query (ver `padroes/d1-query.md`)

## Source of Truth
- `backend-intranet.md` seção "Regras de Segurança"
- `data-intranet.md` seção "Regras de Segurança"
- `devops-intranet.md` seção "Regras de Segurança Críticas"
- `CLAUDE.md` seção "Regras de Segurança"

## Scope Resolver
**DENTRO:** secrets, JWT, SQL injection, force push, dados sensíveis em logs, permissões excessivas

**FORA:** performance, design, convenções de código sem impacto de segurança

## Evidence Gates
- Antes de qualquer merge: rodar o checklist da seção "Revisão de Segurança de PR"
- Antes de deploy em produção: confirmar que nenhum secret está em `.env` commitado

## Mutation Boundary
**PODE:** consultar para orientar decisões; adicionar novas regras quando vulnerabilidade for identificada
**NUNCA:** relaxar ou remover uma regra existente sem aprovação explícita

## Verification Protocol
1. Aplicar checklist de PR abaixo
2. Verificar `.gitignore` inclui `*.env*`, `.wrangler/`
3. `git log --all --grep="secret\|token\|password" --oneline` → nada sensível commitado?

## Output Contract
Referência — não produz output. Checklist a ser aplicado manualmente.

## Companion Reference
- `dominio/role-system.md` — controle de acesso por role
- `workflows/pr-deploy.md` — quando aplicar este checklist
- Agente: todos os agentes devem respeitar este checklist

## Feedback Loop
Se uma vulnerabilidade nova for identificada (em code review ou em produção), adicionar a regra aqui antes de qualquer correção de código.

---

## Checklist de Revisão de Segurança de PR

Aplicar antes de mergear qualquer PR:

### Secrets e Credenciais
- [ ] Nenhum `.env`, `.env.local`, `.env.production` commitado
- [ ] Nenhum token, API key ou senha em código (mesmo em comentário)
- [ ] `wrangler.toml` não contém valores sensíveis — apenas `[vars]` não-sensíveis
- [ ] Secrets do GitHub Actions estão em GitHub Secrets, não em código

### API e Autenticação
- [ ] Toda rota nova valida JWT do Cloudflare Access (`Cf-Access-Jwt-Assertion`)
- [ ] Role filter aplicado em toda rota que retorna dados por cliente/assessor
- [ ] `filter.type === 'denied'` retorna 403 imediatamente — sem fallback
- [ ] Nenhum stack trace exposto em respostas de produção (`{ error: 'Internal Server Error' }`)

### Banco de Dados
- [ ] Toda query usa prepared statements (`.prepare(sql).bind(...params)`)
- [ ] Nenhum input do usuário interpolado diretamente no SQL
- [ ] `SELECT *` sem LIMIT não está em tabelas grandes
- [ ] Dados sensíveis (emails, tokens) não estão em `console.log`

### Git e Deploy
- [ ] Nenhum `git push --force` na branch `main`
- [ ] Nenhum deploy com `--force` em produção
- [ ] `.gitignore` inclui: `*.env*`, `.wrangler/`, `.open-next/`, `*.local`

### Permissões
- [ ] Cloudflare API Token tem apenas permissões mínimas necessárias
- [ ] Cloudflare Access: política restrita a `@nobelcapital.com.br`
- [ ] Nenhuma rota exposta publicamente que deveria ser protegida

---

## Regras por Agente (Fonte)

### Backend
1. **SEMPRE** validar input com Zod antes de qualquer operação
2. **SEMPRE** verificar JWT do Cloudflare Access em rotas protegidas
3. **NUNCA** expor stack traces em respostas de produção
4. **NUNCA** fazer queries sem WHERE em tabelas grandes (full scan)
5. **SEMPRE** usar prepared statements (Prisma faz isso; D1 raw precisa de `.bind()`)
6. **NUNCA** logar dados sensíveis (emails, tokens, IDs de usuário)

### Banco de Dados
1. **SEMPRE** usar prepared statements — `.prepare(sql).bind(param)` — NUNCA interpolar input
2. **SEMPRE** aplicar `resolveFilter` em dados por cliente/assessor
3. **NUNCA** fazer `SELECT *` em tabelas grandes sem filtro
4. **NUNCA** criar índices desnecessários (escrita mais lenta)

### Infra / DevOps
1. **NUNCA** commitar `wrangler.toml` com secrets
2. **NUNCA** usar `--force` em deploys de produção
3. **SEMPRE** testar Worker localmente antes de deploy em produção
4. **NUNCA** expor Cloudflare API Token com permissões além do necessário
5. **SEMPRE** verificar se Cloudflare Access está ativo antes de ir a produção
6. **NUNCA** dar permissões de admin no Access — usar grupos restritos

### Git
1. **NUNCA** commitar `.env`, `.env.local`, `.env.production`
2. **NUNCA** colocar tokens, API keys ou secrets em código
3. **SEMPRE** usar variáveis de ambiente para configurações sensíveis
4. **NUNCA** fazer `git push --force` na branch `main`

---

## GitHub Secrets Necessários

Configurar em: GitHub repo → Settings → Secrets and variables → Actions

| Secret | Descrição | Onde obter |
|--------|-----------|-----------|
| `CLOUDFLARE_API_TOKEN` | Token de deploy | Cloudflare → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta | Cloudflare Dashboard → lado direito |
| `NEXT_PUBLIC_API_URL` | URL da API Worker | URL do Worker em produção |
| `TELEGRAM_BOT_TOKEN` | Token do bot | @BotFather → /newbot |
| `TELEGRAM_CHAT_ID` | ID do chat do Rafa | @userinfobot |
