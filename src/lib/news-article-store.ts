import type { NewsItemDto } from './api/modules/news/news.types'

const STORAGE_KEY = 'ws-news-article-by-key'

type ArticleMap = Record<string, NewsItemDto>

function readMap(): ArticleMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as ArticleMap
  } catch {
    return {}
  }
}

function writeMap(map: ArticleMap) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / private mode
  }
}

function articleKeys(item: NewsItemDto): string[] {
  const keys = [item.id]
  const slug = item.slug?.trim()
  if (slug) keys.push(slug)
  return keys.filter(Boolean)
}

/** Conserve les articles vus dans le fil pour la page détail (navigation full-page). */
export function rememberNewsArticles(items: NewsItemDto[]) {
  if (items.length === 0) return
  const map = readMap()
  for (const item of items) {
    for (const key of articleKeys(item)) {
      const previous = map[key]
      const incomingHasBody = Boolean(item.content?.trim())
      const previousHasBody = Boolean(previous?.content?.trim())
      // Ne pas écraser un article complet par une version liste sans content.
      if (previousHasBody && !incomingHasBody) continue
      map[key] = item
    }
  }
  writeMap(map)
}

export function recallNewsArticle(slugOrId: string): NewsItemDto | null {
  const key = slugOrId.trim()
  if (!key) return null
  const map = readMap()
  return map[key] ?? map[decodeURIComponent(key)] ?? null
}
