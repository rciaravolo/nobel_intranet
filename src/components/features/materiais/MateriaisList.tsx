'use client'

import type { Material } from '@/lib/api/materiais'
import { materiaisApi } from '@/lib/api/materiais'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { MaterialCard } from './MaterialCard'
import { MaterialFormModal } from './MaterialFormModal'

type Props = {
  canManage: boolean
}

export function MateriaisList({ canManage }: Props) {
  const qc = useQueryClient()
  const [busca, setBusca] = useState('')

  // Marca "materiais vistos" ao chegar em /relatorios — evita o popup
  // ficar avisando de materiais que o user acabou de ver.
  useEffect(() => {
    try {
      localStorage.setItem('materiais_visto_em', new Date().toISOString())
    } catch {
      // localStorage indisponível (ex.: SSR fake) — ignorar
    }
  }, [])
  const [modalMode, setModalMode] = useState<
    null | { mode: 'create' } | { mode: 'edit'; material: Material }
  >(null)

  const {
    data: materiais = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['materiais'],
    queryFn: () => materiaisApi.list(),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => materiaisApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materiais'] }),
  })

  const filtrados = busca.trim()
    ? materiais.filter((m) => {
        const q = busca.toLowerCase()
        return (
          m.titulo.toLowerCase().includes(q) ||
          m.descricao?.toLowerCase().includes(q) ||
          m.arquivoNome.toLowerCase().includes(q)
        )
      })
    : materiais

  function handleDelete(m: Material) {
    if (!confirm(`Excluir "${m.titulo}"? Essa ação não pode ser desfeita.`)) return
    deleteMut.mutate(m.id)
  }

  return (
    <div>
      {/* Toolbar: busca + botão novo */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar materiais…"
          aria-label="Buscar materiais"
          style={{
            flex: 1,
            maxWidth: 380,
            padding: '10px 14px',
            border: '1px solid var(--line)',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--fg)',
            background: 'var(--bg)',
            outline: 'none',
          }}
        />

        {canManage && (
          <button
            type="button"
            onClick={() => setModalMode({ mode: 'create' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'var(--fg)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '.06em',
              cursor: 'pointer',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo material
          </button>
        )}
      </div>

      {/* Estados */}
      {isLoading && <ListSkeleton />}

      {isError && (
        <div
          role="alert"
          style={{
            padding: '14px 18px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            fontSize: 13,
            color: '#991b1b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Não foi possível carregar os materiais.</span>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              padding: '6px 14px',
              background: '#991b1b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Tentar de novo
          </button>
        </div>
      )}

      {!isLoading && !isError && filtrados.length === 0 && (
        <EmptyState hasSearch={Boolean(busca.trim())} canManage={canManage} />
      )}

      {!isLoading && !isError && filtrados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtrados.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              canManage={canManage}
              onEdit={(mat) => setModalMode({ mode: 'edit', material: mat })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalMode?.mode === 'create' && (
        <MaterialFormModal mode="create" onClose={() => setModalMode(null)} />
      )}
      {modalMode?.mode === 'edit' && (
        <MaterialFormModal
          mode="edit"
          material={modalMode.material}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 88,
            background: 'var(--bg-elev, #fafaf8)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  )
}

function EmptyState({ hasSearch, canManage }: { hasSearch: boolean; canManage: boolean }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        border: '1px dashed var(--line-strong)',
        borderRadius: 10,
        textAlign: 'center',
        color: 'var(--fg-faint)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--f-text)',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--fg)',
          marginBottom: 6,
        }}
      >
        {hasSearch ? 'Nada encontrado' : 'Nenhum material publicado ainda'}
      </p>
      <p style={{ fontSize: 12 }}>
        {hasSearch
          ? 'Tente outros termos de busca.'
          : canManage
            ? 'Clique em "Novo material" para publicar o primeiro.'
            : 'Assim que alguém publicar, os materiais aparecem aqui.'}
      </p>
    </div>
  )
}
