/**
 * Busca e parseia feeds RSS dos veículos de notícias financeiras.
 * Roda no Cloudflare Worker (sem DOMParser — parser manual via regex).
 */

export type NoticiaRSS = {
  id: string
  source: string
  sourceColor: string
  category: string
  headline: string
  summary: string
  url: string
  publishedAt: string // ISO 8601
}

type RSSSource = {
  name: string
  color: string
  category: string
  feedUrl: string
}

const SOURCES: RSSSource[] = [
  {
    name: 'InfoMoney',
    color: '#e11d48',
    category: 'Mercado',
    feedUrl: 'https://www.infomoney.com.br/feed/',
  },
  {
    name: 'Valor Econômico',
    color: '#1e40af',
    category: 'Economia',
    feedUrl: 'https://valor.globo.com/rss/home/',
  },
  {
    name: 'Reuters',
    color: '#b45309',
    category: 'Internacional',
    feedUrl: 'https://feeds.reuters.com/reuters/BRTop',
  },
  {
    name: 'Neofeed',
    color: '#7c3aed',
    category: 'Mercado',
    feedUrl: 'https://neofeed.com.br/feed/',
  },
  {
    name: 'Exame',
    color: '#059669',
    category: 'Empresas',
    feedUrl: 'https://exame.com/feed/',
  },
]

// ---------------------------------------------------------------------------
// Parser XML mínimo (extrai conteúdo de tags do RSS)
// ---------------------------------------------------------------------------

function extractTag(xml: string, tag: string): string {
  // Tenta com CDATA primeiro, depois texto puro
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')

  const cdata = cdataRe.exec(xml)
  if (cdata?.[1]) return cdata[1].trim()

  const plain = plainRe.exec(xml)
  if (plain?.[1]) return plain[1].replace(/<[^>]+>/g, '').trim()

  return ''
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i')
  const m = re.exec(xml)
  return m?.[1] ?? ''
}

function parseItems(xml: string, source: RSSSource): NoticiaRSS[] {
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi
  const items: NoticiaRSS[] = []
  let match: RegExpExecArray | null

  while ((match = itemRe.exec(xml)) !== null && items.length < 3) {
    const block = match[1] ?? ''

    const title = extractTag(block, 'title')
    if (!title) continue

    const description = extractTag(block, 'description')
    const pubDate = extractTag(block, 'pubDate')
    const link =
      extractTag(block, 'link') ||
      extractAttr(block, 'link', 'href') ||
      ''

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()

    // Limpa HTML do summary e trunca em 200 chars
    const summary = description
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200)

    items.push({
      id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${items.length}`,
      source: source.name,
      sourceColor: source.color,
      category: source.category,
      headline: title,
      summary: summary || title,
      url: link,
      publishedAt,
    })
  }

  return items
}

// ---------------------------------------------------------------------------
// Fetch de um feed com timeout
// ---------------------------------------------------------------------------

async function fetchFeed(source: RSSSource): Promise<NoticiaRSS[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'INTRA-Nobel/1.0 (RSS reader)' },
    })
    clearTimeout(timeout)

    if (!res.ok) return []

    const xml = await res.text()
    return parseItems(xml, source)
  } catch {
    console.error(`[rss] falha ao buscar ${source.name}`)
    return []
  }
}

// ---------------------------------------------------------------------------
// Exportação principal
// ---------------------------------------------------------------------------

export type NoticiasPayload = {
  noticias: NoticiaRSS[]
  atualizadoEm: string // ISO 8601
}

export async function fetchAllNews(): Promise<NoticiasPayload> {
  const results = await Promise.allSettled(SOURCES.map(fetchFeed))

  const noticias = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    // Ordena da mais recente para a mais antiga
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return {
    noticias,
    atualizadoEm: new Date().toISOString(),
  }
}
