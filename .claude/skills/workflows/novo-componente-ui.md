---
name: novo-componente-ui
description: Passo a passo para criar componente visual — CVA, 4 estados obrigatórios, acessibilidade e teste
type: workflow
version: 1
---

## Canonical
Processo para criar um componente React no design system do INTRA. Toda peça visual nova deve seguir: verificar se existe → CVA → 4 estados → acessibilidade → teste.

## Entry Point
**Invocar quando:**
- "cria componente de X"
- "adiciona card/badge/tabela de Y"
- `design-intranet` ou `frontend-intranet` vai criar componente novo

**NÃO invocar para:**
- página inteira (ver `workflows/nova-feature.md`)
- ajuste de token de cor (ver `dominio/design-system.md`)
- lógica de dados (ver `padroes/client-component.md`)

## Source of Truth
- `dominio/design-system.md` — tokens a usar
- `src/components/ui/` — componentes base existentes (shadcn)
- `src/components/features/` — componentes de feature existentes

## Scope Resolver
**DENTRO:** criar componente React, definir variantes CVA, implementar 4 estados visuais, escrever teste

**FORA:** tokens de cor/tipografia (ver `dominio/design-system.md`), integração com API (ver `padroes/client-component.md`)

## Evidence Gates
- Verificar `src/components/` — o componente não existe ainda?
- Verificar `dominio/design-system.md` antes de definir cores ou fontes
- Todo componente de dados DEVE ter os 4 estados (loading/vazio/erro/sucesso)

## Mutation Boundary
**PODE:** criar em `src/components/ui/` ou `src/components/features/[feature]/`
**NUNCA:** criar componente com valores hardcoded de cor (hex direto) — sempre usar tokens CSS

## Verification Protocol
1. Renderiza no browser sem erros?
2. Dark mode correto (toggle `data-theme="dark"`)?
3. Estado loading: skeleton visível?
4. Estado vazio: mensagem + ícone aparece?
5. Estado erro: mensagem descritiva + botão retry?
6. `npx vitest run` → teste passando?
7. Contraste de cor ≥ 4.5:1?

## Output Contract
Produz: arquivo `.tsx` em `src/components/`, arquivo de teste em `__tests__/`.

## Companion Reference
- `dominio/design-system.md` — tokens e regras visuais
- `padroes/client-component.md` — quando o componente é client-side com dados
- Agente: `design-intranet` (define visual), `frontend-intranet` (implementa)

## Feedback Loop
Se um estado visual novo precisar ser adicionado (ex: "sem permissão"), documentar em `dominio/design-system.md`.

---

## Checklist de Novo Componente

```
[ ] 1. Verificar que o componente não existe em src/components/
[ ] 2. Verificar tokens a usar (dominio/design-system.md)
[ ] 3. Criar arquivo .tsx no local correto
[ ] 4. Implementar estrutura base com CVA para variantes
[ ] 5. Implementar estado Loading (skeleton animate-pulse)
[ ] 6. Implementar estado Vazio (mensagem + ícone + CTA)
[ ] 7. Implementar estado Erro (mensagem + retry button)
[ ] 8. Implementar estado Sucesso/Dados
[ ] 9. Verificar acessibilidade (alt, aria-label, focus)
[ ] 10. Escrever teste de renderização mínimo
[ ] 11. Testar dark mode
```

## Onde Criar o Arquivo

| Tipo | Localização | Quando |
|------|-------------|--------|
| Componente base (genérico) | `src/components/ui/` | Reutilizável em qualquer feature |
| Componente de feature | `src/components/features/[feature]/` | Específico de uma área |

## Template com CVA

```typescript
// src/components/ui/MetricCard.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const metricCard = cva(
  // base — sempre aplicado
  'rounded-xl border p-4 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-elev)] border-[var(--line)]',
        highlight: 'bg-[var(--bg-elev)] border-[var(--color-b-500)] shadow-[var(--e-float)]',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface MetricCardProps extends VariantProps<typeof metricCard> {
  className?: string
  children: React.ReactNode
}

export function MetricCard({ variant, size, className, children }: MetricCardProps) {
  return (
    <div className={cn(metricCard({ variant, size }), className)}>
      {children}
    </div>
  )
}
```

## Template dos 4 Estados

```typescript
// componente que busca dados
export function AssessorCard({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['assessor', id],
    queryFn: () => api.assessores.get(id),
  })

  // Loading
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-[var(--line)] bg-[var(--bg-elev)] h-24" />
    )
  }

  // Erro
  if (isError) {
    return (
      <div className="rounded-xl border border-[var(--line)] p-4 text-[var(--neg-fg)]">
        <p>Não foi possível carregar os dados.</p>
        <button onClick={() => refetch()} className="mt-2 text-sm underline">
          Tentar novamente
        </button>
      </div>
    )
  }

  // Vazio
  if (!data) {
    return (
      <div className="rounded-xl border border-[var(--line)] p-4 text-[var(--text-muted)] flex flex-col items-center gap-2">
        <UserIcon className="size-8 opacity-40" />
        <p>Assessor não encontrado.</p>
      </div>
    )
  }

  // Sucesso
  return (
    <MetricCard>
      <h3 className="font-text font-semibold text-[13px]">{data.nome_assessor}</h3>
      <p className="font-mono text-2xl font-medium">{formatCurrency(data.aum)}</p>
    </MetricCard>
  )
}
```

## Template de Teste

```typescript
// __tests__/MetricCard.test.tsx
import { render, screen } from '@testing-library/react'
import { MetricCard } from '../MetricCard'

describe('MetricCard', () => {
  it('renderiza children', () => {
    render(<MetricCard>Conteúdo</MetricCard>)
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('aceita variante highlight', () => {
    const { container } = render(<MetricCard variant="highlight">X</MetricCard>)
    expect(container.firstChild).toHaveClass('border-[var(--color-b-500)]')
  })
})
```
