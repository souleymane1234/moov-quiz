export interface AnnonceTypeDto {
  id: string
  name: string
}

export interface AnnonceDto {
  id: string
  title: string
  description: string
  place?: string | null
  type: AnnonceTypeDto
  imageUrls?: string[] | null
  documentUrls?: string[] | null
  videoUrls?: string[] | null
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface AnnoncesPaginationDto {
  current_page: number
  total_pages: number
  per_page: number
  total_items: number
}

export interface AnnoncesListQuery {
  page?: number
  limit?: number
  typeId?: string
}

export interface AnnoncesListEnvelopeDto {
  success: boolean
  message: string
  data: AnnonceDto[]
  pagination: AnnoncesPaginationDto
}
