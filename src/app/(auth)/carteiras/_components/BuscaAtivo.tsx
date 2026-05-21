'use client'

import { useEffect, useRef, useState } from 'react'
import { DrillDrawer } from './DrillDrawer'

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

type Resultado = {
  classe: 'rf' | 'rv'
  ativo: string
  categoria: string | null
  total: number
  clientes: number
}

type Selected = { ativo: string; classe: 'rf' | 'rv' }

/* ─── Formatter ──────────────────────────────────────────────────────────── */

function fBRL(v: number): string {
  const abs = Math.abs(v)
  const pre = v < 0 ? '-R$ ' : 'R$ '
  if (abs >= 1_000_000_000) return `${pre}${(abs / 1_000_000_000).toFixed(2).replace('.', ',')}B`
  if (abs >= 1_000_000) return `${pre}${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000) return `${pre}${Math.round(abs / 1_000)}K`
  return `${pre}${abs.toFixed(0)}`
}

/* ─── Paleta por classe ──────────────────────────────────────────────────── */

const CLASSE_COLOR: Record<'rf' | 'rv', { bg: string; fg: string; border: string }> = {
  rf: { bg: 'color-mix(in srgb,#2D5FA0 12%,transparent)', fg: '#2D5FA0', border: 'color-mix(in srgb,#2D5FA0 30%,transparent)' },
  rv: { bg: 'color-mix(in srgb,#F59E0B 12%,transparent)', fg: '#B45309', border: 'color-mix(in srgb,#F59E0B 30%,transparent)' },
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BuscaAtivo() {
  const [query, setQuery]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resultados, setResult] = useState<Resultado[]>([])
  const [showDrop, setShowDrop] = useState(false)
  const [selected, setSelected] = useState<Selected | null>(null)
  const [focused, setFocused]   = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Busca debounced ── */
  useEffect(() => {
    if (query.length < 2) {
      setResult([])
      setShowDrop(false)
      setFocused(-1)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/performance/carteiras/ativos/busca?q=${encodeURIComponent(query)}`,
        )
        if (!res.ok) return
        const json = (await res.json()) as { data: { resultados: Resultado[] } }
        setResult(json.data.resultados)
        setShowDrop(true)
        setFocused(-1)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  /* ── Fechar dropdown ao clicar fora ── */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  /* ── Keyboard navigation ── */
  function onKeyDown(e: React.KeyboardEvent) {
    if (!showDrop || resultados.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocused((f) => Math.min(f + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocused((f) => Math.max(f - 1, 0))
    } else if (e.key === 'Enter' && focused >= 0) {
      e.preventDefault()
      const r = resultados[focused]
      if (r) pick(r)
    } else if (e.key === 'Escape') {
      setShowDrop(false)
      inputRef.current?.blur()
    }
  }

  function pick(r: Resultado) {
    setSelected({ ativo: r.ativo, classe: r.classe })
    setShowDrop(false)
    setQuery('')
  }

  function clear() {
    setQuery('')
    setResult([])
    setShowDrop(false)
    inputRef.current?.focus()
  }

  return (
    <>
      <div
        ref={containerRef}
        style={{ position: 'relative', marginBottom: 'var(--s-4)', maxWidth: 520 }}
      >
        {/* Input container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 14px',
            height: 40,
            background: 'var(--bg-elev)',
            border: '1px solid var(--line)',
            borderRadius: showDrop && resultados.length > 0 ? '10px 10px 0 0' : 10,
            transition: 'border-color .15s, box-shadow .15s',
            boxShadow: showDrop && resultados.length > 0 ? 'var(--e-float)' : 'none',
          }}
        >
          {/* Search icon */}
          <svg
            width={14}
            height={14}
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0, color: loading ? '#2D5FA0' : 'var(--fg-faint)' }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => query.length >= 2 && resultados.length > 0 && setShowDrop(true)}
            placeholder="Buscar ativo... PETR4, NTN-B, CDB Itaú..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'var(--f-mono)',
              fontSize: 13,
              color: 'var(--fg)',
              letterSpacing: '-.01em',
            }}
          />

          {loading && (
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 9,
                color: '#2D5FA0',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              ...
            </span>
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={clear}
              style={{
                flexShrink: 0,
                width: 18,
                height: 18,
                borderRadius: 999,
                border: 'none',
                background: 'var(--fg-faint)',
                color: 'var(--bg)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDrop && resultados.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              boxShadow: 'var(--e-float)',
              zIndex: 30,
              overflow: 'hidden',
            }}
          >
            {resultados.map((r, i) => {
              const c = CLASSE_COLOR[r.classe]
              const isFocused = i === focused
              return (
                <button
                  key={`${r.classe}-${r.ativo}`}
                  type="button"
                  onMouseEnter={() => setFocused(i)}
                  onMouseLeave={() => setFocused(-1)}
                  onClick={() => pick(r)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: isFocused ? 'var(--bg-deep)' : 'transparent',
                    border: 'none',
                    borderBottom:
                      i < resultados.length - 1 ? '1px solid var(--line)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background .08s',
                  }}
                >
                  {/* Classe badge */}
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: 'var(--f-mono)',
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: '.18em',
                      textTransform: 'uppercase',
                      color: c.fg,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 4,
                      padding: '2px 6px',
                      minWidth: 24,
                      textAlign: 'center',
                    }}
                  >
                    {r.classe.toUpperCase()}
                  </span>

                  {/* Ativo */}
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--fg)',
                      letterSpacing: '-.01em',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.ativo}
                  </span>

                  {/* Categoria */}
                  {r.categoria && (
                    <span
                      style={{
                        fontFamily: 'var(--f-mono)',
                        fontSize: 9,
                        color: 'var(--fg-faint)',
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      {r.categoria}
                    </span>
                  )}

                  {/* Clientes */}
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 10,
                      color: 'var(--fg-mute)',
                      flexShrink: 0,
                    }}
                  >
                    {r.clientes} cli.
                  </span>

                  {/* Total */}
                  <span
                    style={{
                      fontFamily: 'var(--f-mono)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--fg)',
                      fontFeatureSettings: '"tnum"',
                      flexShrink: 0,
                      minWidth: 64,
                      textAlign: 'right',
                    }}
                  >
                    {fBRL(r.total)}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {showDrop && !loading && query.length >= 2 && resultados.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              padding: '14px 16px',
              fontFamily: 'var(--f-mono)',
              fontSize: 12,
              color: 'var(--fg-faint)',
            }}
          >
            Nenhum ativo encontrado para &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {/* Drawer */}
      <DrillDrawer
        ativo={selected?.ativo ?? null}
        classe={selected?.classe ?? 'rf'}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
