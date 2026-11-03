import type { EmissionNestedEditionDto } from './api/modules/emission/emission.types'
import type { EmissionListItemDto } from './api/modules/emission/emission.types'
import { EMISSION_ID } from '../config/app-config'

function emissionTimestamp(item: EmissionListItemDto): number {
  const raw = item.updatedAt || item.createdAt
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Choisit l'émission publique la plus récente (priorité WorldSkills Côte d'Ivoire / olympiades des métiers). */
export function pickLatestPublicEmission(items: EmissionListItemDto[]): EmissionListItemDto | null {
  const publicItems = items.filter((e) => e.isPublic)
  if (publicItems.length === 0) return null

  const withEditions = publicItems.filter((e) => e.editions.length > 0)
  const worldSkills = (withEditions.length > 0 ? withEditions : publicItems).filter((e) =>
    /world\s*skills|olympiades?\s*des\s*m[eé]tiers/i.test(e.title),
  )
  const pool = worldSkills.length > 0 ? worldSkills : withEditions.length > 0 ? withEditions : publicItems

  return [...pool].sort((a, b) => emissionTimestamp(b) - emissionTimestamp(a))[0] ?? null
}

export function resolveConfiguredEmissionId(
  items: EmissionListItemDto[],
): EmissionListItemDto | null {
  if (EMISSION_ID) {
    const forced = items.find((e) => e.id === EMISSION_ID)
    if (forced) return forced
  }
  return pickLatestPublicEmission(items)
}

/**
 * Édition « courante » depuis data[].editions de GET /emission.
 * Préfère EN_COURS / publique, sinon la première du résumé.
 */
export function pickActiveNestedEdition(
  editions: EmissionNestedEditionDto[] | null | undefined,
): EmissionNestedEditionDto | null {
  if (!editions?.length) return null
  const publicOnes = editions.filter((e) => e.isPublic !== false)
  const pool = publicOnes.length > 0 ? publicOnes : editions
  return (
    pool.find((e) => e.status === 'EN_COURS') ??
    pool.find((e) => e.status === 'OUVERTE') ??
    pool[0] ??
    null
  )
}
