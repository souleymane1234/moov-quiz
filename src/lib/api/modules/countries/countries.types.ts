export interface CountryDto {
  id: string
  /** Code ISO pays ; `null` pour un établissement. */
  code: string | null
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CountriesEnvelopeDto {
  success: boolean
  message: string
  data: CountryDto[]
  pagination?: {
    current_page: number
    total_pages: number
    per_page: number
    total_items: number
  }
}

export interface ListCountriesQuery {
  /** Uniquement les entrées actives (défaut API : true). */
  activeOnly?: boolean
  page?: number
  limit?: number
}
