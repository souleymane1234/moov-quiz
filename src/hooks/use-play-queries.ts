import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import type {
  PlayQuizDetailDto,
  PlayQuizSubmitBodyDto,
} from '../lib/api/modules/play/play.types'
import { playApi } from '../services/api-client'

export const PLAY_QUIZZES_PAGE_SIZE = 10
const PLAY_STALE_MS = 5 * 60_000
const PLAY_GC_MS = 30 * 60_000

export const playQueryKeys = {
  infinite: (categoryId?: string) =>
    ['play', 'quizzes', 'infinite', categoryId ?? 'all', PLAY_QUIZZES_PAGE_SIZE] as const,
  detail: (id: string) => ['play', 'quizzes', 'detail', id] as const,
  allInfinite: ['play', 'quizzes', 'infinite'] as const,
}

function shouldRetryPlay(failureCount: number, error: unknown): boolean {
  if (
    ApiHttpError.isInstance(error) &&
    (error.status === 429 || error.status === 401 || error.status === 403)
  ) {
    return false
  }
  return failureCount < 1
}

const sharedOptions = {
  staleTime: PLAY_STALE_MS,
  gcTime: PLAY_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: shouldRetryPlay,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
} as const

export function usePlayQuizzesInfinite(
  categoryId?: string,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: playQueryKeys.infinite(categoryId),
    queryFn: ({ pageParam }) =>
      playApi.listQuizzes({
        page: pageParam,
        limit: PLAY_QUIZZES_PAGE_SIZE,
        categoryId: categoryId || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, total_pages } = lastPage.pagination
      return current_page < total_pages ? current_page + 1 : undefined
    },
    ...sharedOptions,
    enabled: options?.enabled ?? true,
  })
}

export function usePlayQuizDetail(
  id: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: id ? playQueryKeys.detail(id) : ['play', 'quizzes', 'detail', 'none'],
    queryFn: async (): Promise<PlayQuizDetailDto> => {
      const res = await playApi.getQuizById(id as string)
      return res.data
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...sharedOptions,
    staleTime: 60_000,
  })
}

export function usePlayQuizSubmit(quizId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: PlayQuizSubmitBodyDto) => {
      if (!quizId) throw new Error('Quiz ID manquant')
      return playApi.submitQuiz(quizId, body)
    },
    onSuccess: () => {
      if (!quizId) return
      void queryClient.invalidateQueries({ queryKey: playQueryKeys.detail(quizId) })
      void queryClient.invalidateQueries({ queryKey: playQueryKeys.allInfinite })
    },
  })
}
