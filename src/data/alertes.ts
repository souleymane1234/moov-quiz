/** Données mock historiques — non utilisées (API /api/v1/annonces). */
export type AlerteTypeId =
  | 'bourse'
  | 'emploi'
  | 'stage'
  | 'opportunite'
  | 'investissement'
  | 'autre'

export type AlerteItem = {
  id: string
  slug: string
  type: AlerteTypeId
  title: string
  summary: string
  content: string
  organization: string
  location: string
  deadline: string
  publishedAt: string
  applyUrl?: string
}

export const ALERTES: AlerteItem[] = []
