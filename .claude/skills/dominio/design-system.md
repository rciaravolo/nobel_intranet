---
name: design-system
description: Tokens de cor, tipografia, elevation e regras visuais canônicas do Nobel INTRA — fonte de verdade para qualquer decisão de design
type: dominio
version: 1
---

## Canonical
Registro único das regras visuais operacionais do Nobel INTRA. Qualquer decisão de cor, fonte, espaçamento ou componente deve ser verificada aqui antes de ser implementada.

## Entry Point
**Invocar quando:**
- "qual cor usar para X?"
- "qual fonte vai nesse heading / KPI / label?"
- "como estilizar um card / badge / sidebar item?"
- criar qualquer componente visual novo
- revisar se um componente segue o design system

**NÃO invocar para:**
- lógica de dados ou queries (ver `dominio/d1-schema.md`)
- estrutura de rotas ou navegação (ver `dominio/navigation-map.md`)
- templates de código de componente (ver `padroes/client-component.md`)

## Source of Truth
- `design system nobel/Nobel Operational System.html` — referência canônica visual
- `CLAUDE.md` seção "Design System — Regras Fundamentais" — regras em texto
- `src/app/globals.css` — implementação dos tokens em CSS

## Scope Resolver
**DENTRO:** tokens de cor, tipografia, espaçamento, elevation, sidebar, badges pos/neg, dark mode, estados visuais obrigatórios, acessibilidade mínima

**FORA:** código de componente React específico (ver `padroes/`), lógica de negócio, queries de dados

## Evidence Gates
- Antes de usar uma cor, verificar se o token existe neste arquivo
- Antes de usar Cormorant Garamond fora do login, parar — é proibido em contextos operacionais
- Antes de criar novo token, verificar se não existe equivalente já definido

## Mutation Boundary
**PODE:** propor adição de token se justificado e validado com Rafa
**NUNCA:** alterar tokens existentes sem aprovação; sobrescrever `var(--fg)` ou `var(--bg)` com valores hardcoded

## Verification Protocol
1. Abrir `design system nobel/Nobel Operational System.html` no browser
2. Confirmar que a cor/fonte/componente implementado corresponde visualmente ao reference
3. Testar dark mode (toggle `data-theme="dark"`)
4. Verificar contraste: texto normal ≥ 4.5:1, texto grande ≥ 3:1

## Output Contract
Skill de referência — não produz output. É consultado; o agente que o consulta produz o código.

## Companion Reference
- `padroes/client-component.md` — como construir o componente que usa esses tokens
- `padroes/security-checklist.md` — não relevante
- Agente: `design-intranet` (executa), `frontend-intranet` (consome)

## Feedback Loop
Quando uma regra precisar de atualização, adicionar nota abaixo de `## Histórico de Mudanças` com data e motivo.

---

## Tipografia

| Contexto | Fonte | Classe Tailwind |
|----------|-------|-----------------|
| Telas operacionais (default) | Inter Tight | `font-text` / `var(--f-text)` |
| Números financeiros, KPIs, timestamps | JetBrains Mono | `font-mono` / `var(--f-mono)` |
| Login (lado editorial) e logotipo sidebar | Cormorant Garamond | `font-display` / `var(--f-display)` |

**Regras estritas:**
- `--f-display` (Cormorant) → EXCLUSIVO de `/login` e logotipo da Sidebar. NUNCA em headings operacionais.
- Headings de página: `font-family: var(--f-text)`, `font-weight: 600`, `letter-spacing: -.02em`
- Section headers de bloco: `var(--f-text)`, `font-weight: 600`, `font-size: 13px`
- Valores financeiros grandes: `var(--f-mono)`, `font-weight: 500`, `font-feature-settings: "tnum"`

## Tokens de Cor

```css
/* Azul accent */
--color-b-500: #2D5FA0   /* light mode — NÃO usar #6094D6 no light */
/* Em .dark: --b-500: #6094D6 */

/* Linhas e bordas */
--line       → var(--color-n-150) → #E2DDD3   /* borda padrão (suave) */
--line-strong → var(--color-n-200) → #D4CEC1  /* borda forte */

/* Superfícies */
--bg          /* fundo da página */
--bg-elev     /* fundo de card elevado */
--fg          /* foreground invertido (used in active sidebar) */

/* Semânticos */
--pos-bg / --pos-fg   /* verde positivo — badges FILLED */
--neg-bg / --neg-fg   /* vermelho negativo — badges FILLED */
```

## Elevation

| Contexto | Regra |
|----------|-------|
| Cards operacionais padrão | `border: 1px solid var(--line)` + `box-shadow: 0 1px 4px var(--n-50)` |
| Cards em destaque | `var(--e-float)` |
| Tabelas e feeds | sem shadow — só `border: 1px solid var(--line)` |
| Border radius | `12px` fixo para cards (`rounded-xl`) |

## Sidebar

- Item **ativo**: `background: var(--fg)` (invertido), texto e ícone `var(--bg)`
- Item **hover**: `background: var(--bg)` (leve tint)
- Avatar: circular (`border-radius: 50%`), `background: var(--color-b-500)`, `color: #fff`, `font-family: var(--f-mono)`

## Badges

- **Positivo**: `background: var(--pos-bg)`, `color: var(--pos-fg)`, sem border → estilo FILLED
- **Negativo**: `background: var(--neg-bg)`, `color: var(--neg-fg)`, sem border → estilo FILLED
- NUNCA usar outline badge para pos/neg

## Estados Visuais Obrigatórios

Todo componente de dados deve ter **os 4 estados**:
1. **Loading** — Skeleton com `animate-pulse`
2. **Vazio** — Mensagem + ícone + CTA quando aplicável
3. **Erro** — Mensagem descritiva + botão retry
4. **Sucesso** — Toast via sonner

## Acessibilidade Mínima

- Contraste: texto normal ≥ 4.5:1 / texto grande e ícones ≥ 3:1
- Todo `<img>` com `alt` descritivo
- Todo botão/link com texto acessível ou `aria-label`
- Focus visible em todos elementos interativos

## Tailwind v4 — Armadilhas

- `@theme` NÃO aceita `var()` — apenas valores estáticos (hex, px)
- `postcss.config.mjs` com `@tailwindcss/postcss` é obrigatório para o build webpack (produção)
- Utilities geradas automaticamente: `bg-b-500`, `text-fg`, `font-mono`, etc.

## Histórico de Mudanças
<!-- Adicionar aqui quando uma regra mudar, com data e motivo -->
