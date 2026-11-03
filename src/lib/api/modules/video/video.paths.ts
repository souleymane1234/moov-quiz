export const VIDEO_API_PATHS = {
  videos: '/api/v1/video/videos',
  videoById: (id: string) => `/api/v1/video/videos/${encodeURIComponent(id)}`,
  like: (id: string) => `/api/v1/video/videos/${encodeURIComponent(id)}/like`,
  view: (id: string) => `/api/v1/video/videos/${encodeURIComponent(id)}/view`,
} as const

export type VideoApiPaths = typeof VIDEO_API_PATHS
