import type { HttpClient } from '../../ports/http-client.port'
import { SEARCH_API_PATHS, type SearchApiPaths } from './search.paths'
import type { SearchEnvelopeDto, SearchQuery } from './search.types'

export interface SearchApi {
  search(params: SearchQuery, signal?: AbortSignal): Promise<SearchEnvelopeDto>
}

export function createSearchApi(
  http: HttpClient,
  paths: SearchApiPaths = SEARCH_API_PATHS,
): SearchApi {
  return {
    search(params, signal) {
      return http.request<SearchEnvelopeDto>({
        method: 'GET',
        path: paths.search,
        query: {
          query: params.query,
          moduleType: params.moduleType,
          page: params.page,
          limit: params.limit,
        },
        signal,
      })
    },
  }
}
