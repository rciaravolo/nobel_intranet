---
name: navigation-map
description: Hierarquia atual do INTRA — sidebar, rotas existentes, onde encaixar features novas
type: dominio
version: 1
---

## Canonical
Mapa de navegação vivo do INTRA. Toda feature nova deve ser posicionada aqui antes de ser implementada. Evita rotas duplicadas e estrutura inconsistente.

## Entry Point
**Invocar quando:**
- "onde encaixar essa feature na navegação?"
- "a rota /X já existe?"
- planejar sidebar item para feature nova
- `content-architect` está mapeando uma feature nova

**NÃO invocar para:**
- convenções de nomeação da rota (ver `dominio/naming-conventions.md`)
- implementação da página (ver `workflows/nova-feature.md`)

## Source of Truth
- `src/app/` — estrutura de diretórios é a fonte viva
- `src/components/features/Sidebar.tsx` (ou equivalente) — itens visíveis na sidebar

## Scope Resolver
**DENTRO:** hierarquia de rotas, itens da sidebar, ícones, posição de novas features

**FORA:** implementação de página (ver `frontend-intranet`), nomeação (ver `naming-conventions.md`)

## Evidence Gates
- Antes de propor nova rota, verificar `src/app/` para confirmar que não existe
- Antes de adicionar item à sidebar, confirmar que a rota tem implementação (evitar links quebrados)

## Mutation Boundary
**PODE:** atualizar este mapa quando uma feature for implementada
**NUNCA:** adicionar rota aqui sem atualizar `src/app/` correspondente (ou vice-versa)

## Verification Protocol
1. Verificar `src/app/` e comparar com o mapa abaixo
2. Navegar manualmente no browser e confirmar que itens de sidebar correspondem às rotas

## Output Contract
Skill de referência — consultado para informar decisões de arquitetura de informação.

## Companion Reference
- `dominio/naming-conventions.md` — como nomear a rota
- `workflows/nova-feature.md` — como implementar a feature depois de mapeada
- Agente: `content-architect`, `pm-intranet`

## Feedback Loop
Atualizar este mapa no mesmo PR em que a feature é implementada.

---

## Mapa de Navegação Atual

```
/ → redirect para /dashboard

(auth)/                            ← grupo de rotas autenticadas (Sidebar + Header)
├── dashboard/                     # Visão geral — KPIs e gráficos principais
├── carteiras/                     # Análise de carteiras
│   ├── (listagem por assessor)
│   ├── rf/                        # Renda Fixa
│   ├── rv/                        # Renda Variável
│   ├── fundos/                    # Fundos (oculto — pendente dados)
│   └── prev/                      # Previdência (oculto — pendente dados)
├── captacao/                      # Captação e metas
│   ├── (visão geral)
│   └── [assessor-id]/             # Drill-down por assessor
├── indicadores/                   # PnL e indicadores por equipe/assessor
│   ├── (tabelas expandíveis)
│   └── [equipe]/                  # Drill-down por equipe
└── configuracoes/
    └── perfil/

(public)/                          ← sem autenticação
└── login/                         # Página de login (Cormorant Garamond permitido aqui)
```

## Sidebar — Itens e Ícones

| Item | Rota | Ícone Lucide | Posição |
|------|------|-------------|---------|
| Dashboard | `/dashboard` | `LayoutDashboard` | 1 |
| Carteiras | `/carteiras` | `Briefcase` | 2 |
| Captação | `/captacao` | `TrendingUp` | 3 |
| Indicadores | `/indicadores` | `BarChart2` | 4 |
| Configurações | `/configuracoes` | `Settings` | último (footer) |

## Próximas Features — Posições Sugeridas

| Feature | Posição sugerida na sidebar | Rota sugerida |
|---------|----------------------------|---------------|
| Relatórios | Entre Captação e Indicadores | `/relatorios` |
| Clientes | Entre Dashboard e Carteiras | `/clientes` |
| Agenda/CRM | Após Indicadores | `/agenda` |

## Regras de Posicionamento

1. Features de **dados** (ver números) → grupo principal da sidebar
2. Features de **ação** (criar, editar) → sub-rotas de uma feature de dados
3. Features **administrativas** → em `/configuracoes/`
4. Features **em desenvolvimento** → implementar rota, mas não adicionar à sidebar ainda

## Histórico de Mudanças
| Data | Mudança |
|------|---------|
| 2026-06 | `/indicadores` adicionado com tabelas expandíveis captação+receita |
| 2026-05 | `/carteiras` com RF/RV drill-down, Fundos/Prev ocultos |
