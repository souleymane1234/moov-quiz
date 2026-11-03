import type { HttpClient } from '../../ports/http-client.port'
import {
  PARTENAIRES_API_PATHS,
  type PartenairesApiPaths,
} from './partenaires.paths'
import type {
  ListPartenairesQuery,
  PartenairesEnvelopeDto,
} from './partenaires.types'

export interface PartenairesApi {
  list(params?: ListPartenairesQuery): Promise<PartenairesEnvelopeDto>
}

export function createPartenairesApi(
  http: HttpClient,
  paths: PartenairesApiPaths = PARTENAIRES_API_PATHS,
): PartenairesApi {
  return {
    list(params) {
      return http.request<PartenairesEnvelopeDto>({
        method: 'GET',
        path: paths.collection,
        query: {
          isActive: params?.isActive,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },
  }
}
