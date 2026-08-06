# Branding Nobel — Planilhas Excel (.xlsx)

Planilhas da Nobel usam **sempre o sistema operacional**. O ouro não existe em Excel — toda identidade vem da paleta neutra quente, do azul de sistema e da tipografia Relicta/Garet.

---

## Paleta de cores para Excel

### Cores de célula / fundo

| Uso | Nome Nobel | Hex |
|---|---|---|
| Fundo da planilha | Paper-white | `#FAFAF7` |
| Fundo de header de seção | Neutro leve | `#F5F4EE` |
| Fundo de header de tabela | Neutro médio | `#EDEBE2` |
| Fundo de linha totalizadora | Midnight tint | `#E8F0FA` (azul claro) |
| Fundo de linha de destaque | Neutro | `#F0EEE6` |
| Célula vazia / N/A | — | sem preenchimento |

### Cores de texto

| Uso | Hex |
|---|---|
| Texto principal | `#25241F` |
| Texto secundário / labels | `#5C5A4F` |
| Texto desabilitado / meta | `#807D6E` |
| Valor positivo | `#248A47` (Verde Nobel) |
| Valor negativo | `#D94141` (Vermelho Nobel) |
| Número neutro / dado | `#14130F` |
| Link / ação | `#2D5FA0` (Azul Nobel) |

### Bordas

| Uso | Estilo | Cor |
|---|---|---|
| Hairline entre linhas | 0.5pt | `#E0DDD0` |
| Borda de tabela externa | 1pt | `#C9C5B5` |
| Borda de header | 1pt base | `#A6A290` |
| Separador de seção | 1.5pt | `#807D6E` |

**Nunca use bordas grossas (> 1.5pt). Nunca use bordas coloridas com azul ou ouro.**

---

## Tipografia em Excel

Excel não carrega fontes customizadas automaticamente. Use estas alternativas de fallback quando as fontes Nobel não estiverem instaladas:

| Função Nobel | Fonte ideal | Fallback Excel seguro |
|---|---|---|
| Títulos de seção | Relicta Bold | **Calibri Bold** ou **Segoe UI Bold** |
| Corpo / UI text | Garet | **Calibri** ou **Segoe UI** |
| Números em tabelas | Garet | **Calibri** ou **Consolas** |

> Se o arquivo Excel for aberto em ambientes onde Relicta e Garet estão instaladas (máquinas da Nobel), priorize as fontes oficiais. Caso contrário, use Calibri Bold para títulos e Calibri para corpo/números.

### Tamanhos de fonte recomendados

| Elemento | Fonte | Tamanho |
|---|---|---|
| Título da planilha | Relicta Bold | 14–16pt |
| Cabeçalho de seção | Relicta SemiBold | 11–12pt |
| Header de tabela | Garet Medium | 9–10pt |
| Dados / corpo | Garet Regular | 9–10pt |
| Totais e subtotais | Garet Bold | 9–10pt |
| Caption / nota de rodapé | Garet Regular Italic | 8pt |

---

## Estrutura de tabelas Nobel em Excel

### Anatomia de uma tabela financeira

```
┌─────────────────────────────────────────────────────────┐
│ [Título da tabela — Relicta 12pt Bold, texto #14130F]   │
│ [Subtítulo / período — Garet 9pt, texto #5C5A4F]        │
├────────────┬──────────────┬───────────┬─────────────────┤
│ CATEGORIA  │ VALOR (R$)   │ VARIAÇÃO  │ % PORTFÓLIO     │  ← header: Garet 9pt Medium, fundo #EDEBE2
├────────────┼──────────────┼───────────┼─────────────────┤
│ Renda Fixa │ 1.240.000,00 │ + 2,34%   │ 43,7%           │  ← dados: Garet 9pt, números alinhados direita
│ Equity     │   980.500,00 │ - 0,82%   │ 34,6%           │
│ Alternativo│   612.000,00 │ + 1,15%   │ 21,6%           │
├────────────┼──────────────┼───────────┼─────────────────┤
│ TOTAL      │ 2.832.500,00 │ + 1,48%   │ 100%            │  ← total: Garet Bold, fundo #E8F0FA
└────────────┴──────────────┴───────────┴─────────────────┘
```

### Regras de formatação de dados numéricos

- Valores monetários: `R$ #.##0,00` (separador de milhar com ponto, decimal com vírgula)
- Percentuais: `+0,00%;-0,00%;0,00%` (sempre com sinal em variações)
- Abreviações: use sufixo em coluna separada — `2.840` em uma célula, `MM` na seguinte
- Alinhamento: números sempre à **direita**; texto sempre à **esquerda**; labels centrados no header

### Congelamento e navegação

- Sempre congele a linha de header da tabela (`Congelar painel`)
- Em planilhas com múltiplas abas: nomeie as abas em português, sem abreviações obscuras
- Aba de sumário executivo: sempre a primeira aba, com visão geral e links para detalhamento

---

## Elementos visuais permitidos em Excel

### Gráficos

Nobel usa apenas os seguintes tipos de gráfico — escolha pelo dado, não pela estética:

| Dado | Tipo de gráfico |
|---|---|
| Composição de portfólio | Pizza ou Donut (sem 3D) |
| Evolução temporal | Linha simples (sem área preenchida) |
| Comparação de categorias | Barras horizontais |
| Comparação YoY | Barras agrupadas |
| Distribuição | Histograma simples |

**Configuração padrão de gráficos Nobel:**
- Fundo do gráfico: `#FAFAF7` (paper-white)
- Sem bordas decorativas no gráfico
- Grid lines: horizontal, hairline 0.5pt `#E0DDD0` — sem grid vertical
- Sem legendas decorativas — use labels diretos nas séries quando possível
- Fonte dos eixos: Garet 8pt (fallback: Calibri), cor `#5C5A4F`

**Paleta de séries — sequência obrigatória:**

| # | Nome | Hex |
|---|---|---|
| 1 | Ouro Nobel | `#C29404` |
| 2 | Ouro Profundo | `#8F6B12` |
| 3 | Tinta (Ink) | `#343534` |
| 4 | Grafite | `#5F5E5B` |
| 5 | Cinza Médio | `#8C8B87` |
| 6 | Névoa (Fog-grey) | `#B4B3AE` |
| 7 | Cinza Claro | `#D2D1CC` |

- Série 1 sempre `#C29404` (Ouro Nobel)
- Para 2 séries: `#C29404` + `#343534`
- Para 3 séries: `#C29404` + `#5F5E5B` + `#343534`
- Variação positiva: `#248A47` · Variação negativa: `#D94141` (semânticos, fora da sequência de séries)

### Sparklines

Quando espaço for limitado, use sparklines ao invés de gráficos completos:
- Tipo: Linha ou Coluna (nunca Win/Loss)
- Cor de linha: `#C29404` (Ouro Nobel)
- Ponto de alto: `#248A47` · Ponto de baixo: `#D94141`

---

## Checklist planilha Nobel

- [ ] Fontes: Relicta (títulos) + Garet (corpo/números) — fallback Calibri
- [ ] Números em Garet (ou Calibri), ali