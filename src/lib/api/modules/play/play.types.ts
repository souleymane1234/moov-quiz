export interface PlayQuizCategoryDto {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PlayQuizRewardDto {
  id: string
  quizId: string
  title: string
  description?: string | null
  rewardType: string
  pointsValue?: number | null
  minScore?: number | null
  iconUrl?: string | null
  imageUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface PlayQuizAnswerDto {
  id: string
  label: string
  order: number
}

export type PlayQuestionType = 'QCU' | 'QCM' | 'LIBRE' | string
export type PlayContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | string

export interface PlayQuizQuestionDto {
  id: string
  quizId: string
  title?: string | null
  question: string
  type: PlayQuestionType
  contentType: PlayContentType
  contentUrl?: string | null
  points: number
  order: number
  /** Secondes ; null = pas de limite. */
  timeoutSeconds?: number | null
  answers?: PlayQuizAnswerDto[] | null
}

export interface PlayQuizSummaryDto {
  id: string
  title: string
  description?: string | null
  difficulty: string
  active: boolean
  category?: PlayQuizCategoryDto | null
  categoryId?: string | null
  createdAt: string
  updatedAt: string
  rewards?: PlayQuizRewardDto[] | null
  totalQuestions: number
  hasPlayed?: boolean
}

export interface PlayQuizDetailDto extends PlayQuizSummaryDto {
  questions?: PlayQuizQuestionDto[] | null
}

export interface PlayQuizzesPaginationDto {
  current_page: number
  total_pages: number
  per_page: number
  total_items: number
}

export interface PlayQuizzesListQuery {
  page?: number
  limit?: number
  categoryId?: string
}

export interface PlayQuizzesListEnvelopeDto {
  success: boolean
  message: string
  data: PlayQuizSummaryDto[]
  pagination: PlayQuizzesPaginationDto
}

export interface PlayQuizDetailEnvelopeDto {
  success: boolean
  message: string
  data: PlayQuizDetailDto
}

/** QCU → answerId ; QCM → answerIds ; SAISIE/LIBRE → textAnswer */
export interface PlayQuizSubmitAnswerDto {
  questionId: string
  answerId?: string
  answerIds?: string[]
  textAnswer?: string
}

export interface PlayQuizSubmitBodyDto {
  quizId: string
  answers: PlayQuizSubmitAnswerDto[]
}

export interface PlayUnlockedUserRewardDto {
  id: string
  userId: string
  rewardId: string
  quizAttemptId: string
  obtainedAt: string
  reward?: PlayQuizRewardDto | null
}

export interface PlayQuizSubmitResultDto {
  attemptId: string
  score: number
  totalPoints: number
  percentage: number
  pointsEarned: number
  newTotalPoints?: number | null
  newRank?: number | null
  rewardsUnlocked?: PlayUnlockedUserRewardDto[] | null
  /** Présent selon les versions API (détail par question). */
  answers?: PlayQuizAttemptAnswerDto[] | null
  results?: PlayQuizAttemptAnswerDto[] | null
}

export interface PlayQuizAttemptAnswerDto {
  questionId: string
  isCorrect?: boolean | null
  pointsEarned?: number | null
  answerId?: string | null
  answerIds?: string[] | null
  textAnswer?: string | null
  selectedAnswerIds?: string[] | null
  correctAnswerIds?: string[] | null
  correctAnswerId?: string | null
  correctTextAnswer?: string | null
  correctAnswers?: Array<{ id?: string; label?: string }> | null
  question?: {
    id?: string
    title?: string | null
    question?: string | null
    type?: string | null
    answers?: Array<{
      id: string
      label: string
      isCorrect?: boolean | null
      order?: number
    }> | null
  } | null
}

export interface PlayQuizAttemptDto {
  id?: string
  attemptId?: string
  score?: number
  totalPoints?: number
  percentage?: number
  answers?: PlayQuizAttemptAnswerDto[] | null
  results?: PlayQuizAttemptAnswerDto[] | null
  quizAnswers?: PlayQuizAttemptAnswerDto[] | null
}

export interface PlayQuizAttemptEnvelopeDto {
  success?: boolean
  message?: string
  data: PlayQuizAttemptDto | PlayQuizAttemptAnswerDto[]
}

export interface PlayQuizSubmitEnvelopeDto {
  success: boolean
  message: string
  data: PlayQuizSubmitResultDto
}
