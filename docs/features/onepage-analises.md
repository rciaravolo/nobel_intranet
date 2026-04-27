# Feature: Onepage / Análises

**Status:** ✅ Deployado em produção (commit `7ce24d9`, 2026-04-27)
**Rota:** `/analises`
**Worker:** `intra-api.rafaelciaravolo.workers.dev/performance/*`

---

## Visão Geral

Página de análise de performance em tempo real do assessor (Rafael Brandão / Nobel Capital).
Todos os dados vêm do banco `nobel-performance-db` (Cloudflare D1, 19MB).

**Layout:** Two-column — coluna principal (`1fr`) + sidebar sticky Metas (`380px`)

---

## Componentes

### KPI Cards (topo, full-width)
| Card | Fonte | Tabela |
|------|-------|--------|
| Custódia (AuM) | `tb_positivador` | `SUM(pl)` |
| Clientes Ativos | `tb_positivador` | `COUNT DISTINCT WHERE pl > 0` |
| Clientes Inativos | `tb_positivador` | `COUNT DISTINCT WHERE pl = 0` |
| Receita Total | 9× `receita_*` | `SUM` paralelo |

### BlocoCaptacao
- Exibe: Captação Bruta, Resgates, Captação Líquida
- **Deepdive** (toggle clique na Líquida): top 20 aportos + top 20 resgates
  - Fonte: `tb_cap` JOIN `base_clientes` (`CAST(id_cliente AS INTEGER)`)
  - Resgates: `aux='D'` com valores negativos → `ORDER BY valor ASC`

### BlocoReceita
- Grid de produtos com barra de participação + % share
- **Deepdive inline** por produto: top clientes via `receita_*` JOIN `base_clientes`
- Cache no estado do componente (não re-faz fetch ao reabrir)
- Produtos: RV, RF, COE, Câmbio, Fee Fixo, Seguros, Consórcio, Dominion, Oferta de Fundos

### BlocoMetas (sidebar compacto)
- Fonte de metas: `server/src/data/metas.json` (chave `"YYYY-MM"`)
- Dias úteis: algoritmo Meeus/Jones/Butcher em `server/src/lib/dias-uteis.ts`
- Feriados BR: fixos + móveis (Carnaval, Sexta Santa, Corpus Christi)
- **Indicadores por produto:**
  - `paceRealizado = realizado / dias_passados`
  - `paceNecessario = (meta - realizado) / dias_restantes`
  - `projecao = realizado + paceRealizado × dias_restantes`
  - `pctMeta = projecao / meta`
- **Semáforo:** verde ≥95%, amarelo 80–94%, vermelho <80%
- Produtos com `meta === 0` são ocultados na view compacta

### Histórico (abaixo da coluna principal)
Comparativo mensal 2025 vs 2026:
- Custódia AuM (`cap_historica`)
- ROA Anualizado (`roa_historico` — 3 formatos de data: `M/YYYY`, `MM/YYYY`, `2026-MM-DD`)
- Captação Líquida (`cap_historica`)
- Receita por Produto (9× `receita_*` agrupado por mês)

---

## Worker Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/performance/onepage` | KPIs + captação + receita por produto |
| GET | `/performance/historico` | Tabelas comparativas 2025 vs 2026 |
| GET | `/performance/metas` | Metas + pace + projeção do mês corrente |
| GET | `/performance/deepdive/captacao` | Top aportes e resgates do mês |
| GET | `/performance/deepdive/receita/:produto` | Top clientes por produto |

Autenticação: `Authorization: Bearer <INTERNAL_API_SECRET>`

---

## Next.js API Proxies

```
src/app/api/performance/
├── metas/route.ts
├── deepdive/
│   ├── captacao/route.ts
│   └── receita/[produto]/route.ts
└── carteiras/route.ts
```

Padrão: `getSession()` → forward para Worker com `INTERNAL_API_SECRET`.

---

## Atualização de Metas (mensal)

1. Editar `server/src/data/metas.json` adicionando a nova chave `"YYYY-MM"`
2. `cd server && npm run deploy`

### Estrutura do JSON
```json
{
  "2026-04": {
    "rv": 356572.36,
    "rf": 214731.01,
    "coe": 51988.20,
    "cambio": 81662.18,
    "feefixo": 177932.96,
    "seguros": 159000.00,
    "consorcio": 281100.90,
    "dominion": 0,
    "oferta_fundos": 123664.63
  }
}
```

---

## Pendências conhecidas

- 6 produtos informados pelo Rafael não têm tabela no DB ainda:
  `previdencia`, `precatorio`, `internacional`, `parceiros`, `off-shore`, `plano de saude`
- Quando ETL criar essas tabelas: adicionar ao array `PRODUTOS` em `server/src/routes/performance.ts`
- Regra multi-assessor (filtragem por `id_assessor`) ainda não implementada
