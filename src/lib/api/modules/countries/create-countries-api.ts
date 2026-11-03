import type { HttpClient } from '../../ports/http-client.port'
import { COUNTRIES_API_PATHS, type CountriesApiPaths } from './countries.paths'
import type { CountriesEnvelopeDto, ListCountriesQuery } from './countries.types'

export interface CountriesApi {
  list(params?: ListCountriesQuery): Promise<CountriesEnvelopeDto>
}

export function createCountriesApi(
  http: HttpClient,
  paths: CountriesApiPaths = COUNTRIES_API_PATHS,
): CountriesApi {
  return {
    list(params) {
      return http.request<CountriesEnvelopeDto>({
        method: 'GET',
        path: paths.collection,
        query: {
          activeOnly: params?.activeOnly,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },
  }
}
