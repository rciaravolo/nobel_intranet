export const fmtBR = (n: number, decimals = 2): string =>
  n.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export const fmtCur = (n: number): string => {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000
    return `${sign}R$ ${fmtBR(m, 1).replace(/,0$/, '')}M`
  }
  if (abs >= 1_000) return `${sign}R$ ${Math.round(abs / 1000)}K`
  return `${sign}R$ ${fmtBR(abs, 0)}`
}

export const fmtCurFull = (n: number): string => {
  const sign = n < 0 ? '−' : ''
  return `${sign}R$ ${fmtBR(Math.abs(n), 2)}`
}

export const fmtPct = (n: number, decimals = 1): string =>
  `${n < 0 ? '−' : ''}${fmtBR(Math.abs(n), decimals)}%`

export const fmtFraction = (n: number, decimals = 1): string => fmtPct(n * 100, decimals)
