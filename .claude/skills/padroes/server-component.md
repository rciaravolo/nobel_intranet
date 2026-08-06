---
name: server-component
description: Template Next.js Server Component — fetch server-side, suspense, error boundary, tipagem de props
type: padrao
version: 1
---

## Canonical
Template para Server Components no App Router do Next.js. Usar como padrão quando o componente não precisa de interatividade — dados buscados no servidor, sem estado client-side.

## Entry Point
**Invocar quando:**
- criar página que busca dados sem interatividade
- "como faço fetch no server component?"
- componente não precisa de `useState`, `useEffect` ou eventos de browser

**NÃO invocar para:**
- componente com estado ou interatividade (ver `padroes/client-component.md`)
- componente de formulário (ver `padroes/form-pattern.md` — se existir)
- busca de dados reativa (TanStack Query — ver `padroes/client-component.md`)

## Source of Truth
- `src/app/(auth)/` — páginas existentes como referência
- `src/lib/api/client.ts` — cliente de API tipado

## Scope Resolver
**DENTRO:** página Server Component, fetch assíncrono, Suspense boundary, Error boundary, tipagem

**FORA:** hooks, estado local, TanStack Query (ver `padroes/client-component.md`)

## Evidence Gates
- Verificar que o endpoint de API existe (`server/src/routes/`) antes de usar no componente
- Componente não usa `useState`/`useEffect` → é elegível como Server Component
- Arquivo não tem `'use client'` no topo

## Mutation Boundary
**PODE:** criar arquivo `.tsx` em `src/app/(auth)/[feature]/page.tsx`
**NUNCA:** fazer fetch de terceiros no Server Component sem cache explícito (`{ next: { revalidate: N } }`)

## Verification Protocol
1. `npm run typecheck` → sem erros?
2. `npm run dev` → página carrega dados?
3. Network tab: o fetch aconteceu no servidor (sem XHR no browser)?
4. Suspense: skeleton aparece durante o carregamento?

## Output Contract
Produz arquivo `.tsx` em `src/app/(auth)/[feature]/page.tsx`.

## Companion Reference
- `padroes/client-component.md` — quando precisar de interatividade
- `dominio/design-system.md` — tokens para estilizar
- Agente: `frontend-intranet`

## Feedback Loop
Se um pattern de erro/loading novo for necessário, documentar aqui.

---

## Template de Página (Server Component)

```typescript
// src/app/(auth)/assessores/page.tsx
import { api } from '@/lib/api/client'
import { AssessoresList } from '@/components/features/assessores/AssessoresList'
import { Suspense } from 'react'
import { AssoressSkeleton } from '@/components/features/assessores/AssessoresSkeleton'

// Metadados da página
export const metadata = {
  title: 'Assessores — Nobel INTRA',
}

export default async function AssesoresPage() {
  const assessores = await api.assessores.list()

  return (
    <div className="space-y-6">
      <h1 className="font-text text-2xl font-semibold tracking-tight">
        Assessores
      </h1>

      <Suspense fallback={<AssoresSkeleton />}>
        <AssessoresList assessores={assessores} />
      </Suspense>
    </div>
  )
}
```

## Template com Parâmetros de Rota

```typescript
// src/app/(auth)/assessores/[id]/page.tsx
interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string }>
}

export default async function AssessorDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { mes } = await searchParams

  const [assessor, historico] = await Promise.all([
    api.assessores.get(id),
    api.assessores.historico(id, { mes }),
  ])

  if (!assessor) {
    return <div className="text-[var(--neg-fg)]">Assessor não encontrado.</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="font-text text-2xl font-semibold tracking-tight">
        {assessor.nome_assessor}
      </h1>
      {/* ... */}
    </div>
  )
}
```

## Cliente de API Tipado

```typescript
// src/lib/api/client.ts
const BASE = process.env.NEXT_PUBLIC_API_URL

async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const api = {
  assessores: {
    list: ()               => fetchAPI<{ data: Assessor[] }>('/assessores').then(r => r.data),
    get:  (id: string)     => fetchAPI<{ data: Assessor }>(`/assessores/${id}`).then(r => r.data),
    historico: (id: string, params?: { mes?: string }) => {
      const qs = params?.mes ? `?mes=${params.mes}` : ''
      return fetchAPI<{ data: HistoricoItem[] }>(`/assessores/${id}/historico${qs}`).then(r => r.data)
    },
  },
}
```

## Error Boundary

```typescript
// src/app/(auth)/assessores/error.tsx
'use client'

export default function AssesoresError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] p-6 text-center">
      <p className="text-[var(--neg-fg)] font-text">
        Erro ao carregar assessores.
      </p>
      <button
        onClick={reset}
        className="mt-3 text-sm underline text-[var(--color-b-500)]"
      >
        Tentar novamente
      </button>
    </div>
  )
}
```

## Quando Usar Server vs Client

| Cenário | Usar |
|---------|------|
| Mostrar lista de dados sem filtro interativo | Server Component |
| Dados com filtro/busca controlado pelo usuário | Client Component |
| Dados que mudam em tempo real | Client Component |
| Formulário | Client Component |
| Página com scroll infinito | Client Component |
| Relatório estático | Server Component |
