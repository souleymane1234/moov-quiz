export type VideoSourceType = 'UPLOAD' | 'YOUTUBE' | 'VIMEO' | 'AUTRE' | string
export type VideoStatus = 'EN_LIGNE' | 'HORS_LIGNE' | 'EN_ATTENTE' | string

export interface VideoCategoryDto {
  id: string
  name: string
  description?: string | null
}

export interface VideoListItemDto {
  id: string
  title: string
  url: string
  sourceType: VideoSourceType
  category?: VideoCategoryDto | null
  premiumRequired: boolean
  status: VideoStatus
  createdAt: string
  duration?: number | null
  description?: string | null
  tags?: string[] | null
  views: number
  thumbnailUrl?: string | null
  isLiked?: boolean
  isFavorite?: boolean
  isViewed?: boolean
  likesCount?: number
  commentsCount?: number
}

export interface VideosPaginationDto {
  current_page: number
  total_pages: number
  per_page: number
  total_items: number
}

export interface VideosListQuery {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  premiumOnly?: boolean
  sortBy?: 'createdAt' | 'views' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface VideosListEnvelopeDto {
  success: boolean
  message: string
  data: VideoListItemDto[]
  pagination: VideosPaginationDto
}
