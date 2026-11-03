import type { HttpClient } from '../../ports/http-client.port'
import { ANNONCES_API_PATHS, type AnnoncesApiPaths } from './annonces.paths'
import type { AnnoncesListEnvelopeDto, AnnoncesListQuery } from './annonces.types'

export interface AnnoncesApi {
  list(params?: AnnoncesListQuery): Promise<AnnoncesListEnvelopeDto>
}

export function createAnnoncesApi(
  http: HttpClient,
  paths: AnnoncesApiPaths = ANNONCES_API_PATHS,
): AnnoncesApi {
  return {
    list(params) {
      return http.request<AnnoncesListEnvelopeDto>({
        method: 'GET',
        path: paths.collection,
        query: {
          page: params?.page,
          limit: params?.limit,
          typeId: params?.typeId,
        },
      })
    },
  }
}
