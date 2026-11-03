export const PLAY_API_PATHS = {
  quizzes: '/api/v1/play/quizzes',
  quizById: (quizId: string) =>
    `/api/v1/play/quizzes/${encodeURIComponent(quizId)}`,
  submitQuiz: (quizId: string) =>
    `/api/v1/play/quizzes/${encodeURIComponent(quizId)}/submit`,
  attemptById: (attemptId: string) =>
    `/api/v1/quiz/attempts/${encodeURIComponent(attemptId)}`,
} as const

export type PlayApiPaths = typeof PLAY_API_PATHS
