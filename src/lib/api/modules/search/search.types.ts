export type SearchModuleType =
  | 'news'
  | 'scholarship'
  | 'foreign_study'
  | 'permutation'
  | 'school'
  | 'orientation'
  | 'video'
  | 'job_sheet'
  | 'questionnaire'
  | 'magazine'
  | 'quiz'
  | 'play'
  | 'emission'
  | 'revision'
  | 'document_request'
  | 'product'
  | 'users'

export interface SearchResultCategoryDto {
  id: string
  name: string
}

export interface SearchResultDto {
  id: string
  contentType: SearchModuleType | string
  title: string
  summary?: string | null
  mainImage?: string | null
  author?: string | null
  publishedAt?: string | null
  slug?: string | null
  views?: number | null
  moduleName?: string | null
  category?: SearchResultCategoryDto | null
  /** Objet complet du module (forme variable selon contentType). */
  resultObject?: Record<string, unknown> | null
}

export interface SearchPaginationDto {
  current_page: number
  total_pages: number
  per_page: number
  total_items: number
}

export interface SearchEnvelopeDto {
  success: boolean
  message: string
  data: SearchResultDto[]
  pagination: SearchPaginationDto
  /** Nombre de résultats par module. */
  stats?: Partial<Record<SearchModuleType | string, number>> | null
}

export interface SearchQuery {
  query: string
  moduleType?: SearchModuleType
  page?: number
  limit?: number
}
