import { useQuery } from '@tanstack/react-query'
import type { PartenaireDto } from '../lib/api/modules/partenaires'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import { partenairesApi } from '../services/api-client'

const PARTENAIRES_STALE_MS = 10 * 60_000
const PAGE_LIMIT = 50
const MAX_PAGES = 20

export const partenairesQueryKeys = {
  active: ['partenaires', 'active'] as const,
}

export type PartnerLogo = {
  id: string
  src: string
  alt: string
  href?: string
}

function mapPartenaireToLogo(partner: PartenaireDto): PartnerLogo | null {
  const src = partner.imageUrl?.trim()
  if (!src) return null
  const href = partner.redirectUrl?.trim() || undefined
  return {
    id: partner.id,
    src,
    alt: partner.name?.trim() || 'Partenaire',
    href,
  }
}

/** Charge tous les partenaires actifs (pagination agrégée). */
export async function fetchAllActivePartenaires(): Promise<PartnerLogo[]> {
  const byId = new Map<string, PartenaireDto>()
  let page = 1
  let totalPages = 1

  while (page <= totalPages && page <= MAX_PAGES) {
    const res = await partenairesApi.list({
      isActive: true,
      page,
      limit: PAGE_LIMIT,
    })

    for (const partner of res.data ?? []) {
      if (partner?.id && partner.isActive !== false) {
        byId.set(partner.id, partner)
      }
    }

    totalPages = Math.max(1, res.pagination?.total_pages ?? 1)
    if ((res.data ?? []).length === 0) break
    page += 1
  }

  return [...byId.values()]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(mapPartenaireToLogo)
    .filter((logo): logo is PartnerLogo => Boolean(logo))
}

export function useActivePartenaires() {
  return useQuery({
    queryKey: partenairesQueryKeys.active,
    queryFn: fetchAllActivePartenaires,
    staleTime: PARTENAIRES_STALE_MS,
    retry: (failureCount, error) => {
      if (ApiHttpError.isInstance(error) && error.status === 429) return false
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
  })
}
