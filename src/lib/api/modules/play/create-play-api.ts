import type { HttpClient } from '../../ports/http-client.port'
import { PLAY_API_PATHS, type PlayApiPaths } from './play.paths'
import type {
  PlayQuizAttemptEnvelopeDto,
  PlayQuizDetailEnvelopeDto,
  PlayQuizSubmitBodyDto,
  PlayQuizSubmitEnvelopeDto,
  PlayQuizzesListEnvelopeDto,
  PlayQuizzesListQuery,
} from './play.types'

export interface PlayApi {
  listQuizzes(params?: PlayQuizzesListQuery): Promise<PlayQuizzesListEnvelopeDto>
  getQuizById(quizId: string): Promise<PlayQuizDetailEnvelopeDto>
  submitQuiz(
    quizId: string,
    body: PlayQuizSubmitBodyDto,
  ): Promise<PlayQuizSubmitEnvelopeDto>
  getAttempt(attemptId: string): Promise<PlayQuizAttemptEnvelopeDto>
}

export function createPlayApi(
  http: HttpClient,
  paths: PlayApiPaths = PLAY_API_PATHS,
): PlayApi {
  return {
    listQuizzes(params) {
      return http.request<PlayQuizzesListEnvelopeDto>({
        method: 'GET',
        path: paths.quizzes,
        query: {
          page: params?.page,
          limit: params?.limit,
          categoryId: params?.categoryId,
        },
      })
    },
    getQuizById(quizId) {
      return http.request<PlayQuizDetailEnvelopeDto>({
        method: 'GET',
        path: paths.quizById(quizId),
      })
    },
    submitQuiz(quizId, body) {
      return http.request<PlayQuizSubmitEnvelopeDto>({
        method: 'POST',
        path: paths.submitQuiz(quizId),
        body,
      })
    },
    getAttempt(attemptId) {
      return http.request<PlayQuizAttemptEnvelopeDto>({
        method: 'GET',
        path: paths.attemptById(attemptId),
      })
    },
  }
}
