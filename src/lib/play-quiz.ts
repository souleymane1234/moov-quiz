import type {
  PlayContentType,
  PlayQuestionType,
  PlayQuizAttemptAnswerDto,
  PlayQuizAttemptDto,
  PlayQuizAttemptEnvelopeDto,
  PlayQuizCategoryDto,
  PlayQuizQuestionDto,
  PlayQuizSubmitAnswerDto,
  PlayQuizSubmitResultDto,
  PlayQuizSummaryDto,
} from './api/modules/play/play.types'

export type PlayTone = 'orange' | 'green' | 'blue' | 'gold' | 'navy' | 'muted'

export type PlayAnswerState = {
  selectedIds: string[]
  freeText: string
}

export type PlayRecapItem = {
  questionId: string
  title: string
  question: string
  userAnswerLabel: string
  correctAnswerLabel: string | null
  isCorrect: boolean | null
}

const TONES: PlayTone[] = ['orange', 'green', 'blue', 'gold', 'navy', 'muted']

export function playQuizPath(id: string): string {
  return `/play/${encodeURIComponent(id)}`
}

export function formatPlayDifficulty(value: string | null | undefined): string {
  const key = value?.trim().toUpperCase() ?? ''
  if (key === 'FACILE' || key === 'EASY') return 'Facile'
  if (key === 'DIFFICILE' || key === 'HARD') return 'Difficile'
  if (key === 'MOYEN' || key === 'MEDIUM') return 'Moyen'
  if (!value) return 'Moyen'
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function formatPlayAnswerMode(type: PlayQuestionType | null | undefined): string {
  const key = type?.trim().toUpperCase() ?? ''
  if (key === 'QCM') return 'QCM'
  if (key === 'QCU') return 'QCU'
  if (key === 'LIBRE' || key === 'SAISIE' || key === 'FREE' || key === 'TEXT') {
    return 'Saisie libre'
  }
  return type?.trim() || 'Réponse'
}

export function formatPlayContentType(
  contentType: PlayContentType | null | undefined,
): string {
  const key = contentType?.trim().toUpperCase() ?? ''
  if (key === 'IMAGE') return 'Image'
  if (key === 'VIDEO') return 'Vidéo'
  return 'Texte'
}

export function formatPlayDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes === 0) return `${rest} s`
  if (rest === 0) return `${minutes} min`
  return `${minutes} min ${rest} s`
}

export function formatPlayClock(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function sortPlayQuestions(
  questions: PlayQuizQuestionDto[] | null | undefined,
): PlayQuizQuestionDto[] {
  if (!questions?.length) return []
  return [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function sortPlayAnswers(
  question: PlayQuizQuestionDto,
): NonNullable<PlayQuizQuestionDto['answers']> {
  const answers = question.answers ?? []
  return [...answers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function isPlayMultiChoice(type: PlayQuestionType | null | undefined): boolean {
  return type?.trim().toUpperCase() === 'QCM'
}

export function isPlayFreeText(type: PlayQuestionType | null | undefined): boolean {
  const key = type?.trim().toUpperCase() ?? ''
  return key === 'LIBRE' || key === 'SAISIE' || key === 'FREE' || key === 'OPEN'
}

export function buildPlaySubmitAnswers(
  questions: PlayQuizQuestionDto[],
  answers: Record<string, PlayAnswerState>,
): PlayQuizSubmitAnswerDto[] {
  return questions.map((question) => {
    const state = answers[question.id]
    if (isPlayFreeText(question.type)) {
      return {
        questionId: question.id,
        textAnswer: state?.freeText?.trim() ?? '',
      }
    }
    if (isPlayMultiChoice(question.type)) {
      return {
        questionId: question.id,
        answerIds: state?.selectedIds ?? [],
      }
    }
    return {
      questionId: question.id,
      answerId: state?.selectedIds[0],
    }
  })
}

export function allPlayQuestionsAnswered(
  questions: PlayQuizQuestionDto[],
  answers: Record<string, PlayAnswerState>,
): boolean {
  return questions.every((question) => {
    const state = answers[question.id]
    if (!state) return false
    if (isPlayFreeText(question.type)) return state.freeText.trim().length > 0
    return state.selectedIds.length > 0
  })
}

function labelsForAnswerIds(
  question: PlayQuizQuestionDto,
  ids: string[],
): string {
  if (ids.length === 0) return '—'
  const map = new Map((question.answers ?? []).map((answer) => [answer.id, answer.label]))
  return ids.map((id) => map.get(id) ?? id).join(', ')
}

export function formatPlayUserAnswer(
  question: PlayQuizQuestionDto,
  state: PlayAnswerState | undefined,
): string {
  if (!state) return '—'
  if (isPlayFreeText(question.type)) {
    const text = state.freeText.trim()
    return text || '—'
  }
  return labelsForAnswerIds(question, state.selectedIds)
}

function extractAttemptAnswerRows(
  source: PlayQuizSubmitResultDto | PlayQuizAttemptEnvelopeDto | null | undefined,
): PlayQuizAttemptAnswerDto[] {
  if (!source) return []
  if (Array.isArray(source)) return source

  const data =
    'data' in source
      ? (source.data as PlayQuizAttemptDto | PlayQuizAttemptAnswerDto[] | undefined)
      : (source as PlayQuizAttemptDto | PlayQuizSubmitResultDto)

  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  const rows =
    data.answers ??
    data.results ??
    ('quizAnswers' in data ? data.quizAnswers : null) ??
    []

  return Array.isArray(rows) ? rows : []
}

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))]
}

function resolveCorrectLabels(
  question: PlayQuizQuestionDto,
  row: PlayQuizAttemptAnswerDto | undefined,
): string | null {
  if (!row) return null

  if (row.correctTextAnswer?.trim()) return row.correctTextAnswer.trim()

  if (row.correctAnswers?.length) {
    const labels = row.correctAnswers
      .map((item) => item.label?.trim())
      .filter((label): label is string => Boolean(label))
    if (labels.length) return labels.join(', ')
  }

  const correctIds = uniqueIds([
    ...(row.correctAnswerIds ?? []),
    row.correctAnswerId,
    ...(row.question?.answers ?? [])
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.id),
  ])

  if (correctIds.length) return labelsForAnswerIds(question, correctIds)

  if (isPlayFreeText(question.type) && row.question?.answers?.length) {
    const refs = [...row.question.answers]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((answer) => answer.label)
      .filter(Boolean)
    if (refs.length) return refs.join(' / ')
  }

  return null
}

function resolveIsCorrect(
  question: PlayQuizQuestionDto,
  state: PlayAnswerState | undefined,
  row: PlayQuizAttemptAnswerDto | undefined,
): boolean | null {
  if (typeof row?.isCorrect === 'boolean') return row.isCorrect

  const correctIds = uniqueIds([
    ...(row?.correctAnswerIds ?? []),
    row?.correctAnswerId,
    ...(row?.question?.answers ?? [])
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.id),
  ])

  if (isPlayFreeText(question.type)) {
    const expected = row?.correctTextAnswer?.trim().toLowerCase()
    const given = state?.freeText?.trim().toLowerCase()
    if (expected && given) return expected === given
    return null
  }

  if (correctIds.length === 0 || !state) return null

  const selected = [...state.selectedIds].sort()
  const expected = [...correctIds].sort()
  if (selected.length !== expected.length) return false
  return selected.every((id, index) => id === expected[index])
}

export function buildPlayAnswerRecap(
  questions: PlayQuizQuestionDto[],
  answers: Record<string, PlayAnswerState>,
  attemptSource?: PlayQuizSubmitResultDto | PlayQuizAttemptEnvelopeDto | null,
): PlayRecapItem[] {
  const rows = extractAttemptAnswerRows(attemptSource)
  const byQuestion = new Map(rows.map((row) => [row.questionId, row]))

  return questions.map((question) => {
    const state = answers[question.id]
    const row = byQuestion.get(question.id)
    return {
      questionId: question.id,
      title: question.title?.trim() || `Question`,
      question: question.question,
      userAnswerLabel: formatPlayUserAnswer(question, state),
      correctAnswerLabel: resolveCorrectLabels(question, row),
      isCorrect: resolveIsCorrect(question, state, row),
    }
  })
}

export function getCategoryTone(categoryId: string | null | undefined): PlayTone {
  if (!categoryId) return 'muted'
  let hash = 0
  for (let i = 0; i < categoryId.length; i += 1) {
    hash = (hash + categoryId.charCodeAt(i) * (i + 1)) % TONES.length
  }
  return TONES[hash] ?? 'muted'
}

export function extractPlayCategories(
  quizzes: PlayQuizSummaryDto[],
): PlayQuizCategoryDto[] {
  const map = new Map<string, PlayQuizCategoryDto>()
  for (const quiz of quizzes) {
    const category = quiz.category
    const id = category?.id ?? quiz.categoryId
    if (!id) continue
    if (!map.has(id)) {
      map.set(id, category ?? { id, name: 'Catégorie' })
    }
  }
  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
  )
}

export function mergePlayCategories(
  current: PlayQuizCategoryDto[],
  incoming: PlayQuizCategoryDto[],
): PlayQuizCategoryDto[] {
  const map = new Map<string, PlayQuizCategoryDto>()
  for (const category of [...current, ...incoming]) {
    if (!category?.id) continue
    map.set(category.id, category)
  }
  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
  )
}
