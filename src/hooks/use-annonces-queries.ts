import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import type { AnnonceDto } from '../lib/api/modules/annonces/annonces.types'
import { annoncesApi } from '../services/api-client'

export const ANNONCES_PAGE_SIZE = 20
const ANNONCES_STALE_MS = 5 * 60_000
const ANNONCES_GC_MS = 30 * 60_000
const MAX_DETAIL_LOOKUP_PAGES = 10

export const annoncesQueryKeys = {
  infinite: (typeId?: string) =>
    ['annonces', 'infinite', typeId ?? 'all', ANNONCES_PAGE_SIZE] as const,
  detail: (id: string) => ['annonces', 'detail', id] as const,
}

function shouldRetryAnnonces(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && error.status === 429) return false
  return failureCount < 1
}

const sharedOptions = {
  staleTime: ANNONCES_STALE_MS,
  gcTime: ANNONCES_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: shouldRetryAnnonces,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
} as const

export function useAnnoncesInfinite(typeId?: string) {
  return useInfiniteQuery({
    queryKey: annoncesQueryKeys.infinite(typeId),
    queryFn: ({ pageParam }) =>
      annoncesApi.list({
        page: pageParam,
        limit: ANNONCES_PAGE_SIZE,
        typeId: typeId || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination
      return current_page < total_pages ? current_page + 1 : undefined
    },
    ...sharedOptions,
  })
}

function findAnnonceInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): AnnonceDto | null {
  const entries = queryClient.getQueriesData<{
    pages?: Array<{ data: AnnonceDto[] }>
  }>({ queryKey: ['annonces', 'infinite'] })

  for (const [, data] of entries) {
    const match = data?.pages
      ?.flatMap((page) => page.data)
      .find((item) => item.id === id)
    if (match) return match
  }
  return null
}

async function findAnnonceById(id: string): Promise<AnnonceDto | null> {
  let totalPages = 1
  for (let page = 1; page <= totalPages && page <= MAX_DETAIL_LOOKUP_PAGES; page += 1) {
    const res = await annoncesApi.list({ page, limit: ANNONCES_PAGE_SIZE })
    totalPages = res.pagination.total_pages
    const match = res.data.find((item) => item.id === id)
    if (match) return match
  }
  return null
}

export function useAnnonceDetail(id: string | null) {
  const queryClient = useQueryClient()
  const cached = id ? findAnnonceInCache(queryClient, id) : null

  return useQuery({
    queryKey: id ? annoncesQueryKeys.detail(id) : ['annonces', 'detail', 'none'],
    queryFn: () => findAnnonceById(id as string),
    enabled: Boolean(id),
    initialData: cached ?? undefined,
    ...sharedOptions,
    refetchOnMount: !cached,
    staleTime: 60_000,
  })
}
