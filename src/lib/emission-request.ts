import type {
  ApplyAsExpertBodyDto,
  ApplyToEditionBodyDto,
  ListEditionCandidatesQuery,
  ListEditionRankingQuery,
  ListEmissionCategoriesQuery,
  ListEmissionEditionsQuery,
  ListEmissionsQuery,
} from './api/modules/emission/emission.types'
import { emissionApi } from '../services/api-client'

const MIN_INTERVAL_MS = 450

let requestChain: Promise<unknown> = Promise.resolve()
let lastRequestAt = 0

function waitForSlot(): Promise<void> {
  const delay = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt))
  if (delay === 0) return Promise.resolve()
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay)
  })
}

function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = async () => {
    await waitForSlot()
    lastRequestAt = Date.now()
    return task()
  }
  const result = requestChain.then(run, run)
  requestChain = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

export const emissionRequest = {
  list(params?: ListEmissionsQuery) {
    return throttled(() => emissionApi.list(params))
  },
  getById(emissionId: string) {
    return throttled(() => emissionApi.getById(emissionId))
  },
  listEditions(emissionId: string, params?: ListEmissionEditionsQuery) {
    return throttled(() => emissionApi.listEditions(emissionId, params))
  },
  getActiveEdition(emissionId: string) {
    return throttled(() => emissionApi.getActiveEdition(emissionId))
  },
  getEditionById(editionId: string) {
    return throttled(() => emissionApi.getEditionById(editionId))
  },
  getEditionRanking(editionId: string, params?: ListEditionRankingQuery) {
    return throttled(() => emissionApi.getEditionRanking(editionId, params))
  },
  getEditionCandidates(editionId: string, params?: ListEditionCandidatesQuery) {
    return throttled(() => emissionApi.getEditionCandidates(editionId, params))
  },
  listCategories(params: ListEmissionCategoriesQuery) {
    return throttled(() => emissionApi.listCategories(params))
  },
  getParticipationOptions(editionId: string) {
    return throttled(() => emissionApi.getParticipationOptions(editionId))
  },
  getMyCandidature(editionId: string) {
    return throttled(() => emissionApi.getMyCandidature(editionId))
  },
  applyCompetitor(editionId: string, body: Record<string, unknown>) {
    return throttled(() => emissionApi.applyCompetitor(editionId, body))
  },
  applyToEdition(editionId: string, body: ApplyToEditionBodyDto) {
    return throttled(() => emissionApi.applyToEdition(editionId, body))
  },
  applyAsExpert(editionId: string, body?: ApplyAsExpertBodyDto) {
    return throttled(() => emissionApi.applyAsExpert(editionId, body))
  },
  getCandidateById(candidateId: string) {
    return throttled(() => emissionApi.getCandidateById(candidateId))
  },
  getUserParticipation(userId: string) {
    return throttled(() => emissionApi.getUserParticipation(userId))
  },
  initiateCandidateVote(
    candidateId: string,
    body: Parameters<typeof emissionApi.initiateCandidateVote>[1],
  ) {
    return throttled(() => emissionApi.initiateCandidateVote(candidateId, body))
  },
  confirmCandidateVote(
    candidateId: string,
    body: Parameters<typeof emissionApi.confirmCandidateVote>[1],
  ) {
    return throttled(() => emissionApi.confirmCandidateVote(candidateId, body))
  },
}
