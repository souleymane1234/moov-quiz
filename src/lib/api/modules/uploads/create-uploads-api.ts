import type { HttpClient } from '../../ports/http-client.port'
import { UPLOADS_API_PATHS, type UploadsApiPaths } from './uploads.paths'
import type {
  UploadFileEnvelopeDto,
  UploadImageEnvelopeDto,
  UploadVideoEnvelopeDto,
} from './uploads.types'

export interface UploadsApi {
  uploadVideo(file: File): Promise<UploadVideoEnvelopeDto>
  uploadImage(file: File): Promise<UploadImageEnvelopeDto>
  uploadFile(file: File): Promise<UploadFileEnvelopeDto>
}

export function createUploadsApi(
  http: HttpClient,
  paths: UploadsApiPaths = UPLOADS_API_PATHS,
): UploadsApi {
  return {
    uploadVideo(file) {
      const body = new FormData()
      body.append('file', file)
      return http.request<UploadVideoEnvelopeDto>({
        method: 'POST',
        path: paths.video,
        body,
      })
    },
    uploadImage(file) {
      const body = new FormData()
      body.append('file', file)
      return http.request<UploadImageEnvelopeDto>({
        method: 'POST',
        path: paths.image,
        body,
      })
    },
    uploadFile(file) {
      const body = new FormData()
      body.append('file', file)
      return http.request<UploadFileEnvelopeDto>({
        method: 'POST',
        path: paths.file,
        body,
      })
    },
  }
}
