import type {
  SearchModuleType,
  SearchResultDto,
} from './api/modules/search/search.types'

export const SEARCH_MIN_CHARS = 2
export const SEARCH_PAGE_PATH = '/recherche'

/** Ordre d’affichage des filtres (page de résultats). */
export const SEARCH_MODULES: ReadonlyArray<{
  id: SearchModuleType
  label: string
  singular: string
}> = [
  { id: 'users', label: 'Personnes', singular: 'Personne' },
  { id: 'video', label: 'Vidéos', singular: 'Vidéo' },
  { id: 'news', label: 'Actualités', singular: 'Actualité' },
  { id: 'job_sheet', label: 'Métiers', singular: 'Métier' },
  { id: 'emission', label: 'Émissions', singular: 'Émission' },
  { id: 'play', label: 'Quiz Play', singular: 'Quiz Play' },
  { id: 'quiz', label: 'Quiz', singular: 'Quiz' },
  { id: 'school', label: 'Écoles', singular: 'École' },
  { id: 'magazine', label: 'Magazines', singular: 'Magazine' },
  { id: 'scholarship', label: 'Bourses d’études', singular: 'Bourse' },
  { id: 'foreign_study', label: 'Études à l’étranger', singular: 'Étude à l’étranger' },
  { id: 'revision', label: 'Révisions', singular: 'Révision' },
  { id: 'questionnaire', label: 'Questionnaires', singular: 'Questionnaire' },
  { id: 'product', label: 'Marketplace', singular: 'Produit' },
  { id: 'permutation', label: 'Permutations', singular: 'Permutation' },
  { id: 'orientation', label: 'Orientation', singular: 'Orientation' },
  { id: 'document_request', label: 'Demandes de documents', singular: 'Document' },
]

const MODULE_IDS = new Set<string>(SEARCH_MODULES.map((m) => m.id))

export function isSearchModuleType(value: string | null | undefined): value is SearchModuleType {
  return Boolean(value && MODULE_IDS.has(value))
}

export function searchModuleLabel(contentType: string, plural = false): string {
  const meta = SEARCH_MODULES.find((m) => m.id === contentType)
  if (!meta) return contentType.replace(/_/g, ' ')
  return plural ? meta.label : meta.singular
}

export function searchPageHref(query: string, moduleType?: SearchModuleType | null): string {
  const params = new URLSearchParams({ q: query.trim() })
  if (moduleType) params.set('type', moduleType)
  return `${SEARCH_PAGE_PATH}?${params.toString()}`
}

type Obj = Record<string, unknown>

function asObj(value: unknown): Obj | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Obj) : null
}

function asStr(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function userParticipations(result: SearchResultDto): Obj[] {
  const history = result.resultObject?.emissionEditionParticipationHistory
  return Array.isArray(history) ? history.map(asObj).filter((h): h is Obj => Boolean(h)) : []
}

function userCandidateId(result: SearchResultDto): string | null {
  const history = userParticipations(result)
  const valid = history.find((h) => h.candidateStatus === 'VALIDE') ?? history[0]
  return valid ? asStr(valid.candidateId) : null
}

export type SearchResultLink = { href: string; external: boolean }

/** Page du site correspondant à un résultat, ou null si le module n’a pas de page ici. */
export function searchResultLink(result: SearchResultDto): SearchResultLink | null {
  const obj = result.resultObject ?? {}
  switch (result.contentType) {
    case 'news':
      return { href: `/actualites/${encodeURIComponent(result.slug || result.id)}`, external: false }
    case 'users': {
      const candidateId = userCandidateId(result)
      return candidateId
        ? { href: `/showroom/${encodeURIComponent(candidateId)}`, external: false }
        : null
    }
    case 'job_sheet':
      return { href: `/competition?metier=${encodeURIComponent(result.id)}`, external: false }
    case 'emission':
      return { href: '/competition', external: false }
    case 'play':
      return { href: `/play/${encodeURIComponent(result.id)}`, external: false }
    case 'quiz':
      return obj.isPlayQuiz === true
        ? { href: `/play/${encodeURIComponent(result.id)}`, external: false }
        : null
    case 'video': {
      const url = asStr(obj.url)
      return url ? { href: url, external: true } : { href: '/reels', external: false }
    }
    default:
      return null
  }
}

export function searchResultImage(result: SearchResultDto): string | null {
  const direct = asStr(result.mainImage)
  if (direct) return direct
  const obj = result.resultObject ?? {}
  const profile = asObj(obj.studentProfile)
  return (
    asStr(profile?.profileImage) ||
    asStr(obj.thumbnailUrl) ||
    asStr(obj.imageUrl) ||
    asStr(obj.logoUrl) ||
    asStr(obj.coverImageUrl) ||
    null
  )
}

/** Ligne secondaire affichable (sans e-mail ni téléphone pour les personnes). */
export function searchResultSubtitle(result: SearchResultDto): string {
  const label = searchModuleLabel(result.contentType)
  if (result.contentType === 'users') {
    const participation = userParticipations(result)[0]
    const edition = asStr(asObj(participation?.edition)?.title)
    return edition ? `Candidat · ${edition}` : label
  }
  const category = result.category?.name?.trim()
  return category ? `${label} · ${category}` : label
}

export function searchResultSummary(result: SearchResultDto): string | null {
  if (result.contentType === 'users') return null
  return asStr(result.summary)
}

/* ── Recherches récentes ── */

const RECENT_KEY = 'wsci-recent-searches'
const RECENT_MAX = 8

export type RecentSearch =
  | { kind: 'query'; query: string }
  | {
      kind: 'item'
      id: string
      title: string
      contentType: string
      image: string | null
      href: string
      external: boolean
    }

function recentKey(entry: RecentSearch): string {
  return entry.kind === 'query'
    ? `q:${entry.query.toLowerCase()}`
    : `i:${entry.contentType}:${entry.id}`
}

export function readRecentSearches(): RecentSearch[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as RecentSearch[]).slice(0, RECENT_MAX) : []
  } catch {
    return []
  }
}

function writeRecentSearches(entries: RecentSearch[]): RecentSearch[] {
  const next = entries.slice(0, RECENT_MAX)
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* stockage indisponible (navigation privée) */
  }
  return next
}

export function pushRecentSearch(entry: RecentSearch): RecentSearch[] {
  const key = recentKey(entry)
  return writeRecentSearches([
    entry,
    ...readRecentSearches().filter((e) => recentKey(e) !== key),
  ])
}

export function removeRecentSearch(entry: RecentSearch): RecentSearch[] {
  const key = recentKey(entry)
  return writeRecentSearches(readRecentSearches().filter((e) => recentKey(e) !== key))
}

export function clearRecentSearches(): RecentSearch[] {
  return writeRecentSearches([])
}

export function recentFromResult(result: SearchResultDto): RecentSearch | null {
  const link = searchResultLink(result)
  if (!link) return null
  return {
    kind: 'item',
    id: result.id,
    title: result.title,
    contentType: result.contentType,
    image: searchResultImage(result),
    href: link.href,
    external: link.external,
  }
}
