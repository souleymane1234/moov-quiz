export type MediaHubLayout = 'feed' | 'play' | 'reels'
export type MediaHubId = 'news' | 'alertes' | 'play' | 'reels'

export type MediaHub = {
  id: MediaHubId
  path: string
  label: string
  module: string
  layout: MediaHubLayout
  title: string
  loadingLabel: string
  emptyLabel: string
  errorLabel: string
  readLabel: string
}

export const MEDIA_HUBS: readonly MediaHub[] = [
  {
    id: 'news',
    path: '/actualites',
    label: 'Actualités',
    module: 'news',
    layout: 'feed',
    title: 'Nos actualités',
    loadingLabel: 'Chargement des actualités…',
    emptyLabel: 'Aucune actualité pour le moment.',
    errorLabel: 'Impossible de charger les actualités pour le moment.',
    readLabel: 'Lire la publication',
  },
  {
    id: 'alertes',
    path: '/alertes',
    label: 'Alertes',
    module: 'alertes',
    layout: 'feed',
    title: 'Alertes',
    loadingLabel: 'Chargement des alertes…',
    emptyLabel: 'Aucune alerte pour le moment.',
    errorLabel: 'Impossible de charger les alertes pour le moment.',
    readLabel: 'Lire l’alerte',
  },
  {
    id: 'play',
    path: '/play',
    label: 'Play',
    module: 'play',
    layout: 'play',
    title: 'Play',
    loadingLabel: 'Chargement des vidéos…',
    emptyLabel: 'Aucune vidéo pour le moment.',
    errorLabel: 'Impossible de charger Play pour le moment.',
    readLabel: 'Voir la vidéo',
  },
  {
    id: 'reels',
    path: '/reels',
    label: 'Reels',
    module: 'reels',
    layout: 'reels',
    title: 'Reels',
    loadingLabel: 'Chargement des reels…',
    emptyLabel: 'Aucun reel pour le moment.',
    errorLabel: 'Impossible de charger les reels pour le moment.',
    readLabel: 'Voir le reel',
  },
] as const

export const MEDIA_HUB_PATHS = MEDIA_HUBS.map((hub) => hub.path)

const MEDIA_PATH_PATTERN = /^\/(actualites|alertes|play|reels)(?:\/([^/]+))?\/?$/

export function getMediaHubFromPath(pathname: string): MediaHub {
  const match = pathname.match(MEDIA_PATH_PATTERN)
  const segment = match?.[1]
  return MEDIA_HUBS.find((hub) => hub.path === `/${segment}`) ?? MEDIA_HUBS[0]
}

export function parseMediaDetailSlug(pathname: string): string | null {
  const match = pathname.match(MEDIA_PATH_PATTERN)
  return match?.[2] ? decodeURIComponent(match[2]) : null
}

export function isMediaListPath(pathname: string): boolean {
  return MEDIA_HUBS.some((hub) => pathname === hub.path || pathname === `${hub.path}/`)
}

export function isMediaDetailPath(pathname: string): boolean {
  return parseMediaDetailSlug(pathname) !== null
}
