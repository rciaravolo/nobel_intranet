# Branding Nobel — Apresentações PowerPoint (.pptx)

Apresentações da Nobel dividem-se em dois contextos bem distintos. Identifique qual é o seu antes de começar.

## Identifique o contexto

| Contexto | Sistema | Audiência |
|---|---|---|
| Deck para cliente (revisão de portfólio, proposta, onboarding) | **Editorial** | Clientes, investidores |
| Deck executivo interno (estratégia, resultados, board) | **Editorial / misto** | Diretoria, sócios |
| Apresentação operacional (treinamento, processos, análise técnica) | **Operacional** | Equipe interna |

---

## Sistema Editorial — Decks de cliente e executivos

### Master de slides — estrutura base

**Slide de capa:**
```
┌─────────────────────────────────────────┐
│  [fundo: #0E1A2B (midnight)]            │
│                                         │
│  [Logo Nobel — versão branca, canto sup]│
│                                         │
│  ══════════════════ [hairline #C9A961]  │
│                                         │
│  RELATÓRIO DE PORTFÓLIO                 │  ← eyebrow: Garet 11pt, #C9A961, uppercase
│  Visão Patrimonial                      │  ← título: Relicta Bold 48pt, #F4EFE6
│  *integrada*                            │  ← word-chave: italic, #C9A961
│                                         │
│  Rafael Brandão · Nobel Capital         │  ← meta: Garet 11pt, #807D6E
│  Q1 · 2026                             │
│                                         │
└─────────────────────────────────────────┘
```

**Slides de conteúdo (fundo ivory):**
```
┌─────────────────────────────────────────┐
│  [fundo: #F4EFE6 (ivory)]              │
│  ─── [hairline topo: #C9A961, 2pt] ──  │
│                                         │
│  DESEMPENHO                             │  ← eyebrow: Garet 9pt, #C9A961, uppercase
│  Evolução do AUM                        │  ← título: Relicta SemiBold 28pt, #0E1A2B
│                                         │
│  [Conteúdo / gráfico / dado]            │
│                                         │
│  Nobel Capital · Confidencial    [1/12] │  ← rodapé: Garet 8pt, #A6A290
└─────────────────────────────────────────┘
```

### Paleta editorial para slides

| Elemento | Cor | Hex |
|---|---|---|
| Fundo capa / dark slides | Midnight | `#0E1A2B` |
| Fundo slides de conteúdo | Ivory | `#F4EFE6` |
| Acento ouro | Gold | `#C9A961` |
| Texto principal (sobre ivory) | Midnight | `#0E1A2B` |
| Texto secundário | Muted | `#5C5A4F` |
| Texto sobre midnight | Ivory | `#F4EFE6` |
| Dados / números | Midnight via Garet | `#14130F` |
| Hairlines | Ivory soft | `#E8E2D4` |

### Tipografia editorial em slides

| Elemento | Fonte | Tamanho | Observação |
|---|---|---|---|
| Eyebrow / label | Garet | 9–11pt | Uppercase, tracking 0.22em, gold |
| Título principal | Relicta Bold | 36–52pt | Peso Bold |
| Subtítulo / date | Relicta | 18–24pt | Italic |
| Corpo de texto | Garet | 11–13pt | Regular, line-height 1.5 |
| Dados / valores (KPI hero) | Relicta Bold | 28–40pt | Gold ou midnight |
| Labels de gráfico | Garet | 8–10pt | Regular |
| Rodapé / meta | Garet | 8pt | Muted `#A6A290` |

### Slide de KPI / dado editorial

```
┌────────────────────┬────────────────────┐
│  AUM TOTAL         │  RETORNO YTD       │
│  R$ 2,84 BI        │  + 8,41%           │
│  ▲ + 2,1% mm/mm   │  vs. CDI + 2,3pp   │
└────────────────────┴────────────────────┘
```
- Label: Garet 9pt, uppercase, gold
- Valor principal: Relicta Bold 36pt, midnight (ou ivory se sobre midnight)
- Delta: Garet 11pt, Verde Nobel `#248A47` (positivo) ou Vermelho Nobel `#D94141` (negativo)
- Fundo do card: ivory `#F4EFE6` com borda hairline gold

---

## Sistema Operacional — Apresentações internas

### Paleta operacional para slides

| Elemento | Cor | Hex |
|---|---|---|
| Fundo | Paper-white | `#FAFAF7` |
| Topo / header de slide | Neutro leve | `#F5F4EE` |
| Texto principal | Dark | `#25241F` |
| Texto secundário | Muted | `#5C5A4F` |
| Acento de ação | Azul sistema | `#2D5FA0` |
| Hairlines | Neutro | `#E0DDD0` |

### Tipografia operacional em slides

| Elemento | Fonte | Tamanho |
|---|---|---|
| Título do slide | Relicta Bold | 22–28pt |
| Subtítulo | Garet Regular | 14–16pt |
| Corpo | Garet Regular | 11–13pt |
| KPI / número em destaque | Relicta Bold | conforme contexto |
| Labels de gráfico / tabela | Garet Regular | 8–10pt, uppercase |

---

## Regras de gráficos para ambos os sistemas

### Tipos permitidos

| Dado | Tipo |
|---|---|
| Composição | Pizza ou Donut (sem 3D, sem explode) |
| Evolução temporal | Linha simples, sem ponto marcado excessivo |
| Comparação | Barras horizontais |
| Crescimento YoY | Barras agrupadas ou waterfall |

### Cores das séries

A paleta de séries é universal — editorial e operacional usam a mesma sequência:

| # | Nome | Hex |
|---|---|---|
| 1 | Ouro Nobel | `#C29404` |
| 2 | Ouro Profundo | `#8F6B12` |
| 3 | Tinta (Ink) | `#343534` |
| 4 | Grafite | `#5F5E5B` |
| 5 | Cinza Médio | `#8C8B87` |
| 6 | Névoa (Fog-grey) | `#B4B3AE` |
| 7 | Cinza Claro | `#D2D1CC` |

- Série 1 sempre `#C29404` (Ouro Nobel) — cor âncora, mais prominent
- Para gráficos de 2 séries: `#C29404` + `#343534`
- Para gráficos de 3 séries: `#C29404` + `#5F5E5B` + `#343534`
- Delta positivo: `#248A47` (Verde Nobel) · Delta negativo: `#D94141` (Vermelho Nobel) — semânticos, fora da sequência de séries
- Fundo do gráfico (editorial): `#F4EFE6` (ivory)
- Fundo do gráfico (operacional): `#FAFAF7`

**Regras universais de gráfico Nobel:**
- Sem 3D, sem sombra, sem gradiente
- Grid horizontal apenas, hairline 0.5pt
- Sem bordas decorativas na área do gráfico
- Labels diretos nas séries quando possível (sem legenda embaixo)
- Eixos: Garet 8pt

---

## Checklist deck Nobel

- [ ] Sistema editorial ou operacional identificado e mantido consistente?
- [ ] Capa com estrutura correta (eyebrow Garet + título Relicta + meta Garet)?
- [ ] Ouro aparece no máximo uma vez por slide?
- 