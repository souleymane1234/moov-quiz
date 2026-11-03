export const UPLOADS_API_PATHS = {
  video: '/api/v1/uploads/video',
  image: '/api/v1/uploads/image',
  file: '/api/v1/uploads/file',
} as const

export type UploadsApiPaths = typeof UPLOADS_API_PATHS
