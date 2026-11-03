import type { HttpClient } from '../../ports/http-client.port'
import { VIDEO_API_PATHS, type VideoApiPaths } from './video.paths'
import type { VideosListEnvelopeDto, VideosListQuery } from './video.types'

export interface VideoApi {
  listVideos(params?: VideosListQuery): Promise<VideosListEnvelopeDto>
  markViewed(videoId: string): Promise<unknown>
}

export function createVideoApi(
  http: HttpClient,
  paths: VideoApiPaths = VIDEO_API_PATHS,
): VideoApi {
  return {
    listVideos(params) {
      return http.request<VideosListEnvelopeDto>({
        method: 'GET',
        path: paths.videos,
        query: {
          page: params?.page,
          limit: params?.limit,
          categoryId: params?.categoryId,
          search: params?.search,
          premiumOnly: params?.premiumOnly,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      })
    },
    markViewed(videoId) {
      return http.request({
        method: 'POST',
        path: paths.view(videoId),
        body: {},
      })
    },
  }
}
