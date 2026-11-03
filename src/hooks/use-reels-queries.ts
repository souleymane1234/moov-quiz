import { useInfiniteQuery } from '@tanstack/react-query'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import { videoApi } from '../services/api-client'

export const REELS_PAGE_SIZE = 10
const REELS_STALE_MS = 5 * 60_000
const REELS_GC_MS = 30 * 60_000

export const reelsQueryKeys = {
  infinite: ['video', 'reels', 'infinite', REELS_PAGE_SIZE] as const,
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (
    ApiHttpError.isInstance(error) &&
    (error.status === 429 || error.status === 401 || error.status === 403)
  ) {
    return false
  }
  return failureCount < 1
}

function getNextPage(
  lastPage: {
    pagination?: {
      current_page?: number
      total_pages?: number
      currentPage?: number
      totalPages?: number
    }
  },
): number | undefined {
  const pagination = lastPage.pagination
  if (!pagination) return undefined
  const current =
    pagination.current_page ?? pagination.currentPage ?? 1
  const total = pagination.total_pages ?? pagination.totalPages ?? 1
  return current < total ? current + 1 : undefined
}

export function useReelsInfinite(options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: reelsQueryKeys.infinite,
    queryFn: ({ pageParam }) =>
      videoApi.listVideos({
        page: pageParam,
        limit: REELS_PAGE_SIZE,
        sortBy: 'views',
        sortOrder: 'desc',
      }),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
    staleTime: REELS_STALE_MS,
    gcTime: REELS_GC_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: shouldRetry,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    enabled: options?.enabled ?? true,
  })
}
