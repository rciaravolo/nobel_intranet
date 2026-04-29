'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Assessor = {
  id_assessor: string
  nome_assessor: string | null
  equipe: string
}

type Props = {
  equipes: string[]
  assessores: Assessor[]
}

export function AnalisesFilters({ equipes, assessores }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('filter_type')
  const currentValue = searchParams.get('filter_value')

  function setFilter(type: string | null, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!type || !value) {
      params.delete('filter_type')
      params.delete('filter_value')
    } else {
      params.set('filter_type', type)
      params.set('filter_value', value)
    }
    const qs = params.toString()
    router.push(`/analises${qs ? `?${qs}` : ''}`)
  }

  const selectStyle: React.CSSProperties = {
    height: 32,
    padding: '0 28px 0 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--f-mono)',
    border: '1px solid var(--line-strong)',
    background: 'var(--bg-deep)',
    color: 'var(--fg)',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23B8963E' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 9px center',
    minWidth: 140,
  }

  const activeSelectStyle: React.CSSProperties = {
    ...selectStyle,
    border: '1px solid var(--color-b-500)',
    background: 'var(--bg-elev)',
  }

  const equipeValue = currentType === 'equipe' ? (currentValue ?? '') : ''
  const assessorValue = currentType === 'assessor' ? (currentValue ?? '') : ''

  // Quando uma equipe está selecionada, pré-filtra a lista de assessores
  const assessorEquipe = assessores.find((a) => a.id_assessor === assessorValue)?.equipe ?? ''
  const equipeContexto = equipeValue || assessorEquipe
  const assessoresFiltrados = equipeContexto
    ? assessores.filter((a) => a.equipe === equipeContexto)
    : assessores

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span
        style={{
          fontSize: 10,
          color: 'var(--fg-faint)',
          fontFamily: 'var(--f-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
        }}
      >
        Filtrar
      </span>

      {/* Equipe */}
      {equipes.length > 0 && (
        <select
          style={equipeValue ? activeSelectStyle : selectStyle}
          value={equipeValue}
          onChange={(e) => {
            const v = e.target.value
            setFilter(v ? 'equipe' : null, v || null)
          }}
        >
          <option value="">Equipe — todas</option>
          {equipes.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      )}

      {/* Assessor — lista filtrada pela equipe selecionada */}
      {assessores.length > 0 && (
        <select
          style={assessorValue ? activeSelectStyle : selectStyle}
          value={assessorValue}
          onChange={(e) => {
            const v = e.target.value
            setFilter(v ? 'assessor' : null, v || null)
          }}
        >
          <option value="">
            {equipeContexto ? `Assessor — ${equipeContexto}` : 'Assessor — todos'}
          </option>
          {assessoresFiltrados.map((a) => (
            <option key={a.id_assessor} value={a.id_assessor}>
              {a.nome_assessor ?? a.id_assessor}
            </option>
          ))}
        </select>
      )}

      {/* Limpar filtro ativo */}
      {currentType && (
        <button
          type="button"
          onClick={() => setFilter(null, null)}
          style={{
            height: 32,
            padding: '0 12px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--f-mono)',
            border: '1px solid var(--line-strong)',
            background: 'transparent',
            color: 'var(--fg)',
          }}
        >
          ✕ Limpar
        </button>
      )}
    </div>
  )
}
