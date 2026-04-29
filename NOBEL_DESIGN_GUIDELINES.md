# Nobel Capital — Diretrizes de Design

> **Versão 1.0 · 2026 · pt-BR**
> Este documento é a fonte de verdade para qualquer projeto digital, impresso ou apresentação da Nobel Capital. Cole-o na raiz do repositório como `DESIGN.md` ou `NOBEL_DESIGN_GUIDELINES.md`. Use-o como referência ao decidir cor, tipografia, espaçamento, componente ou tom.

---

## 1. Princípios

A Nobel opera dois sistemas complementares — nunca os misture na mesma superfície:

| Sistema | Onde usar | Vocabulário |
|---|---|---|
| **Editorial** | Site institucional, peças de marca, decks executivos, relatórios para clientes, materiais impressos | Cormorant Garamond, ouro, fundo midnight, hairlines, respiro generoso |
| **Operacional** | Dashboards, plataforma do assessor, sistemas internos, ferramentas, formulários | Inter Tight, neutros levemente quentes, azul de sistema, ouro **só** para marca |

**Quatro princípios guiam toda decisão:**

1. **Permanência** — design que envelhece bem. Sem trends, sem gradientes saturados, sem efeitos brilhantes.
2. **Rigor** — toda decisão é justificada por hierarquia e função. Tipografia faz o trabalho que ícones tentariam fazer.
3. **Clareza** — dado nunca compete com decoração. Em dúvida, prefira menos.
4. **Discrição** — luxo é silêncio. O ouro entra como pontuação, não como cor de marca.

---

## 2. Cores

### 2.1 Marca (carry-over editorial)

```css
--c-midnight:       #0E1A2B;   /* azul-meia-noite, fundo institucional */
--c-midnight-deep:  #08111E;   /* mais escuro, deep sections */
--c-gold:           #C9A961;   /* champanhe — ÚNICO acento de marca */
--c-ivory:          #F4EFE6;   /* marfim quente, papel */
--c-ivory-soft:     #E8E2D4;   /* marfim com mais corpo */
```

**Regra de ouro:** o ouro `#C9A961` aparece **uma vez por bloco**, como pontuação editorial. Nunca como cor de hierarquia, estado ou ação principal em sistemas operacionais.

### 2.2 Neutros (operacional)

Paleta levemente quente, escala 12 níveis (`--n-25` a `--n-900`):

```css
--n-25:  #FAFAF7;   /* paper-white */
--n-50:  #F5F4EE;
--n-100: #EDEBE2;
--n-200: #E0DDD0;
--n-300: #C9C5B5;
--n-400: #A6A290;
--n-500: #807D6E;
--n-600: #5C5A4F;
--n-700: #3F3E37;
--n-800: #25241F;
--n-900: #14130F;
```

### 2.3 Azul de sistema (operacional)

Usado para foco, links de ação, elementos selecionados — **substitui o ouro** em UI:

```css
--b-50:  #E8F0FA;   --b-100: #C8DBF1;
--b-300: #84AAE0;   --b-500: #6094D6;
--b-600: #4978B5;   --b-700: #2F5588;
```

### 2.4 Semânticas (uso restrito)

```css
--positive: oklch(0.66 0.09 155);   /* ganho · subida */
--negative: oklch(0.58 0.12 25);    /* perda · queda */
--warn:     oklch(0.72 0.13 75);    /* aviso · revisão */
--info:     oklch(0.62 0.07 245);   /* informação institucional */
```

**Use exclusivamente para dados e estados.** Nunca para hierarquia visual ou decoração.

### 2.5 Surfaces

```css
--bg:        var(--n-25);    /* fundo principal */
--bg-elev:   #FFFFFF;        /* card, painel — superfície elevada */
--bg-deep:   var(--n-50);    /* contexto, sidebar */
--fg:        var(--n-800);   /* texto principal */
--fg-mute:   var(--n-500);   /* texto secundário */
--fg-faint:  var(--n-400);   /* meta, captions */
--line:      var(--n-200);   /* hairlines */
--line-strong: var(--n-300); /* hairlines em hover/foco */
```

**Tema escuro** existe e é a base do sistema editorial — definido via `[data-theme="dark"]` mapeando `--bg` para `--c-midnight`.

---

## 3. Tipografia

### 3.1 Famílias

```css
--f-display: "Cormorant Garamond", "Times New Roman", serif;  /* editorial */
--f-text:    "Inter Tight", "Inter", system-ui, sans-serif;   /* UI/produto */
--f-mono:    "JetBrains Mono", ui-monospace, monospace;       /* dado quantitativo */
```

**Quando usar cada uma:**

| Família | Onde |
|---|---|
| **Cormorant Garamond** | Hero, títulos editoriais, decks, relatórios, palavras-chave em itálico ouro |
| **Inter Tight** | Toda interface de produto, formulários, navegação, body de aplicações |
| **JetBrains Mono** | Números, valores monetários, percentuais, datas, tokens, IDs, qualquer dado quantitativo |

### 3.2 Escala editorial

| Token | Tamanho | Linha | Uso |
|---|---|---|---|
| Display 1 | 88–108px | 0.98 | Hero institucional |
| Display 2 | 56–68px | 1.02 | Títulos de seção |
| Display 3 | 36–40px | 1.1 | Subtítulos de página |
| Body Large | 17px | 1.55 | Lead paragraphs |
| Body | 15px | 1.55 | Corpo de texto |
| Eyebrow | 11px | tracking 0.22em uppercase | Sobrelinhas em ouro |
| Mono | 12px | tracking 0.06em | Dados |

### 3.3 Escala operacional

| Token | Tamanho | Uso |
|---|---|---|
| H1 | 24px / 600 | Título de página |
| H2 | 18px / 600 | Título de seção |
| H3 | 15px / 600 | Título de card |
| Body | 13.5px / 400 | Texto de UI |
| Small | 12px / 400 | Caption |
| Mono | 11–13px | Dado tabular |

**Regra:** itálico em Cormorant + cor ouro é reservado para **uma palavra emocional por bloco** — "*por gerações*", "*por completo*", "*com cuidado*". Nunca duas em sequência.

---

## 4. Espaçamento, raios e elevação

### 4.1 Spacing (base 4)

```css
--s-1: 4px;  --s-2: 8px;  --s-3: 12px;  --s-4: 16px;
--s-5: 24px; --s-6: 32px; --s-7: 48px;  --s-8: 64px;
--s-9: 96px; --s-10: 128px;
```

**Densidades em sistemas operacionais:**

```css
[data-density="compact"]  { --row-h: 30px; --pad-x: 12px; --pad-y: 6px; }
[data-density="balanced"] { --row-h: 36px; --pad-x: 14px; --pad-y: 8px; }
[data-density="cozy"]     { --row-h: 44px; --pad-x: 16px; --pad-y: 12px; }
```

### 4.2 Raios

```css
--r-0: 0;       /* hairlines, separadores */
--r-1: 2px;     /* botões, inputs */
--r-2: 4px;     /* badges, chips */
--r-3: 8px;     /* cards, painéis */
--r-pill: 999px;/* tags, status dots */
```

**Nunca arredonde acima de 8px** em nenhum componente. Raios grandes pertencem a apps de varejo, não à Nobel.

### 4.3 Elevação (sistema flutuante)

```css
--e-1: 0 1px 2px rgba(14,26,43,.04), 0 1px 3px rgba(14,26,43,.05), 0 0 0 1px var(--line);
--e-2: 0 2px 4px rgba(14,26,43,.05), 0 8px 18px rgba(14,26,43,.08), 0 0 0 1px var(--line);
--e-3: 0 4px 8px rgba(14,26,43,.06), 0 16px 36px rgba(14,26,43,.12), 0 0 0 1px var(--line);

/* Float — para cards "descolarem" da página */
--e-float:       0 1px 2px rgba(14,26,43,.06), 0 6px 14px rgba(14,26,43,.07), 0 18px 32px rgba(14,26,43,.06);
--e-float-hover: 0 2px 4px rgba(14,26,43,.08), 0 10px 22px rgba(14,26,43,.10), 0 28px 48px rgba(14,26,43,.10);
```

**Padrão de card flutuante:**

```css
.card {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--r-3);
  box-shadow: var(--e-float);
  transition: transform .25s ease, box-shadow .25s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--e-float-hover);
}
```

---

## 5. Componentes essenciais

### 5.1 Botões

| Variante | Uso |
|---|---|
| **Primary** | UI: fundo `--b-500` + texto branco. Editorial: fundo `--c-gold` + texto midnight |
| **Secondary** | Borda `--line-strong`, fundo transparente, texto `--fg` |
| **Ghost** | Sem borda, hover com `--n-100` |
| **Link** | `color: --b-500` em UI; `--c-gold` em editorial. Sublinhado hairline |

**Tamanhos:** `sm` (28px), `md` (34px), `lg` (40px). Padding-x = 1.6× padding-y.

**Estados obrigatórios:** `:hover`, `:focus-visible` (ring 3px da cor primária @ 20% opacidade), `:active`, `:disabled` (50% opacidade).

### 5.2 Inputs

- Altura igual ao botão equivalente
- Borda `--line-strong`, foco `--b-500` + `box-shadow: 0 0 0 3px var(--b-50)`
- Label em mono uppercase 11px com tracking 0.14em
- Hint em mono 10px `--fg-mute`

### 5.3 KPI Card

```html
<div class="kpi">
  <div class="row"><span class="lbl">AUM</span><span class="bg pos dot">+ 2,41%</span></div>
  <div class="val">R$ 2,84<span class="unit">BI</span></div>
  <svg class="spark">…</svg>
</div>
```

- Label em mono uppercase
- Valor em mono 30px com unidade em sufixo menor
- Delta com badge semântico (positive/negative)
- Sparkline opcional, 34px de altura
- Sempre flutua (`--e-float`) e tem hover lift

### 5.4 Tabela densa

- Linhas de altura `--row-h` (varia por densidade)
- Header em mono uppercase 11px
- Valores numéricos sempre em mono, alinhados à direita
- Hairline `--line` entre linhas, sem zebra striping
- Hover de linha: `background: --n-50`

### 5.5 Badges

| Tipo | Cor |
|---|---|
| `gold` | borda + texto `--c-gold` (editorial) |
| `solid` | fundo `--c-gold`, texto midnight (editorial) |
| `pos` | borda + texto `--positive` |
| `neg` | borda + texto `--negative` |
| `dot` | bullet de 6px da cor antes do label |

Mono 11px, tracking 0.12em, uppercase, padding 6px 10px, `--r-pill`.

---

## 6. Padrões geométricos

Texturas sutis para empty states, headers e splashes. Construídas em CSS/SVG puro, herdam a cor do contexto.

| Padrão | Uso |
|---|---|
| **P-01 Grid** | Headers, separadores. 24px |
| **P-02 Dot Grid** | Empty states. 16px |
| **P-03 Diagonal** | Loading, placeholders. 12px |
| **P-04 Cross-hatch** | Surfaces premium. Ouro 18% |
| **P-07 Horizonte** | Hero institucional. Perspectiva 3D |
| **P-08 Concêntrico** | Cards de marco, decoração de canto |

**Regras de uso:**
- Opacidade entre **4% e 18%** — nunca mais
- Textura sempre **abaixo** do dado, nunca sobre
- **Nunca** combine duas texturas na mesma superfície
- Em dashboards densos: P-01 ou P-02
- Em hero/splash/onboarding: P-07

---

## 7. Faça & não faça

### ✓ Faça

- Use o ouro com parcimônia: **um único acento por bloco**
- Prefira **hairlines (1px)** e tipografia para hierarquia
- Use **itálico serifado** para palavras-chave emocionais
- Mantenha **respiro generoso** entre seções (96px+ em editorial, 24–32px em operacional)
- Use **mono** para qualquer dado quantitativo
- Mantenha **uma única ação primária** por tela
- Cards flutuantes: sombra de **3 camadas**, lift de **2px** no hover

### ✗ Não faça

- ~~Gradientes saturados~~ ou efeitos brilhantes
- ~~Combinar ouro com outras cores de acento~~
- ~~Ícones ilustrativos~~ no lugar de tipografia
- ~~Cantos arredondados acima de 8px~~
- ~~Emoji~~ em comunicação institucional
- ~~Cor para hierarquia~~ (use peso e tamanho)
- ~~Misturar Cormorant + Inter Tight~~ na mesma superfície (escolha o sistema)

---

## 8. Voz & copywriting

**Tom:** seguro, sereno, preciso. Frases curtas. Verbo no presente. Nunca aspiracional vazio.

**Sim:**
- "Patrimônio por gerações."
- "Visão integrada do seu portfólio."
- "Acesso direto aos maiores mercados do mundo."

**Não:**
- ~~"Transforme seu futuro com a Nobel!"~~
- ~~"O melhor da assessoria patrimonial 🚀"~~
- ~~"Deixe-nos cuidar de você."~~

**Números** sempre formatados pt-BR: `R$ 1.094.029,00` · `+ 3,64%` · `1,28x`. Use abreviações **MM** (milhão), **BI** (bilhão), **K** (mil) em sufixo mono separado do valor.

---

## 9. Setup técnico (stack moderna)

### 9.1 Fontes (Next.js / `next/font/google`)

```ts
// app/layout.tsx
import { Cormorant_Garamond, Inter_Tight, JetBrains_Mono } from "next/font/google";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--f-display", weight: ["400","500","600"] });
const text    = Inter_Tight({ subsets: ["latin"], variable: "--f-text",    weight: ["400","500","600","700"] });
const mono    = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", weight: ["400","500"] });
```

### 9.2 Tailwind v4 (`globals.css`)

```css
@theme {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-brand-gold: var(--c-gold);
  --color-brand-midnight: var(--c-midnight);
  --font-display: var(--f-display);
  --font-sans: var(--f-text);
  --font-mono: var(--f-mono);
  --radius-card: 8px;
  --shadow-float: var(--e-float);
}
```

### 9.3 shadcn (mapeamento)

```css
:root {
  --background: var(--bg);
  --foreground: var(--fg);
  --card: var(--bg-elev);
  --primary: var(--b-500);
  --primary-foreground: #ffffff;
  --border: var(--line);
  --ring: var(--b-500);
  --radius: 0.5rem;
}
```

---

## 10. Versionamento

Toda alteração no design system passa por:

1. Proposta com exemplo aplicado em tela real
2. Revisão pelo time de design
3. Bump semântico — patch para correções, minor para tokens novos, major para quebras de contrato
4. Atualização deste documento + changelog

**Changelog:**
- **1.0.0** (2026-10) — Versão inicial. Tokens completos, 12 componentes, 6 padrões geométricos, sistema flutuante.

---

## 11. Recursos

- **Design system editorial (HTML):** `Nobel Design System.html`
- **Design system operacional (HTML):** `Nobel Operational System.html`
- **Guia de integração técnica:** `Nobel Integration Guide.html`
- **Fontes:** Google Fonts (Cormorant Garamond, Inter Tight, JetBrains Mono)
- **Logo & marcas:** `assets/logo-*.png`

---

> *"Em dúvida, prefira menos."* — princípio Nobel
