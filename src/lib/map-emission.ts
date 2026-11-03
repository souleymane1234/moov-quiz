import type {
  EditionCandidateDto,
  EditionFullDetailDto,
  EditionJobSheetCategoryGroupDto,
  EditionJobSheetSummaryDto,
  EditionRankingCandidateDto,
  EditionRankingEditionMetaDto,
  EmissionCandidateDetailDto,
  EmissionEditionListItemDto,
} from './api/modules/emission/emission.types'
import type { Candidate, Edition, EditionPrize, EditionSponsor } from '../data/editions'

export function editionYearFromIsoDate(iso: string | null | undefined): number {
  if (!iso?.trim()) return new Date().getFullYear()
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear()
}

export function editionYearFromListItem(item: {
  startDate?: string | null
  createdAt?: string | null
  title: string
}): number {
  if (item.startDate?.trim()) return editionYearFromIsoDate(item.startDate)
  if (item.createdAt?.trim()) return editionYearFromIsoDate(item.createdAt)
  const fromTitle = item.title.match(/\b(20\d{2})\b/)
  if (fromTitle) return Number(fromTitle[1])
  return new Date().getFullYear()
}

function isOpenEditionStatus(status: string): boolean {
  return status === 'OUVERTE' || status === 'EN_COURS'
}

export function isEditionListItemPast(item: {
  status: string
  endDate?: string | null
  isActive: boolean
}): boolean {
  if (item.status === 'CLOTUREE' || item.status === 'TERMINEE') return true
  if (isOpenEditionStatus(item.status)) return false
  if (item.endDate?.trim()) {
    const end = new Date(item.endDate)
    if (!Number.isNaN(end.getTime()) && end < new Date()) return true
  }
  return !item.isActive
}

export function formatEditionDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Dates a confirmer'
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', day: undefined })
  return `${fmt(start)} — ${fmt(end)}`
}

function candidateUserAge(user: { age?: number | null; dateOfBirth?: string | null }): number {
  if (typeof user.age === 'number' && user.age > 0) return Math.floor(user.age)
  if (!user.dateOfBirth) return 0
  const birth = new Date(user.dateOfBirth)
  if (Number.isNaN(birth.getTime())) return 0
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years -= 1
  return Math.max(0, years)
}

function candidateDisplayName(
  c: Pick<EditionCandidateDto, 'user' | 'candidateName' | 'candidatePreName'>,
): string {
  const fromFields = [c.candidatePreName, c.candidateName].filter(Boolean).join(' ').trim()
  if (fromFields) return fromFields
  const full = [c.user?.firstName, c.user?.lastName].filter(Boolean).join(' ').trim()
  return full || c.user?.pseudo || 'Candidat'
}

function isEditionPast(endDate: string, isActive: boolean): boolean {
  const end = new Date(endDate)
  if (!Number.isNaN(end.getTime()) && end < new Date()) return true
  return !isActive
}

function mapSponsors(sponsors: EditionFullDetailDto['sponsors']): EditionSponsor[] {
  const tiers: EditionSponsor['tier'][] = ['principal', 'or', 'argent', 'bronze']
  return (sponsors ?? []).map((s, index) => ({
    name: s.name,
    logoSrc: s.logoUrl || '/trustCaroussel/port-9.png',
    tier: tiers[index] ?? 'bronze',
  }))
}

function mapPrizes(lots: EditionFullDetailDto['lots']): EditionPrize[] {
  return (lots ?? []).map((lot) => ({
    title: lot.title,
    description: lot.description,
  }))
}

function mapRulesSummary(gameRules: string | null | undefined, principles: string | null | undefined): string[] {
  const chunks = [gameRules, principles]
    .filter((s): s is string => Boolean(s?.trim()))
    .flatMap((s) => s.split(/\n+/).map((line) => line.trim()).filter(Boolean))
  return chunks.length > 0 ? chunks : ['Reglement disponible sur demande.']
}

export function mapRankingCandidateToCandidate(
  c: EditionRankingCandidateDto,
  _rank: number,
  pointsPerVote: number,
): Candidate {
  const votes = c.isFinalist ? c.finalistVotes : c.totalVotes
  const quizPoints = c.quizPoints ?? 0
  return {
    id: c.id,
    name: candidateDisplayName(c),
    username: c.user.pseudo,
    age: candidateUserAge(c.user),
    region: c.countryName ?? c.residenceCountry ?? '—',
    city: c.residenceCountry ?? c.countryName ?? '—',
    photoSrc: c.candidatePicture,
    bio: c.description,
    tradition: c.tag?.name ?? c.category?.name ?? 'Tradition',
    votes,
    points: votes * pointsPerVote + quizPoints,
    quizPoints,
    mentorName: 'Krou',
    mentorSubtitle: 'Dida',
    videoSrc: c.video?.url ?? undefined,
  }
}

export function mapEditionCandidateToCandidate(
  c: EditionCandidateDto,
  rank: number,
  pointsPerVote: number,
): Candidate {
  return mapRankingCandidateToCandidate({ ...c, rank }, rank, pointsPerVote)
}

export type EditionCatalogTab = {
  year: number
  editionId: string
  status: Edition['status']
  title: string
  imageUrl: string | null
}

export type CompetitionMetierTag = {
  id: string
  name: string
  imageUrl?: string | null
  active?: boolean
  sortOrder: number
  candidatesCount?: number
}

export type CompetitionCategoryView = {
  id: string
  name: string
  imageUrl?: string | null
  tags: CompetitionMetierTag[]
}

function isJobSheetCategoryGroup(
  item: EditionJobSheetCategoryGroupDto | EditionJobSheetSummaryDto,
): item is EditionJobSheetCategoryGroupDto {
  return Array.isArray((item as EditionJobSheetCategoryGroupDto).jobSheets)
}

/**
 * Métiers catalogue depuis GET /emission/editions/:id.
 * Accepte la structure groupée (category + jobSheets[]) et l’ancien format plat.
 */
export function buildCompetitionCategoriesFromJobSheets(
  jobSheets: Array<EditionJobSheetCategoryGroupDto | EditionJobSheetSummaryDto>,
): CompetitionCategoryView[] {
  if (jobSheets.length === 0) return []

  if (isJobSheetCategoryGroup(jobSheets[0]!)) {
    const categories: CompetitionCategoryView[] = []
    for (const group of jobSheets as EditionJobSheetCategoryGroupDto[]) {
      const category = group.category
      if (!category?.id) continue
      const tags = (group.jobSheets ?? [])
        .filter((sheet) => Boolean(sheet.id && sheet.title?.trim()))
        .map((sheet, index) => ({
          id: sheet.id,
          name: sheet.title.trim(),
          imageUrl: sheet.imageUrl,
          active: true,
          sortOrder: index,
          candidatesCount: sheet.candidatesCount,
        }))
      if (tags.length === 0) continue
      categories.push({
        id: category.id,
        name: category.name,
        imageUrl: null,
        tags,
      })
    }
    return categories
  }

  const byCategory = new Map<string, CompetitionCategoryView>()
  for (const sheet of jobSheets as EditionJobSheetSummaryDto[]) {
    const category = sheet.category
    if (!category?.id || !sheet.title?.trim()) continue

    let entry = byCategory.get(category.id)
    if (!entry) {
      entry = {
        id: category.id,
        name: category.name,
        imageUrl: null,
        tags: [],
      }
      byCategory.set(category.id, entry)
    }

    entry.tags.push({
      id: sheet.id,
      name: sheet.title.trim(),
      imageUrl: sheet.imageUrl,
      active: true,
      sortOrder: entry.tags.length,
      candidatesCount: sheet.candidatesCount,
    })
  }

  return [...byCategory.values()]
    .map((category) => ({
      ...category,
      tags: category.tags.sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((category) => category.tags.length > 0)
}

export function mapEditionListItemToTab(item: EmissionEditionListItemDto): EditionCatalogTab {
  const past = isEditionListItemPast(item)
  return {
    year: editionYearFromListItem(item),
    editionId: item.id,
    status: past ? 'past' : 'current',
    title: item.title,
    imageUrl: item.imageUrl?.trim() || null,
  }
}

export function mapEditionFullDetailToEdition(
  detail: EditionFullDetailDto,
  ranking: EditionRankingCandidateDto[],
  pointsPerVote: number,
): Edition {
  const year = editionYearFromIsoDate(detail.startDate)
  const past = isEditionPast(detail.endDate, detail.isActive)
  const sortedRanking = [...ranking].sort((a, b) => a.rank - b.rank)
  const candidates =
    sortedRanking.length > 0
      ? sortedRanking.map((c) => mapRankingCandidateToCandidate(c, c.rank, pointsPerVote))
      : [...detail.candidates]
          .sort((a, b) => b.totalVotes - a.totalVotes)
          .map((c, index) => mapEditionCandidateToCandidate(c, index + 1, pointsPerVote))

  const winner = candidates.find((c) =>
    detail.finalists.some((f) => f.id === c.id && f.isFinalist),
  )

  const descriptionText =
    detail.description?.trim() ||
    detail.principles?.trim() ||
    detail.gameRules?.trim() ||
    ''

  return {
    year,
    status: past ? 'past' : 'current',
    title: detail.title,
    theme: detail.principles?.trim() || descriptionText.slice(0, 80) || detail.title,
    tagline: descriptionText || detail.title,
    description: descriptionText,
    coverImageSrc: detail.imageUrl?.trim() || '',
    videoSrc: detail.video?.url ?? '/worldskills.mp4',
    videoPosterSrc: detail.imageUrl?.trim() || '/miss.jpg',
    dates:
      detail.startDate?.trim() && detail.endDate?.trim()
        ? formatEditionDateRange(detail.startDate, detail.endDate)
        : 'Dates a confirmer',
    location: detail.emissionName,
    candidateCount: candidates.length,
    candidates,
    winnerId: winner?.id,
    prizes: mapPrizes(detail.lots),
    rulesSummary: mapRulesSummary(detail.gameRules, detail.principles),
    rulesDocumentHref: '#contact',
    sponsors: mapSponsors(detail.sponsors),
    highlights: [
      `${candidates.length} candidates`,
      detail.currentStage ? `Phase : ${detail.currentStage}` : 'Edition en cours',
      past ? 'Edition terminee' : 'Vote en ligne ouvert',
    ],
    galleryPhotos: [],
  }
}

export type VoteEditionView = Pick<
  Edition,
  'year' | 'title' | 'theme' | 'tagline' | 'dates' | 'location'
>

export function mapEditionMetaForVotePage(edition: EditionRankingEditionMetaDto): VoteEditionView {
  return {
    year: editionYearFromIsoDate(edition.startDate),
    title: edition.title,
    theme: edition.principles?.trim() || edition.title,
    tagline: edition.principles?.trim() || edition.title,
    dates: formatEditionDateRange(edition.startDate, edition.endDate),
    location: edition.title,
  }
}

export function mapCandidateDetailToCandidate(
  d: EmissionCandidateDetailDto,
  _rank: number,
  pointsPerVote: number,
): Candidate {
  const votes = d.isFinalist ? (d.finalistVotes ?? 0) : d.totalVotes
  const quizPoints = 0
  return {
    id: d.id,
    name: candidateDisplayName({ user: d.user }),
    username: d.user.pseudo,
    age: candidateUserAge(d.user),
    region: d.user.pseudo,
    city: '—',
    photoSrc: d.candidatePicture,
    bio: d.description,
    tradition: d.tag?.name ?? d.category?.name ?? 'Tradition',
    votes,
    points: votes * pointsPerVote + quizPoints,
    quizPoints,
    mentorName: 'Krou',
    mentorSubtitle: 'Dida',
    videoSrc: d.video?.url ?? undefined,
  }
}
