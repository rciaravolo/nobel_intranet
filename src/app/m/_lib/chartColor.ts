// Paleta Nobel — escala dourado → cinza claro (ordem obrigatória)
const STOPS = ['#C29404', '#8F6B12', '#5F5E5B', '#8C8B87', '#B4B3AE', '#D2D1CC']

function hexToRgb(h: string): [number, number, number] {
  const c = h.replace('#', '')
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]
}

function toHex(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
}

// Interpola a paleta Nobel: rank 0 (maior) = Ouro Nobel, rank total-1 (menor) = Cinza Claro
export function rankColor(rank: number, total: number): string {
  if (total <= 1) return STOPS[0]!
  const t = rank / (total - 1)
  const pos = t * (STOPS.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.min(lo + 1, STOPS.length - 1)
  const frac = pos - lo
  const [r1, g1, b1] = hexToRgb(STOPS[lo]!)
  const [r2, g2, b2] = hexToRgb(STOPS[hi]!)
  return `#${toHex(r1 + (r2 - r1) * frac)}${toHex(g1 + (g2 - g1) * frac)}${toHex(b1 + (b2 - b1) * frac)}`
}
