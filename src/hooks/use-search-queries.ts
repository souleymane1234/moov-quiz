import { useEffect, useState } from 'react'
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import type { SearchModuleType } from '../lib/api/modules/search/search.types'
import { SEARCH_MIN_CHARS } from '../lib/search'
import { searchApi } from '../services/api-client'

const SUGGESTIONS_LIMIT = 8
export const SEARCH_PAGE_SIZE = 20

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && [400, 401, 403, 429].includes(error.status)) {
    return false
  }
  return failureCount < 1
}

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

export const searchQueryKeys = {
  suggestions: (query: string) => ['search', 'suggestions', query] as const,
  results: (query: string, moduleType: SearchModuleType | null) =>
    ['search', 'results', query, moduleType ?? 'all'] as const,
}

/** Aperçu rapide pendant la saisie (liste déroulante). */
export function useSearchSuggestions(rawQuery: string) {
  const query = rawQuery.trim()
  return useQuery({
    queryKey: searchQueryKeys.suggestions(query.toLowerCase()),
    queryFn: ({ signal }) =>
      searchApi.search({ query, page: 1, limit: SUGGESTIONS_LIMIT }, signal),
    enabled: query.length >= SEARCH_MIN_CHARS,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: shouldRetry,
    refetchOnWindowFocus: false,
  })
}

/** Résultats complets paginés (page /recherche). */
export function useSearchResults(rawQuery: string, moduleType: SearchModuleType | null) {
  const query = rawQuery.trim()
  return useInfiniteQuery({
    queryKey: searchQueryKeys.results(query.toLowerCase(), moduleType),
    queryFn: ({ pageParam, signal }) =>
      searchApi.search(
        {
          query,
          moduleType: moduleType ?? undefined,
          page: pageParam,
          limit: SEARCH_PAGE_SIZE,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const p = last.pagination
      if (!p) return undefined
      return p.current_page < p.total_pages ? p.current_page + 1 : undefined
    },
    enabled: query.length >= SEARCH_MIN_CHARS,
    staleTime: 60_000,
    retry: shouldRetry,
    refetchOnWindowFocus: false,
  })
}
