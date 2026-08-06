---
name: nobel-branding
description: |
  Guia de branding da Nobel Capital para aplicar a identidade visual correta em qualquer entrega — relatórios PDF, planilhas Excel, documentos Word, apresentações PowerPoint ou sistemas digitais (Next.js, HTML, dashboards). Use esta skill sempre que o usuário pedir para criar, formatar ou revisar qualquer artefato com a marca Nobel Capital, ou quando mencionar: relatório Nobel, apresentação interna, dashboard operacional, documento institucional, planilha financeira, sistema intranet, branding, identidade visual, design system. Também use quando o usuário perguntar "como formatar", "qual fonte usar", "que cor usar" em qualquer contexto Nobel.
---

# Nobel Capital — Skill de Branding

## O que esta skill faz

Esta skill fornece orientação precisa para aplicar o design system da Nobel Capital em qualquer tipo de entrega. A Nobel opera **dois sistemas complementares** e escolher o correto é a primeira decisão de qualquer projeto.

## Passo 1 — Identifique o sistema certo

| Sistema | Quando usar | Vocabulário visual |
|---|---|---|
| **Editorial** | Relatórios para clientes, decks executivos, materiais institucionais impressos, site público | Relicta, ouro `#C9A961`, fundo midnight `#0E1A2B`, muito respiro |
| **Operacional** | Dashboards internos, planilhas, ferramentas, formulários, sistemas, intranet | Garet, neutros quentes, azul de sistema `#2D5FA0`, densidade equilibrada |

**Regra crítica:** nunca misture os dois sistemas na mesma superfície. Um relatório de cliente usa o editorial. Uma planilha de análise usa o operacional.

## Logos oficiais — use sempre os arquivos desta skill

A pasta `assets/` contém as logos oficiais da Nobel Capital. **Nunca recrie, redesenhe ou aproxime o logo manualmente** — use sempre estes arquivos.

| Arquivo | Fundo de destino | Quando usar |
|---|---|---|
| `assets/logo-sobre-fundo-escuro.png` | Escuro (midnight `#0E1A2B`) | Capa de deck, slides dark, headers dark de sistema |
| `assets/logo-sobre-fundo-claro.png` | Claro (ivory, white, paper) | Documentos Word, slides ivory, dashboards claros |
| `assets/logo-icone-N.png` | Qualquer | Favicon, avatar de sidebar, espaços muito compactos (< 40px) |
| `assets/logo-cobranded-nobel-xp.png` | Claro | **Somente** quando o contexto exigir co-branding XP explícito |

**Regras de uso do logo:**
- Preserve sempre as proporções — nunca distorça ou estique
- Área de respiro mínima: 1× a altura do monograma "N" em todos os lados
- Nunca aplique filtros, sobreposições de cor ou efeitos sobre o logo
- Em fundos escuros: use **sempre** `logo-sobre-fundo-escuro.png`
- Em fundos claros: use **sempre** `logo-sobre-fundo-claro.png`
- O `logo-cobranded-nobel-xp.png` inclui o logo da XP — só usar quando explicitamente solicitado

## Passo 2 — Carregue a referência do formato solicitado

Depois de identificar o sistema, consulte o arquivo de referência específico para o tipo de entrega:

| Tipo de entrega | Arquivo de referência |
|---|---|
| PDF ou relatório impresso | `references/documentos-pdf-word.md` |
| Documento Word (.docx) | `references/documentos-pdf-word.md` |
| Planilha Excel (.xlsx) | `references/planilhas-excel.md` |
| Apresentação PowerPoint (.pptx) | `references/apresentacoes-pptx.md` |
| Sistema web / Next.js / dashboard HTML | `references/sistemas-web.md` |

## Tokens de cor rápidos (para uso imediato)

### Marca (editorial)
```
Midnight:  #0E1A2B   ← fundo institucional
Gold:      #C9A961   ← único acento de marca (usar com parcimônia)
Ivory:     #F4EFE6   ← papel, fundo claro editorial
```

### Operacional (sistema)
```
Azul ação: #2D5FA0   ← links, seleção, foco (light) / #6094D6 em dark
Texto:     #25241F   ← foreground principal (--n-800)
Fundo:     #FAFAF7   ← paper-white (--n-25)
Borda:     #E0DDD0   ← hairline (--n-200)
Positivo:  #248A47   ← Verde Nobel — ganho, sucesso
Negativo:  #D94141   ← Vermelho Nobel — perda, erro
```

### Gráficos — paleta de séries (ordem obrigatória)
```
#C29404  Ouro Nobel    ← série 1 (âncora)
#8F6B12  Ouro Profundo ← série 2
#343534  Tinta         ← série 3
#5F5E5B  Grafite       ← série 4
#8C8B87  Cinza Médio   ← série 5
#B4B3AE  Névoa         ← série 6
#D2D1CC  Cinza Claro   ← série 7
```
> Para 2 séries: `#C29404` + `#343534` · Para 3: adicionar `#5F5E5B` entre os dois. Ver `references/sistemas-web.md` para tokens CSS completos.

## Tipografia rápida

```
Títulos:           Relicta  (headings em documentos, decks, capas, hero KPIs)
Corpo / UI:        Garet    (textos corridos, labels, formulários, dashboards)
Números em tabela: Garet    (colunas numéricas em planilhas e grids)
```

| Uso | Fonte | Peso |
|-----|-------|------|
| Título de seção, capa, H1–H3 | Relicta | Bold / SemiBold |
| KPI / número em destaque | Relicta | Bold |
| Parágrafo, label, botão | Garet | Regular / Medium |
| Número em gráfico ou tabela | Garet | Regular |

**Nunca use Relicta em textos corridos ou legendas.
Nunca use Garet em capas ou títulos editoriais principais.
Nunca use nenhuma outra fonte — apenas estas duas.**

## Princípios de decisão

Quando você estiver em dúvida sobre qualquer escolha visual, aplique estes filtros:

1. **Permanência** — escolhas que envelhecem bem. Sem gradientes saturados, sem sombras brilhantes, sem trends.
2. **Rigor** — tipografia faz o trabalho que ícones tentariam fazer. Hierarquia via peso e tamanho, nunca via cor.
3. **Clareza** — dado nunca compete com decoração. Em dúvida, prefira menos.
4. **Discrição** — o ouro entra como pontuação, não como cor de marca. Uma vez por bloco, no máximo.

## Voz e copywriting

**Tom:** seguro, sereno, preciso. Frases curtas. Verbo no presente.

✓ Correto: "Patrimônio por gerações." · "Visão integrada do portfólio." · "Acesso direto aos maiores mercados."

✗ Evitar: "Transforme seu futuro!" · "O melhor da assessoria 🚀" · emojis · exclamações entusiastas

**Números pt-BR:** `R$ 1.094.029,00` · `+ 3,64%` · `1,28x` · `2,84 BI` (sufixo mono separado)

## O que NUNCA fazer (Nobel)

- ~~Gradientes saturados~~ ou efeitos brilhantes
- ~~