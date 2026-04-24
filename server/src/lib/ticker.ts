/**
 * Busca indicadores de mercado para o TickerBar do INTRA.
 *
 * Fontes (gratuitas, sem API key):
 *   - IBOV / S&P 500 : Yahoo Finance (unofficial chart API)
 *   - USD/BRL        : Banco Central do Brasil (série 1)
 *   - CDI a.a.       : BCB — Meta Selic (série 432)
 *   - IPCA acum.12m  : BCB — série 13522
 *   - BTC/USD        : CoinGecko free API
 */

export type TickerItem = {
  name: string
  value: string
  change: string
  up: boolean | null // true=verde, false=vermelho, null=neutro
}

export type TickerPayload = {
  tickers: TickerItem[]
  atualizadoEm: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; INTRA-Nobel/1.0)' },
    })
    clearTimeout(t)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${fmt(pct)}%`
}

// ---------------------------------------------------------------------------
// IBOV e S&P 500 — Yahoo Finance chart API
// ---------------------------------------------------------------------------

type YahooChart = {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number
        previousClose: number
        currency: string
      }
    }>
    error: unknown
  }
}

async function fetchYahoo(symbol: string): Promise<{ price: number; change: number } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
  const data = await fetchJson<YahooChart>(url)
  const meta = data?.chart?.result?.[0]?.meta
  if (!meta) return null
  const price = meta.regularMarketPrice
  const prev = meta.previousClose
  const change = prev > 0 ? ((price - prev) / prev) * 100 : 0
  return { price, change }
}

async function fetchIbov(): Promise<TickerItem> {
  const r = await fetchYahoo('^BVSP')
  if (!r) return { name: 'IBOV', value: '—', change: '—', up: null }
  return {
    name: 'IBOV',
    value: Math.round(r.price).toLocaleString('pt-BR'),
    change: fmtChange(r.change),
    up: r.change >= 0,
  }
}

async function fetchSP500(): Promise<TickerItem> {
  const r = await fetchYahoo('^GSPC')
  if (!r) return { name: 'S&P 500', value: '—', change: '—', up: null }
  return {
    name: 'S&P 500',
    value: Math.round(r.price).toLocaleString('pt-BR'),
    change: fmtChange(r.change),
    up: r.change >= 0,
  }
}

// ---------------------------------------------------------------------------
// USD/BRL — BCB série 1 (últimas 2 cotações para calcular variação)
// ---------------------------------------------------------------------------

type BcbSerie = Array<{ data: string; valor: string }>

async function fetchUsdBrl(): Promise<TickerItem> {
  const data = await fetchJson<BcbSerie>(
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/2?formato=json',
  )
  if (!data || data.length < 1) return { name: 'USD/BRL', value: '—', change: '—', up: null }

  const last = Number.parseFloat((data[data.length - 1]?.valor ?? '0').replace(',', '.'))
  const prev = data.length > 1 ? Number.parseFloat((data[data.length - 2]?.valor ?? '0').replace(',', '.')) : last
  const change = prev > 0 ? ((last - prev) / prev) * 100 : 0

  return {
    name: 'USD/BRL',
    value: fmt(last),
    change: fmtChange(change),
    up: change >= 0,
  }
}

// ---------------------------------------------------------------------------
// CDI / Meta Selic — BCB série 432
// ---------------------------------------------------------------------------

async function fetchCdi(): Promise<TickerItem> {
  const data = await fetchJson<BcbSerie>(
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',
  )
  const valor = data?.[0]?.valor
  if (!valor) return { name: 'CDI', value: '—', change: 'a.a.', up: null }

  const rate = Number.parseFloat(valor.replace(',', '.'))
  return {
    name: 'CDI',
    value: `${fmt(rate)}%`,
    change: 'a.a.',
    up: null,
  }
}

// ---------------------------------------------------------------------------
// IPCA acumulado 12m — BCB série 13522
// ---------------------------------------------------------------------------

async function fetchIpca(): Promise<TickerItem> {
  const data = await fetchJson<BcbSerie>(
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json',
  )
  const valor = data?.[0]?.valor
  if (!valor) return { name: 'IPCA', value: '—', change: 'acum. 12m', up: null }

  const rate = Number.parseFloat(valor.replace(',', '.'))
  return {
    name: 'IPCA',
    value: `${fmt(rate)}%`,
    change: 'acum. 12m',
    up: null,
  }
}

// ---------------------------------------------------------------------------
// BTC/USD — CoinGecko free API
// ---------------------------------------------------------------------------

type CoinGeckoPrice = {
  bitcoin: {
    usd: number
    usd_24h_change: number
  }
}

async function fetchBtc(): Promise<TickerItem> {
  const data = await fetchJson<CoinGeckoPrice>(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
  )
  const btc = data?.bitcoin
  if (!btc) return { name: 'BTC', value: '—', change: '—', up: null }

  return {
    name: 'BTC',
    value: `$${Math.round(btc.usd).toLocaleString('en-US')}`,
    change: fmtChange(btc.usd_24h_change),
    up: btc.usd_24h_change >= 0,
  }
}

// ---------------------------------------------------------------------------
// Exportação principal
// ---------------------------------------------------------------------------

export async function fetchAllTickers(): Promise<TickerPayload> {
  const results = await Promise.allSettled([
    fetchIbov(),
    fetchUsdBrl(),
    fetchCdi(),
    fetchIpca(),
    fetchSP500(),
    fetchBtc(),
  ])

  const tickers = results.map((r) =>
    r.status === 'fulfilled' ? r.value : { name: '—', value: '—', change: '—', up: null },
  )

  return { tickers, atualizadoEm: new Date().toISOString() }
}
