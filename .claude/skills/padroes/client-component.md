---
name: client-component
description: Template Client Component com TanStack Query — query key, loading/error states, invalidation, tipagem
type: padrao
version: 1
---

## Canonical
Template para componentes React interativos que buscam dados do lado do cliente via TanStack Query. Usar quando há interatividade, filtros controlados pelo usuário, ou dados reativos.

## Entry Point
**Invocar quando:**
- componente precisa de `useState`, `useEffect` ou eventos de browser
- filtro/busca é controlado pelo usuário (input, select, datepicker)
- dados devem ser recarregados sem navegar de página
- "como uso TanStack Query para buscar X?"

**NÃO invocar para:**
- página estática sem interação (ver `padroes/server-component.md`)
- formulário de criação/edição (combinar com React Hook Form)
- quando não há estado client-side

## Source of Truth
- `src/hooks/` — custom hooks existentes como referência
- `src/lib/api/client.ts` — cliente de API tipado

## Scope Resolver
**DENTRO:** `'use client'` directive, TanStack Query (`useQuery`, `useMutation`), loading/error/empty states, invalidação de cache

**FORA:** fetch no servidor (ver `padroes/server-component.md`), design dos estados visuais (ver `dominio/design-system.md`)

## Evidence Gates
- Arquivo tem `'use client'` no topo
- `queryKey` deve ser array único que identifica a query — nunca string vazia ou genérica
- Tratar SEMPRE os 3 estados: loading, error, sucesso

## Mutation Boundary
**PODE:** criar arquivo em `src/components/features/` ou `src/hooks/`
**NUNCA:** fazer fetch direto (`fetch()`) no cliente — sempre via TanStack Query; nunca usar `any` nos tipos

## Verification Protocol
1. Estado loading renderiza skeleton?
2. Estado error renderiza mensagem + retry?
3. Dados chegam e renderizam corretamente?
4. Invalidação funciona após mutação?
5. `npm run typecheck` → sem erros?

## Output Contract
Produz arquivo `.tsx` com `'use client'` + arquivo de hook em `src/hooks/use[Feature].ts` (se reutilizável).

## Companion Reference
- `padroes/server-component.md` — quando NÃO usar client component
- `dominio/design-system.md` — tokens para estados visuais
- `workflows/novo-componente-ui.md` — checklist completo de criação
- Agente: `frontend-intranet`

## Feedback Loop
Se um pattern de invalidação complexa surgir (ex: otimistic updates), adicionar como seção aqui.

---

## Template Base

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

interface Props {
  mes?: string
}

interface AssessorData {
  id_assessor: string
  nome_assessor: string
  total: number
}

export function AssessorRanking({ mes }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assessores', 'ranking', mes],  // sempre incluir params que afetam o resultado
    queryFn: () => api.assessores.ranking({ mes }),
    staleTime: 5 * 60 * 1000,  // 5 min antes de revalidar
  })

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-12 rounded-lg bg-[var(--bg-elev)]" />
        ))}
      </div>
    )
  }

  // Erro
  if (isError) {
    return (
      <div className="rounded-xl border border-[var(--line)] p-4 text-center">
        <p className="text-[var(--neg-fg)] text-sm">Erro ao carregar ranking.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-xs text-[var(--color-b-500)] underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Vazio
  if (!data?.length) {
    return (
      <div className="rounded-xl border border-[var(--line)] p-6 text-center text-[var(--text-muted)]">
        Nenhum dado encontrado para o período.
      </div>
    )
  }

  // Sucesso
  return (
    <ul className="space-y-2">
      {data.map((item: AssessorData) => (
        <li
          key={item.id_assessor}
          className="flex justify-between rounded-lg border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3"
        >
          <span className="font-text text-sm">{item.nome_assessor}</span>
          <span className="font-mono text-sm font-medium">{formatCurrency(item.total)}</span>
        </li>
      ))}
    </ul>
  )
}
```

## Custom Hook (quando reutilizável)

```typescript
// src/hooks/useAssessorRanking.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export function useAssessorRanking(mes?: string) {
  return useQuery({
    queryKey: ['assessores', 'ranking', mes],
    queryFn: () => api.assessores.ranking({ mes }),
    staleTime: 5 * 60 * 1000,
  })
}
```

## Mutação (POST/PUT/DELETE)

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

export function NovaMetaForm() {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: api.metas.create,
    onSuccess: () => {
      // Invalidar queries afetadas
      queryClient.invalidateQueries({ queryKey: ['metas'] })
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutate({ id_assessor: '...', mes: '2026-06', valor: 1000000 })
    }}>
      {/* campos */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar meta'}
      </button>
    </form>
  )
}
```

## Query Key Convention

```typescript
// Hierarquia de keys — do geral ao específico
['assessores']                              // todos os assessores
['assessores', 'ranking']                   // ranking de assessores
['assessores', 'ranking', mes]              // ranking de um mês específico
['assessores', id]                          // assessor específico
['assessores', id, 'historico']             // histórico de um assessor

// Invalidar um nível invalida todos abaixo:
queryClient.invalidateQueries({ queryKey: ['assessores'] })  // invalida TUDO
queryClient.invalidateQueries({ queryKey: ['assessores', 'ranking'] })  // só ranking
```
