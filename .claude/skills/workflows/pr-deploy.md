---
name: pr-deploy
description: Fluxo de PR criação → CI → preview Cloudflare → merge → deploy produção — com Telegram notifications
type: workflow
version: 1
---

## Canonical
Processo padrão de entrega no INTRA: da branch ao deploy em produção. Inclui o que o CI verifica, como o preview funciona e o que acontece no merge.

## Entry Point
**Invocar quando:**
- feature ou fix está pronto para revisão
- "cria o PR de X"
- "como faço o deploy?"
- configurar CI para novo projeto ou novo workflow

**NÃO invocar para:**
- planejar a feature (ver `workflows/nova-feature.md`)
- criar infra Cloudflare nova (ver `devops-intranet.md`)

## Source of Truth
- `.github/workflows/ci.yml` — pipeline de PR
- `.github/workflows/deploy-prod.yml` — pipeline de produção
- `devops-intranet.md` — referência de infra e secrets

## Scope Resolver
**DENTRO:** criação de PR, CI pipeline, preview URL, merge, deploy prod, notificações Telegram

**FORA:** criação de infra Cloudflare (ver `devops-intranet.md`), secrets do GitHub (ver `padroes/security-checklist.md`)

## Evidence Gates
- CI deve estar verde (Biome + TypeScript + Vitest) antes de solicitar review
- Preview URL deve ser verificado manualmente antes de mergear
- Branch deve ser `feat/`, `fix/`, `chore/` ou `refactor/` (nunca commitar direto na main)
- `NUNCA` usar `--force` em deploy de produção

## Mutation Boundary
**PODE:** criar PR, merge após aprovação, deploy via GitHub Actions
**NUNCA:** `git push --force` na main; deploy manual em produção sem passar pelo CI

## Verification Protocol
1. `gh pr view` → CI checks todos verdes?
2. Preview URL carregando corretamente?
3. Feature testada no preview (golden path + edge case)?
4. Rafa aprovou?

## Output Contract
Produz: PR aberto com título + descrição estruturada + preview URL. Deploy prod ocorre automaticamente após merge na main.

## Companion Reference
- `workflows/nova-feature.md` — processo anterior ao PR
- `padroes/security-checklist.md` — o que nunca fazer no processo de deploy
- Agente: `devops-intranet`, `pm-intranet`

## Feedback Loop
Se CI falhar por motivo não óbvio, documentar causa e solução no PR description para referência futura.

---

## Fluxo Completo

```
branch feat/nome
    │
    ▼
git push origin feat/nome
    │
    ▼
gh pr create --title "feat(scope): descrição" \
             --body "## O que muda\n...\n## Como testar\n..."
    │
    ▼
GitHub Actions: ci.yml dispara automaticamente
    │   ├── npm ci --legacy-peer-deps
    │   ├── npx biome check (lint + format)
    │   ├── npx tsc --noEmit (typecheck)
    │   ├── npx vitest run (testes)
    │   ├── npm run pages:build (build CF)
    │   └── wrangler pages deploy --branch=pr-N → preview URL
    │
    ▼
Telegram → link do preview para o Rafa
    │
    ▼
Rafa testa → aprova o PR
    │
    ▼
Merge na main → deploy-prod.yml dispara
    │   ├── npm run pages:build
    │   ├── cd server && npm run deploy (Worker)
    │   ├── wrangler d1 migrations apply intra-db
    │   └── wrangler pages deploy --branch=main
    │
    ▼
Telegram → notifica deploy concluído em produção
```

## Comandos

```bash
# Criar PR
gh pr create \
  --title "feat(scope): descrição curta" \
  --body "$(cat <<'EOF'
## O que muda
- [bullet point]

## Como testar
- [ ] Acessar [URL]
- [ ] Verificar que [comportamento]

## Screenshots (se UI)
EOF
)"

# Verificar status do CI
gh pr checks

# Merge após aprovação
gh pr merge --squash --delete-branch
```

## Convenções de Título de PR

```
feat(scope): descrição curta    ← nova feature
fix(scope): descrição curta     ← bug fix
chore(scope): descrição curta   ← manutenção
refactor(scope): descrição curta
```

Scopes válidos: `auth`, `dashboard`, `ui`, `api`, `db`, `infra`, `ci`

## Secrets Necessários no GitHub

Ver `padroes/security-checklist.md` seção "GitHub Secrets".

## Quando NÃO Fazer Deploy

- Código com `console.log` de dados sensíveis
- Testes falhando
- TypeScript com erros (`any` explícito sem justificativa)
- Variáveis de ambiente não configuradas no Cloudflare
