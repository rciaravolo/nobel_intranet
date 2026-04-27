/**
 * Calcula a data da Páscoa pelo algoritmo de Meeus/Jones/Butcher.
 */
function easter(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 1-based
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function toISO(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Retorna um Set com todas as datas de feriados nacionais brasileiros do ano,
 * no formato "YYYY-MM-DD".
 *
 * Feriados fixos: 01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 20/11, 25/12
 * Feriados móveis (via Páscoa): Carnaval (seg/ter), Sexta-feira Santa, Corpus Christi
 */
function feriadosBR(year: number): Set<string> {
  const fixos = [
    `${year}-01-01`, // Ano Novo
    `${year}-04-21`, // Tiradentes
    `${year}-05-01`, // Dia do Trabalho
    `${year}-09-07`, // Independência
    `${year}-10-12`, // Nossa Senhora Aparecida
    `${year}-11-02`, // Finados
    `${year}-11-15`, // Proclamação da República
    `${year}-11-20`, // Consciência Negra
    `${year}-12-25`, // Natal
  ]

  const pascoa = easter(year)
  const moveis = [
    toISO(addDays(pascoa, -48)), // Carnaval segunda
    toISO(addDays(pascoa, -47)), // Carnaval terça
    toISO(addDays(pascoa, -2)),  // Sexta-feira Santa
    toISO(addDays(pascoa, 60)),  // Corpus Christi
  ]

  return new Set([...fixos, ...moveis])
}

/**
 * Conta dias úteis no intervalo [start, end) — start inclusivo, end exclusivo.
 * Dia útil = não é sábado (6), não é domingo (0), não é feriado.
 */
function contarDiasUteis(start: Date, end: Date, feriados: Set<string>): number {
  let count = 0
  const cur = new Date(start)
  while (cur < end) {
    const dow = cur.getUTCDay()
    if (dow !== 0 && dow !== 6 && !feriados.has(toISO(cur))) {
      count++
    }
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return count
}

/**
 * Retorna os dias úteis do mês corrente (no fuso BRT = UTC-3):
 * - passados:   do dia 1 até hoje (inclusive), contando apenas dias úteis
 * - restantes:  de amanhã até o último dia do mês (inclusive)
 * - total:      passados + restantes
 */
export function diasUteisDoMes(agora: Date): {
  passados: number
  restantes: number
  total: number
} {
  // Converter para BRT (UTC-3)
  const brt = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const year  = brt.getUTCFullYear()
  const month = brt.getUTCMonth() // 0-based
  const today = brt.getUTCDate()

  const feriados = feriadosBR(year)

  const primeiroDia  = new Date(Date.UTC(year, month, 1))
  const ultimoDia    = new Date(Date.UTC(year, month + 1, 1)) // exclusive (próximo mês)
  const hojeInc      = new Date(Date.UTC(year, month, today + 1)) // +1 para intervalo exclusivo
  const amanha       = new Date(Date.UTC(year, month, today + 1))

  const passados   = contarDiasUteis(primeiroDia, hojeInc, feriados)
  const restantes  = contarDiasUteis(amanha,      ultimoDia, feriados)

  return { passados, restantes, total: passados + restantes }
}
