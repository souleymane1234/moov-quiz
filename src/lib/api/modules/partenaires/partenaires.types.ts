import type { ApiPaginationDto } from '../emission/emission.types'

export interface PartenaireDto {
  id: string
  name: string
  description?: string | null
  imageUrl: string
  redirectUrl?: string | null
  isActive: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export interface ListPartenairesQuery {
  isActive?: boolean
  page?: number
  limit?: number
}

export interface PartenairesEnvelopeDto {
  success: boolean
  message: string
  data: PartenaireDto[]
  pagination: ApiPaginationDto
}
