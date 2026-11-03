export interface UploadVideoDataDto {
  id: string
  url?: string | null
  title?: string | null
  status?: string | null
}

export interface UploadImageDataDto {
  id?: string
  url: string
}

export interface UploadFileDataDto {
  id?: string
  url: string
}

export interface UploadVideoEnvelopeDto {
  success: boolean
  message: string
  data: UploadVideoDataDto
}

export interface UploadImageEnvelopeDto {
  success: boolean
  message: string
  data: UploadImageDataDto
}

export interface UploadFileEnvelopeDto {
  success: boolean
  message: string
  data: UploadFileDataDto
}
