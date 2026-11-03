import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_VOTE_UNIT_PRICE, USE_MOCK_DATA } from '../config/app-config'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import { emissionRequest } from '../lib/emission-request'
import type {
  EditionCandidateDto,
  EditionCandidatesDataDto,
  EditionCandidatesStage,
  EditionExpertDto,
  ListEditionCandidatesQuery,
} from '../lib/api/modules/emission/emission.types'
import {
  mapEditionFullDetailToEdition,
  mapEditionListItemToTab,
  type EditionCatalogTab,
} from '../lib/map-emission'
import {
  pickActiveNestedEdition,
  resolveConfiguredEmissionId,
} from '../lib/resolve-latest-emission'

const EDITION_LIST_PARAMS = { page: 1, limit: 50 } as const
const RANKING_PARAMS = { page: 1, limit: 100 } as const
const EMISSION_LIST_PARAMS = { page: 1, limit: 50, isPublic: true } as const
const EMISSION_STALE_MS = 5 * 60_000
/** Taille de page imposée par l’API GET …/candidates. */
const CANDIDATES_PAGE_LIMIT = 20
const CANDIDATES_MAX_PAGES = 200

function shouldRetryEmission(failureCount: number, error: unknown): boolean {
  if (ApiHttpError.isInstance(error) && error.status === 429) return false
  return failureCount < 1
}

export const emissionQueryKeys = {
  emissionsList: ['emission', 'list', 'public'] as const,
  emission: (id: string) => ['emission', id] as const,
  editions: (id: string) => ['emission', id, 'editions'] as const,
  activeEdition: (id: string) => ['emission', id, 'active-edition'] as const,
  editionDetail: (editionId: string) => ['edition', editionId] as const,
  editionRanking: (editionId: string) => ['edition', editionId, 'ranking'] as const,
  categories: (editionId: string) => ['edition', editionId, 'categories'] as const,
  editionCandidates: (
    editionId: string,
    jobSheetId?: string | null,
    stage?: EditionCandidatesStage | null,
  ) =>
    [
      'edition',
      editionId,
      'candidates',
      'v4-experts',
      jobSheetId ?? 'all',
      stage ?? 'default',
    ] as const,
  candidate: (candidateId: string) => ['candidate', candidateId] as const,
  userParticipation: (userId: string) =>
    ['emission', 'user', userId, 'participation'] as const,
}

function collectCandidatesFromPayload(
  data: EditionCandidatesDataDto | null | undefined,
  into: Map<string, EditionCandidateDto>,
) {
  for (const candidate of data?.candidates ?? []) {
    if (candidate?.id) into.set(candidate.id, candidate)
  }
  // Les regroupements peuvent contenir des candidats hors page courante
  for (const group of data?.candidatesByJobSheet ?? []) {
    for (const candidate of group.candidates ?? []) {
      if (candidate?.id) into.set(candidate.id, candidate)
    }
  }
  for (const group of data?.jobSheetRanking ?? []) {
    for (const candidate of group.candidates ?? []) {
      if (candidate?.id) into.set(candidate.id, candidate)
    }
  }
  for (const group of data?.activitySectorRanking ?? []) {
    for (const candidate of group.candidates ?? []) {
      if (candidate?.id) into.set(candidate.id, candidate)
    }
  }
}

/** Experts liés à une fiche métier (métier exercé ou métiers d’intervention). */
function expertMatchesJobSheet(expert: EditionExpertDto, jobSheetId: string): boolean {
  if (expert.professionJobSheetId === jobSheetId) return true
  return (expert.interventionJobSheetIds ?? []).includes(jobSheetId)
}

export type FetchEditionCandidatesOptions = {
  jobSheetId?: string | null
  stage?: EditionCandidatesStage | null
  status?: string
}

/** Charge toutes les pages de GET …/editions/:id/candidates (limit=20). */
export async function fetchAllEditionCandidates(
  editionId: string,
  options?: FetchEditionCandidatesOptions,
) {
  const byId = new Map<string, EditionCandidateDto>()
  const expertsById = new Map<string, EditionExpertDto>()
  let page = 1
  let totalPages = 1
  let totalItems = 0
  let meta: EditionCandidatesDataDto | null = null

  const jobSheetId = options?.jobSheetId?.trim() || undefined
  const stage = options?.stage ?? undefined
  const status = options?.status

  while (page <= totalPages && page <= CANDIDATES_MAX_PAGES) {
    const query: ListEditionCandidatesQuery = {
      page,
      limit: CANDIDATES_PAGE_LIMIT,
      ...(jobSheetId ? { jobSheetId } : {}),
      ...(stage ? { stage } : {}),
      ...(status ? { status } : {}),
    }
    const res = await emissionRequest.getEditionCandidates(editionId, query)

    const pagination = res.pagination
    if (page === 1) {
      meta = res.data
    }
    // Toujours recalculer depuis la dernière réponse (source de vérité API)
    totalPages = Math.max(
      1,
      pagination?.total_pages ?? totalPages,
      // Si total_items est connu, dériver aussi le nombre de pages
      pagination?.total_items
        ? Math.ceil(pagination.total_items / (pagination.per_page || CANDIDATES_PAGE_LIMIT))
        : 1,
    )
    totalItems = Math.max(totalItems, pagination?.total_items ?? 0)

    const batch = res.data?.candidates ?? []
    collectCandidatesFromPayload(res.data, byId)
    for (const expert of res.data?.experts ?? []) {
      if (expert?.id) expertsById.set(expert.id, expert)
    }

    // Fin anticipée si la page est vide, ou si on a déjà tout récupéré
    if (batch.length === 0) break
    if (totalItems > 0 && byId.size >= totalItems) break

    page += 1
  }

  const candidates = [...byId.values()].sort(
    (a, b) => (b.totalVotes ?? 0) - (a.totalVotes ?? 0),
  )

  const experts = [...expertsById.values()]
    .filter((expert) => !jobSheetId || expertMatchesJobSheet(expert, jobSheetId))
    .sort((a, b) => (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0))

  return {
    candidates,
    allCandidates: candidates,
    experts,
    totalItems: Math.max(totalItems, candidates.length),
    activitySectorRanking: meta?.activitySectorRanking ?? [],
    jobSheetRanking: meta?.jobSheetRanking ?? [],
    candidatesByJobSheet: meta?.candidatesByJobSheet ?? [],
    myCandidateId: meta?.myCandidateId ?? null,
    hasApplied: meta?.hasApplied ?? false,
    applicationStatus: meta?.applicationStatus ?? null,
    isAccepted: meta?.isAccepted ?? false,
  }
}

export type UseEditionCandidatesOptions = FetchEditionCandidatesOptions & {
  enabled?: boolean
}

/** Liste paginée complète des candidats d’une édition (toutes les pages). */
export function useEditionCandidates(
  editionId: string | null | undefined,
  options?: UseEditionCandidatesOptions,
) {
  const jobSheetId = options?.jobSheetId
  const stage = options?.stage
  const enabled = options?.enabled ?? true

  return useQuery({
    queryKey: editionId
      ? emissionQueryKeys.editionCandidates(editionId, jobSheetId, stage)
      : ['edition', 'candidates', 'none'],
    queryFn: () =>
      fetchAllEditionCandidates(editionId as string, {
        jobSheetId,
        stage,
        status: options?.status,
      }),
    enabled: !USE_MOCK_DATA && Boolean(editionId) && enabled,
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })
}

/** Dernière émission publique (ou VITE_EMISSION_ID si défini). */
export function useResolvedEmission() {
  const listQuery = useQuery({
    queryKey: emissionQueryKeys.emissionsList,
    queryFn: () => emissionRequest.list(EMISSION_LIST_PARAMS),
    enabled: !USE_MOCK_DATA,
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const selected = listQuery.data?.data
    ? resolveConfiguredEmissionId(listQuery.data.data)
    : null

  const nestedEdition = useMemo(
    () => pickActiveNestedEdition(selected?.editions),
    [selected?.editions],
  )

  const detailQuery = useQuery({
    queryKey: selected ? emissionQueryKeys.emission(selected.id) : ['emission', 'none'],
    queryFn: () => emissionRequest.getById(selected!.id),
    enabled: !USE_MOCK_DATA && Boolean(selected?.id),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const pointsPerVote =
    detailQuery.data?.data.pointsPerVote ??
    selected?.pointsPerVote ??
    DEFAULT_VOTE_UNIT_PRICE

  /** Prix FCFA d’un vote : priorité au champ édition voteAmountPerVote. */
  const voteAmountPerVote =
    nestedEdition?.voteAmountPerVote ??
    pointsPerVote ??
    DEFAULT_VOTE_UNIT_PRICE

  const emissionDescription =
    detailQuery.data?.data.description?.trim() ||
    selected?.description?.trim() ||
    ''

  return {
    emission: selected,
    nestedEdition,
    emissionDescription,
    pointsPerVote,
    voteAmountPerVote,
    isLoading: listQuery.isLoading || (Boolean(selected) && detailQuery.isLoading),
    isError: listQuery.isError || detailQuery.isError,
    error: listQuery.error ?? detailQuery.error,
  }
}

/**
 * Édition active : résumé issu de GET /emission[].editions,
 * enrichi par GET /emission/editions/{id} quand disponible.
 */
export function useActiveEdition() {
  const resolved = useResolvedEmission()
  const { emission, nestedEdition } = resolved
  const editionId = nestedEdition?.id ?? null

  const detailQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionDetail(editionId) : ['edition', 'active-none'],
    queryFn: async () => {
      const res = await emissionRequest.getEditionById(editionId as string)
      return res.data
    },
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const data = detailQuery.data ?? nestedEdition ?? null

  /** True tant que l’émission / le détail d’édition ne sont pas prêts. */
  const isBootstrapping =
    !USE_MOCK_DATA &&
    (resolved.isLoading ||
      (Boolean(editionId) && !detailQuery.data && (detailQuery.isPending || detailQuery.isFetching)))

  return {
    ...detailQuery,
    data,
    /** Détail complet GET /emission/editions/:id (jobSheets, etc.). */
    editionDetail: detailQuery.data ?? null,
    editionDetailLoading: detailQuery.isLoading || isBootstrapping,
    isBootstrapping,
    nestedEdition,
    emission,
    isLoading:
      isBootstrapping ||
      (Boolean(emission) && !nestedEdition
        ? false
        : detailQuery.isLoading && !nestedEdition),
    isPending: isBootstrapping || (detailQuery.isPending && !nestedEdition),
  }
}

/** @deprecated Prefer useActiveEdition().data?.id */
export function useActiveEditionId() {
  const query = useActiveEdition()
  return {
    ...query,
    data: query.data?.id ?? null,
  }
}

/** Catégories + tags (métiers) autorisés pour une édition. */
export function useEmissionCategories(editionId: string | null) {
  return useQuery({
    queryKey: editionId
      ? emissionQueryKeys.categories(editionId)
      : ['edition', 'categories', 'none'],
    queryFn: async () => {
      const res = await emissionRequest.listCategories({
        editionId: editionId as string,
        page: 1,
        limit: 100,
      })
      return [...res.data].sort((a, b) => a.sortOrder - b.sortOrder).map((category) => ({
        ...category,
        tags: [...category.tags]
          .filter((tag) => tag.active)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
    },
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })
}

export function useEmissionEditionsCatalog(emissionId: string | null) {
  return useQuery({
    queryKey: emissionId ? emissionQueryKeys.editions(emissionId) : ['emission', 'editions', 'none'],
    queryFn: async (): Promise<EditionCatalogTab[]> => {
      const res = await emissionRequest.listEditions(emissionId as string, EDITION_LIST_PARAMS)
      return res.data.map(mapEditionListItemToTab).sort((a, b) => b.year - a.year)
    },
    enabled: !USE_MOCK_DATA && Boolean(emissionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })
}

export function useEditionFromApi(editionId: string | null, pointsPerVote: number) {
  const detailQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionDetail(editionId) : ['edition', 'none'],
    queryFn: async () => {
      const res = await emissionRequest.getEditionById(editionId as string)
      return res.data
    },
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const rankingQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionRanking(editionId) : ['edition', 'ranking', 'none'],
    queryFn: () => emissionRequest.getEditionRanking(editionId as string, RANKING_PARAMS),
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: EMISSION_STALE_MS,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const isLoading = detailQuery.isLoading || rankingQuery.isLoading
  const isError = detailQuery.isError || rankingQuery.isError
  const error = detailQuery.error ?? rankingQuery.error

  const voteUnit = detailQuery.data?.voteAmountPerVote ?? pointsPerVote

  const edition =
    detailQuery.data && editionId
      ? mapEditionFullDetailToEdition(
          detailQuery.data,
          rankingQuery.data?.data ?? [],
          voteUnit,
        )
      : null

  return { edition, isLoading, isError, error, refetch: detailQuery.refetch }
}

export function useCandidateFromApi(candidateId: string | null, pointsPerVote: number) {
  const candidateQuery = useQuery({
    queryKey: candidateId ? emissionQueryKeys.candidate(candidateId) : ['candidate', 'none'],
    queryFn: () => emissionRequest.getCandidateById(candidateId as string),
    enabled: !USE_MOCK_DATA && Boolean(candidateId),
    staleTime: 30_000,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const editionId = candidateQuery.data?.data.editionId ?? null

  const rankingQuery = useQuery({
    queryKey: editionId ? emissionQueryKeys.editionRanking(editionId) : ['edition', 'ranking', 'none'],
    queryFn: () => emissionRequest.getEditionRanking(editionId as string, RANKING_PARAMS),
    enabled: !USE_MOCK_DATA && Boolean(editionId),
    staleTime: 30_000,
    retry: shouldRetryEmission,
    refetchOnWindowFocus: false,
  })

  const candidateDto = candidateQuery.data?.data
  const rank = rankingQuery.data?.data.find((row) => row.id === candidateId)?.rank ?? 0

  return {
    candidateDto,
    editionMeta: candidateDto?.edition ?? null,
    rank: rank > 0 ? rank : 0,
    isLoading: candidateQuery.isLoading,
    isError: candidateQuery.isError,
    error: candidateQuery.error,
    pointsPerVote,
  }
}
