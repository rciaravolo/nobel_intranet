/**
 * Busca notícias de múltiplas fontes para o dashboard do INTRA.
 *
 * Fontes via news-sitemap (título + link):
 *   - InfoMoney (news-sitemap.xml)
 *
 * Fontes via RSS (título + link + summary):
 *   - Neofeed
 *   - Exame
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

export type NoticiasPayload = {
  noticias: NoticiaRSS[]
  atualizadoEm: string
}

// ---------------------------------------------------------------------------
// Helpers XML genéricos
// ---------------------------------------------------------------------------

function extractTag(xml: string, tag: string): string {
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
  return re.exec(xml)?.[1] ?? ''
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchXml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; INTRA-Nobel/1.0)' },
    })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// InfoMoney — news-sitemap.xml (título + link, sem summary)
// ---------------------------------------------------------------------------

async function fetchInfoMoney(): Promise<NoticiaRSS[]> {
  const xml = await fetchXml('https://www.infomoney.com.br/news-sitemap.xml')
  if (!xml) {
    console.error('[news] InfoMoney: falha no fetch')
    return []
  }

  // Cada entrada no news-sitemap tem <url>...<loc>...<news:title>...<news:publication_date>
  const urlRe = /<url>([\s\S]*?)<\/url>/gi
  const items: NoticiaRSS[] = []
  let match: RegExpExecArray | null

  while ((match = urlRe.exec(xml)) !== null && items.length < 5) {
    const block = match[1] ?? ''
    const loc = extractTag(block, 'loc')
    const title = extractTag(block, 'news:title')
    const pubDate =
      extractTag(block, 'news:publication_date') ||
      extractTag(block, 'lastmod')

    if (!loc || !title) continue

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()

    items.push({
      id: `infomoney-${items.length}`,
      source: 'InfoMoney',
      sourceColor: '#e11d48',
      category: 'Mercado',
      headline: title,
      summary: '',
      url: loc,
      publishedAt,
    })
  }

  return items
}

// ---------------------------------------------------------------------------
// Fontes RSS (título + link + summary)
// ---------------------------------------------------------------------------

type RSSSource = {
  name: string
  color: string
  category: string
  feedUrl: string
  maxItems?: number
}

const RSS_SOURCES: RSSSource[] = [
  { name: 'Neofeed', color: '#7c3aed', category: 'Mercado',   feedUrl: 'https://neofeed.com.br/feed/',  maxItems: 3 },
  { name: 'Exame',   color: '#059669', category: 'Empresas',  feedUrl: 'https://exame.com/feed/',        maxItems: 3 },
]

function parseRssItems(xml: string, source: RSSSource): NoticiaRSS[] {
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi
  const items: NoticiaRSS[] = []
  const max = source.maxItems ?? 3
  let match: RegExpExecArray | null

  while ((match = itemRe.exec(xml)) !== null && items.length < max) {
    const block = match[1] ?? ''
    const title = extractTag(block, 'title')
    if (!title) continue

    const description = extractTag(block, 'description')
    const pubDate = extractTag(block, 'pubDate')
    const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href')

    items.push({
      id: `${source.name.toLowerCase()}-${items.length}`,
      source: source.name,
      sourceColor: source.color,
      category: source.category,
      headline: title,
      summary: cleanHtml(description).slice(0, 200),
      url: link,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    })
  }

  return items
}

async function fetchRssSource(source: RSSSource): Promise<NoticiaRSS[]> {
  const xml = await fetchXml(source.feedUrl)
  if (!xml) {
    console.error(`[rss] ${source.name}: falha no fetch`)
    return []
  }
  return parseRssItems(xml, source)
}

// ---------------------------------------------------------------------------
// Exportação principal
// ---------------------------------------------------------------------------

export async function fetchAllNews(): Promise<NoticiasPayload> {
  const [infomoneyItems, ...rssResults] = await Promise.allSettled([
    fetchInfoMoney(),
    ...RSS_SOURCES.map(fetchRssSource),
  ])

  const noticias = [
    ...(infomoneyItems.status === 'fulfilled' ? infomoneyItems.value : []),
    ...rssResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return {
    noticias,
    atualizadoEm: new Date().toISOString(),
  }
}
