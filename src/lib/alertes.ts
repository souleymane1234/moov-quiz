import type { AnnonceDto, AnnonceTypeDto } from './api/modules/annonces/annonces.types'

export type AlerteTone = 'orange' | 'green' | 'blue' | 'gold' | 'navy' | 'muted'

const TONE_BY_NAME: Record<string, AlerteTone> = {
  BOURSE: 'orange',
  EMPLOI: 'green',
  STAGE: 'blue',
  OPPORTUNITE: 'gold',
  OPPORTUNITÉ: 'gold',
  INVESTISSEMENT: 'navy',
  INSCRIPTION: 'green',
  EVENEMENT: 'blue',
  ÉVÉNEMENT: 'blue',
  APPEL: 'gold',
  AUTRE: 'muted',
}

export function formatAnnonceTypeLabel(name: string): string {
  const normalized = name.trim()
  if (!normalized) return 'Autre'
  return normalized
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getAnnonceTypeTone(name: string): AlerteTone {
  const key = name.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return TONE_BY_NAME[key] ?? TONE_BY_NAME[name.trim().toUpperCase()] ?? 'muted'
}

export function alerteDetailPath(id: string): string {
  return `/alertes/${encodeURIComponent(id)}`
}

export function formatAlerteDate(iso: string | null | undefined): string {
  if (!iso) return 'Sans date limite'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getDeadlineStatus(
  endDate: string | null | undefined,
): 'open' | 'soon' | 'closed' {
  if (!endDate) return 'open'
  const end = new Date(endDate)
  if (Number.isNaN(end.getTime())) return 'open'
  const now = Date.now()
  if (end.getTime() < now) return 'closed'
  const diffDays = (end.getTime() - now) / 86_400_000
  if (diffDays <= 7) return 'soon'
  return 'open'
}

export function isRecentAlerte(createdAt: string | null | undefined, days = 7): boolean {
  if (!createdAt) return false
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() <= days * 86_400_000
}

export function extractAnnonceTypes(items: AnnonceDto[]): AnnonceTypeDto[] {
  const map = new Map<string, AnnonceTypeDto>()
  for (const item of items) {
    if (!item.type?.id) continue
    if (!map.has(item.type.id)) {
      map.set(item.type.id, item.type)
    }
  }
  return [...map.values()].sort((a, b) =>
    formatAnnonceTypeLabel(a.name).localeCompare(formatAnnonceTypeLabel(b.name), 'fr'),
  )
}

export function mergeAnnonceTypes(
  current: AnnonceTypeDto[],
  incoming: AnnonceTypeDto[],
): AnnonceTypeDto[] {
  const map = new Map<string, AnnonceTypeDto>()
  for (const type of [...current, ...incoming]) {
    if (!type?.id) continue
    map.set(type.id, type)
  }
  return [...map.values()].sort((a, b) =>
    formatAnnonceTypeLabel(a.name).localeCompare(formatAnnonceTypeLabel(b.name), 'fr'),
  )
}
