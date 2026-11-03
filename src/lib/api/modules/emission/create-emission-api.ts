import type { HttpClient } from '../../ports/http-client.port'
import { EMISSION_API_PATHS, type EmissionApiPaths } from './emission.paths'
import type {
  ActiveEditionEnvelopeDto,
  ApplyAsExpertBodyDto,
  ApplyAsExpertEnvelopeDto,
  ApplyToEditionBodyDto,
  ApplyToEditionEnvelopeDto,
  EditionCandidatesEnvelopeDto,
  EditionFullDetailEnvelopeDto,
  EditionListEnvelopeDto,
  EditionRankingEnvelopeDto,
  EmissionCandidateDetailEnvelopeDto,
  EmissionCategoriesEnvelopeDto,
  EmissionDetailEnvelopeDto,
  EmissionListEnvelopeDto,
  EmissionUserParticipationEnvelopeDto,
  ListEditionCandidatesQuery,
  ListEditionRankingQuery,
  ListEmissionCategoriesQuery,
  ListEmissionEditionsQuery,
  ListEmissionsQuery,
  VoteConfirmBodyDto,
  VoteConfirmEnvelopeDto,
  VoteInitiateBodyDto,
  VoteInitiateEnvelopeDto,
} from './emission.types'

export interface EmissionApi {
  list(params?: ListEmissionsQuery): Promise<EmissionListEnvelopeDto>
  getById(emissionId: string): Promise<EmissionDetailEnvelopeDto>
  listEditions(
    emissionId: string,
    params?: ListEmissionEditionsQuery,
  ): Promise<EditionListEnvelopeDto>
  getActiveEdition(emissionId: string): Promise<ActiveEditionEnvelopeDto>
  getEditionById(editionId: string): Promise<EditionFullDetailEnvelopeDto>
  getEditionRanking(
    editionId: string,
    params?: ListEditionRankingQuery,
  ): Promise<EditionRankingEnvelopeDto>
  getEditionCandidates(
    editionId: string,
    params?: ListEditionCandidatesQuery,
  ): Promise<EditionCandidatesEnvelopeDto>
  listCategories(
    params: ListEmissionCategoriesQuery,
  ): Promise<EmissionCategoriesEnvelopeDto>
  getParticipationOptions(editionId: string): Promise<{ success: boolean; data: Record<string, unknown> }>
  getMyCandidature(editionId: string): Promise<{ success: boolean; data: Record<string, unknown> | null }>
  applyCompetitor(editionId: string, body: Record<string, unknown>): Promise<{ success: boolean; data: Record<string, unknown> }>
  applyToEdition(
    editionId: string,
    body: ApplyToEditionBodyDto,
  ): Promise<ApplyToEditionEnvelopeDto>
  applyAsExpert(
    editionId: string,
    body?: ApplyAsExpertBodyDto,
  ): Promise<ApplyAsExpertEnvelopeDto>
  getCandidateById(candidateId: string): Promise<EmissionCandidateDetailEnvelopeDto>
  getUserParticipation(userId: string): Promise<EmissionUserParticipationEnvelopeDto>
  initiateCandidateVote(
    candidateId: string,
    body: VoteInitiateBodyDto,
  ): Promise<VoteInitiateEnvelopeDto>
  confirmCandidateVote(
    candidateId: string,
    body: VoteConfirmBodyDto,
  ): Promise<VoteConfirmEnvelopeDto>
}

export function createEmissionApi(
  http: HttpClient,
  paths: EmissionApiPaths = EMISSION_API_PATHS,
): EmissionApi {
  return {
    list(params) {
      return http.request<EmissionListEnvelopeDto>({
        method: 'GET',
        path: paths.collection,
        query: {
          isActive: params?.isActive,
          status: params?.status,
          isPublic: params?.isPublic,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },

    getById(emissionId) {
      return http.request<EmissionDetailEnvelopeDto>({
        method: 'GET',
        path: paths.byId(emissionId),
      })
    },

    listEditions(emissionId, params) {
      return http.request<EditionListEnvelopeDto>({
        method: 'GET',
        path: paths.editions(emissionId),
        query: {
          status: params?.status,
          page: params?.page,
          limit: params?.limit,
        },
      })
    },

    getActiveEdition(emissionId) {
      return http.request<ActiveEditionEnvelopeDto>({
        method: 'GET',
        path: paths.activeEdition(emissionId),
      })
    },

    getEditionById(editionId) {
      return http.request<EditionFullDetailEnvelopeDto>({
        method: 'GET',
        path: paths.editionById(editionId),
      })
    },

    getEditionRanking(editionId, params) {
      return http.request<EditionRankingEnvelopeDto>({
        method: 'GET',
        path: paths.editionRanking(editionId),
        query: {
          page: params?.page,
          limit: params?.limit,
        },
      })
    },

    getEditionCandidates(editionId, params) {
      return http.request<EditionCandidatesEnvelopeDto>({
        method: 'GET',
        path: paths.editionCandidates(editionId),
        query: {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
          jobSheetId: params?.jobSheetId,
          stage: params?.stage,
        },
      })
    },

    listCategories(params) {
      return http.request<EmissionCategoriesEnvelopeDto>({
        method: 'GET',
        path: paths.categories(),
        query: {
          editionId: params.editionId,
          page: params.page,
          limit: params.limit,
        },
      })
    },

    getParticipationOptions(editionId) {
      return http.request<{ success: boolean; data: Record<string, unknown> }>({
        method: 'GET',
        path: paths.editionParticipationOptions(editionId),
      })
    },

    getMyCandidature(editionId) {
      return http.request<{ success: boolean; data: Record<string, unknown> | null }>({
        method: 'GET',
        path: paths.editionMyCandidature(editionId),
      })
    },

    applyCompetitor(editionId, body) {
      return http.request<{ success: boolean; data: Record<string, unknown> }>({
        method: 'POST',
        path: paths.editionApplyCompetitor(editionId),
        body,
      })
    },

    applyToEdition(editionId, body) {
      return http.request<ApplyToEditionEnvelopeDto>({
        method: 'POST',
        path: paths.editionApply(editionId),
        body,
      })
    },

    applyAsExpert(editionId, body = {}) {
      return http.request<ApplyAsExpertEnvelopeDto>({
        method: 'POST',
        path: paths.editionApplyExpert(editionId),
        body,
      })
    },

    getCandidateById(candidateId) {
      return http.request<EmissionCandidateDetailEnvelopeDto>({
        method: 'GET',
        path: paths.candidateById(candidateId),
      })
    },

    getUserParticipation(userId) {
      return http.request<EmissionUserParticipationEnvelopeDto>({
        method: 'GET',
        path: paths.userParticipation(userId),
      })
    },

    initiateCandidateVote(candidateId, body) {
      return http.request<VoteInitiateEnvelopeDto>({
        method: 'POST',
        path: paths.candidateVoteInitiate(candidateId),
        body,
      })
    },

    confirmCandidateVote(candidateId, body) {
      return http.request<VoteConfirmEnvelopeDto>({
        method: 'POST',
        path: paths.candidateVoteConfirm(candidateId),
        body,
      })
    },
  }
}
