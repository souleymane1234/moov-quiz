import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaAward,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaHourglassEnd,
  FaListCheck,
} from 'react-icons/fa6'
import {
  usePlayQuizDetail,
  usePlayQuizSubmit,
} from '../hooks/use-play-queries'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import type {
  PlayQuizAttemptEnvelopeDto,
  PlayQuizSubmitResultDto,
} from '../lib/api/modules/play/play.types'
import { getAccessToken } from '../lib/auth-session'
import { youtubeEmbedUrl } from '../lib/media-embed'
import {
  buildPlayAnswerRecap,
  buildPlaySubmitAnswers,
  formatPlayAnswerMode,
  formatPlayClock,
  formatPlayContentType,
  formatPlayDifficulty,
  formatPlayDuration,
  getCategoryTone,
  isPlayFreeText,
  isPlayMultiChoice,
  sortPlayAnswers,
  sortPlayQuestions,
  type PlayAnswerState,
} from '../lib/play-quiz'
import { playApi } from '../services/api-client'
import { PageLoader } from './PageLoader'
import './PlayPage.css'

type Phase = 'intro' | 'playing' | 'done'

const TIMER_RADIUS = 26
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS
const URGENT_THRESHOLD_MS = 10_000
const TIMEOUT_FLASH_MS = 2200

function questionTimeout(question: { timeoutSeconds?: number | null } | undefined): number | null {
  const value = question?.timeoutSeconds
  return value && value > 0 ? value : null
}

function parseIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/play\/([^/]+)\/?$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function emptyAnswer(): PlayAnswerState {
  return { selectedIds: [], freeText: '' }
}

function hasAnswer(state: PlayAnswerState | undefined, freeText: boolean): boolean {
  if (!state) return false
  if (freeText) return state.freeText.trim().length > 0
  return state.selectedIds.length > 0
}

function scrollPageToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

async function loadAttemptDetails(
  attemptId: string,
): Promise<PlayQuizAttemptEnvelopeDto | null> {
  try {
    return await playApi.getAttempt(attemptId)
  } catch {
    return null
  }
}

export function PlayQuizPage() {
  const id = parseIdFromPath()
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAccessToken()))
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, PlayAnswerState>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<PlayQuizSubmitResultDto | null>(null)
  const [attemptDetails, setAttemptDetails] =
    useState<PlayQuizAttemptEnvelopeDto | null>(null)
  const [deadlines, setDeadlines] = useState<Record<string, number>>({})
  const [expired, setExpired] = useState<Record<string, true>>({})
  const [flashId, setFlashId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const advanceAfterTimeoutRef = useRef<(questionId: string) => void>(() => {})

  const detailQuery = usePlayQuizDetail(id, { enabled: isLoggedIn })
  const submitMutation = usePlayQuizSubmit(id)
  const quiz = detailQuery.data ?? null

  const questions = useMemo(
    () => sortPlayQuestions(quiz?.questions),
    [quiz?.questions],
  )

  const currentQuestion = phase === 'playing' ? questions[index] : undefined
  const currentId = currentQuestion?.id ?? null
  const currentTimeout = questionTimeout(currentQuestion)
  const currentDeadline = currentId ? deadlines[currentId] : undefined
  const remainingMs =
    currentDeadline == null ? null : Math.max(0, currentDeadline - now)
  const currentExpired = currentId ? Boolean(expired[currentId]) : false

  const recap = useMemo(
    () => buildPlayAnswerRecap(questions, answers, attemptDetails ?? result),
    [questions, answers, attemptDetails, result],
  )

  const authError =
    ApiHttpError.isInstance(detailQuery.error) &&
    (detailQuery.error.status === 401 || detailQuery.error.status === 403)
  const notFound =
    ApiHttpError.isInstance(detailQuery.error) && detailQuery.error.status === 404
  const needsAuth = !isLoggedIn || authError

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(Boolean(getAccessToken()))
    window.addEventListener('wsci-auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('wsci-auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  useEffect(() => {
    setPhase('intro')
    setIndex(0)
    setAnswers({})
    setSubmitError(null)
    setResult(null)
    setAttemptDetails(null)
    setDeadlines({})
    setExpired({})
    setFlashId(null)
    scrollPageToTop()
  }, [id])

  useEffect(() => {
    scrollPageToTop()
  }, [phase, index])

  useEffect(() => {
    if (!currentId || !currentTimeout || expired[currentId] || deadlines[currentId]) return
    const startedAt = Date.now()
    setNow(startedAt)
    setDeadlines((prev) => ({ ...prev, [currentId]: startedAt + currentTimeout * 1000 }))
  }, [currentId, currentTimeout, expired, deadlines])

  useEffect(() => {
    if (currentDeadline == null || currentExpired) return
    const tick = () => setNow(Date.now())
    tick()
    const timer = window.setInterval(tick, 250)
    return () => window.clearInterval(timer)
  }, [currentDeadline, currentExpired])

  useEffect(() => {
    if (!currentId || remainingMs !== 0 || currentExpired) return
    setExpired((prev) => ({ ...prev, [currentId]: true }))
    setFlashId(currentId)
  }, [currentId, remainingMs, currentExpired])

  useEffect(() => {
    if (!flashId) return
    const timer = window.setTimeout(() => {
      setFlashId(null)
      advanceAfterTimeoutRef.current(flashId)
    }, TIMEOUT_FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [flashId])

  if (needsAuth) {
    return (
      <main className="play-quiz">
        <div className="play-quiz__inner">
          <a className="play-quiz__back" href="/play">
            ← Retour à Play
          </a>
          <div className="play-page__auth">
            <p>
              Connectez-vous pour accéder à ce quiz Play (API protégée par
              authentification).
            </p>
            <a className="play-card__cta" href="/connexion">
              Se connecter
            </a>
          </div>
        </div>
      </main>
    )
  }

  if (detailQuery.isLoading) {
    return (
      <main className="play-quiz">
        <div className="play-quiz__inner">
          <PageLoader label="Chargement du quiz…" fullPage />
        </div>
      </main>
    )
  }

  if (notFound || !quiz) {
    return (
      <main className="play-quiz">
        <div className="play-quiz__inner">
          <a className="play-quiz__back" href="/play">
            ← Retour à Play
          </a>
          <h1>Quiz introuvable</h1>
          <p>
            {detailQuery.isError && !notFound
              ? 'Impossible de charger ce quiz pour le moment.'
              : 'Ce quiz n’existe plus ou le lien est incorrect.'}
          </p>
        </div>
      </main>
    )
  }

  const tone = getCategoryTone(quiz.category?.id ?? quiz.categoryId)
  const rewards = quiz.rewards?.filter(Boolean) ?? []
  const current = questions[index]
  const total = questions.length || quiz.totalQuestions || 0
  const progress =
    total > 0 ? ((index + (phase === 'done' ? 1 : 0)) / total) * 100 : 0
  const isQuestionDone = (question: (typeof questions)[number]) =>
    Boolean(expired[question.id]) ||
    hasAnswer(answers[question.id], isPlayFreeText(question.type))
  const allAnswered = questions.every(isQuestionDone)
  const timedQuestions = questions.filter((question) => questionTimeout(question))
  const timeouts = timedQuestions.map((question) => questionTimeout(question) as number)
  const sameTimeout = timeouts.length > 0 && timeouts.every((value) => value === timeouts[0])
  const unlocked =
    result?.rewardsUnlocked?.filter((item) => item.reward).map((item) => item.reward!) ??
    []
  const correctCount = recap.filter((item) => item.isCorrect === true).length
  const wrongCount = recap.filter((item) => item.isCorrect === false).length

  const resetTimers = () => {
    setDeadlines({})
    setExpired({})
    setFlashId(null)
  }

  const startQuiz = () => {
    if (questions.length === 0) return
    resetTimers()
    setPhase('playing')
    setIndex(0)
    setSubmitError(null)
    setResult(null)
    setAttemptDetails(null)
  }

  const restartQuiz = () => {
    setAnswers({})
    setIndex(0)
    setPhase('intro')
    setSubmitError(null)
    setResult(null)
    setAttemptDetails(null)
    resetTimers()
    submitMutation.reset()
  }

  const toggleAnswer = (questionId: string, answerId: string, multi: boolean) => {
    if (expired[questionId]) return
    setAnswers((prev) => {
      const currentState = prev[questionId] ?? emptyAnswer()
      let selectedIds: string[]
      if (multi) {
        selectedIds = currentState.selectedIds.includes(answerId)
          ? currentState.selectedIds.filter((item) => item !== answerId)
          : [...currentState.selectedIds, answerId]
      } else {
        selectedIds = [answerId]
      }
      return {
        ...prev,
        [questionId]: { ...currentState, selectedIds },
      }
    })
  }

  const setFreeText = (questionId: string, value: string) => {
    if (expired[questionId]) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? emptyAnswer()),
        freeText: value,
      },
    }))
  }

  const submitQuiz = async () => {
    if (!id || submitMutation.isPending) return
    if (!allAnswered) {
      setSubmitError('Vous devez répondre à toutes les questions.')
      const firstMissing = questions.findIndex((question) => !isQuestionDone(question))
      if (firstMissing >= 0) setIndex(firstMissing)
      return
    }

    setSubmitError(null)
    try {
      const res = await submitMutation.mutateAsync({
        quizId: id,
        answers: buildPlaySubmitAnswers(questions, answers),
      })
      setResult(res.data)
      const details = await loadAttemptDetails(res.data.attemptId)
      setAttemptDetails(details)
      setPhase('done')
    } catch (error) {
      const message = ApiHttpError.isInstance(error)
        ? error.message
        : 'Impossible de soumettre le quiz pour le moment.'
      setSubmitError(message)
    }
  }

  const goNext = () => {
    if (index >= questions.length - 1) {
      void submitQuiz()
      return
    }
    setIndex((value) => value + 1)
  }

  const goPrev = () => {
    if (index <= 0) return
    setIndex((value) => value - 1)
  }

  advanceAfterTimeoutRef.current = (questionId) => {
    const timedOutIndex = questions.findIndex((question) => question.id === questionId)
    if (timedOutIndex < 0 || timedOutIndex !== index) return
    const nextPending = questions.findIndex(
      (question, questionIndex) => questionIndex > timedOutIndex && !isQuestionDone(question),
    )
    if (nextPending >= 0) {
      setIndex(nextPending)
      return
    }
    const anyPending = questions.findIndex(
      (question) => question.id !== questionId && !isQuestionDone(question),
    )
    if (anyPending >= 0) {
      setIndex(anyPending)
      return
    }
    void submitQuiz()
  }

  return (
    <main className="play-quiz">
      <div className="play-quiz__inner">
        <a className="play-quiz__back" href="/play">
          ← Retour à Play
        </a>

        <header className={`play-quiz__header play-card--${tone}`}>
          <div className="play-card__meta">
            <span className={`play-badge play-badge--${tone}`}>
              {quiz.category?.name ?? 'Quiz'}
            </span>
            <span className="play-badge play-badge--soft">
              {formatPlayDifficulty(quiz.difficulty)}
            </span>
            {quiz.hasPlayed ? (
              <span className="play-badge play-badge--soft">Déjà joué</span>
            ) : null}
          </div>
          <div className="play-quiz__title-row">
            <h1>{quiz.title}</h1>
            {currentId && currentTimeout && remainingMs != null ? (
              <QuizTimer
                key={currentId}
                remainingMs={remainingMs}
                totalMs={currentTimeout * 1000}
              />
            ) : null}
          </div>
          {phase === 'playing' && current ? (
            <>
              <div className="play-quiz__progress" aria-hidden="true">
                <div
                  className="play-quiz__progress-bar"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="play-quiz__progress-label">
                <FaListCheck aria-hidden="true" /> Question {index + 1} / {total}
              </p>
            </>
          ) : (
            <p className="play-quiz__progress-label">
              <FaListCheck aria-hidden="true" /> {total} question
              {total > 1 ? 's' : ''}
            </p>
          )}
        </header>

        {phase === 'intro' ? (
          <section className="play-quiz__panel">
            <h2>À propos</h2>
            <p className="play-quiz__question">
              {quiz.description || 'Aucune description pour ce quiz.'}
            </p>

            {rewards.length > 0 ? (
              <div className="play-quiz__rewards">
                <h3>
                  <FaAward aria-hidden="true" /> Récompenses
                </h3>
                <ul>
                  {rewards.map((reward) => (
                    <li key={reward.id}>
                      {reward.imageUrl || reward.iconUrl ? (
                        <img
                          src={reward.imageUrl || reward.iconUrl || ''}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span className="play-quiz__reward-fallback" aria-hidden="true">
                          <FaAward />
                        </span>
                      )}
                      <div>
                        <strong>{reward.title}</strong>
                        <p>
                          {reward.description ||
                            (reward.minScore != null
                              ? `Score minimum : ${reward.minScore} %`
                              : reward.rewardType)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {timeouts.length > 0 ? (
              <p className="play-quiz__time-notice">
                <FaClock aria-hidden="true" />
                <span>
                  {sameTimeout && timedQuestions.length === questions.length ? (
                    <>
                      Chaque question est chronométrée :{' '}
                      <strong>{formatPlayDuration(timeouts[0])}</strong> pour répondre.
                    </>
                  ) : (
                    <>
                      Certaines questions sont chronométrées (jusqu’à{' '}
                      <strong>{formatPlayDuration(Math.max(...timeouts))}</strong>).
                    </>
                  )}{' '}
                  Une fois le temps écoulé, la question est verrouillée.
                </span>
              </p>
            ) : null}

            {questions.length === 0 ? (
              <p className="play-quiz__result-note">
                Aucune question n’est encore disponible pour ce quiz.
              </p>
            ) : (
              <div className="play-quiz__nav">
                <span />
                <button
                  type="button"
                  className="play-quiz__nav-btn play-quiz__nav-btn--primary"
                  onClick={startQuiz}
                >
                  Commencer
                </button>
              </div>
            )}
          </section>
        ) : null}

        {phase === 'playing' && current ? (
          <section
            className={`play-quiz__panel${currentExpired ? ' is-locked' : ''}`}
            aria-live="polite"
          >
            {flashId === current.id ? (
              <div className="play-quiz__timeout" role="alert">
                <div className="play-quiz__timeout-icon" aria-hidden="true">
                  <span className="play-quiz__timeout-ripple" />
                  <span className="play-quiz__timeout-ripple play-quiz__timeout-ripple--late" />
                  <FaHourglassEnd />
                </div>
                <h2>Temps écoulé !</h2>
                <p>
                  {questions.some(
                    (question) => question.id !== current.id && !isQuestionDone(question),
                  )
                    ? 'Passage à la question suivante…'
                    : 'Envoi de vos réponses…'}
                </p>
              </div>
            ) : null}

            <div className="play-quiz__tags">
              <span>{formatPlayContentType(current.contentType)}</span>
              <span>{formatPlayAnswerMode(current.type)}</span>
              {current.points > 0 ? <span>{current.points} pt</span> : null}
              {currentExpired ? (
                <span className="play-quiz__tag-locked">
                  <FaHourglassEnd aria-hidden="true" /> Temps écoulé
                </span>
              ) : null}
            </div>
            {current.title ? <h2>{current.title}</h2> : null}
            <p className="play-quiz__question">{current.question}</p>

            <QuestionMedia
              contentType={current.contentType}
              contentUrl={current.contentUrl}
            />

            {isPlayFreeText(current.type) ? (
              <label className="play-quiz__libre">
                <span>Votre réponse</span>
                <textarea
                  value={answers[current.id]?.freeText ?? ''}
                  onChange={(event) => setFreeText(current.id, event.target.value)}
                  disabled={currentExpired}
                  rows={4}
                  placeholder="Saisissez votre réponse…"
                />
              </label>
            ) : (
              <ul className="play-quiz__options">
                {sortPlayAnswers(current).map((answer) => {
                  const multi = isPlayMultiChoice(current.type)
                  const checked =
                    answers[current.id]?.selectedIds.includes(answer.id) ?? false
                  return (
                    <li key={answer.id}>
                      <label
                        className={`play-quiz__option${checked ? ' is-checked' : ''}`}
                      >
                        <input
                          type={multi ? 'checkbox' : 'radio'}
                          name={`q-${current.id}`}
                          checked={checked}
                          disabled={currentExpired}
                          onChange={() =>
                            toggleAnswer(current.id, answer.id, multi)
                          }
                        />
                        <span>{answer.label}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            )}

            {submitError ? (
              <p className="play-page__status play-page__status--error" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="play-quiz__nav">
              <button
                type="button"
                className="play-quiz__nav-btn"
                onClick={goPrev}
                disabled={index === 0 || submitMutation.isPending}
              >
                Précédent
              </button>
              <button
                type="button"
                className="play-quiz__nav-btn play-quiz__nav-btn--primary"
                onClick={goNext}
                disabled={submitMutation.isPending}
              >
                {index >= questions.length - 1
                  ? submitMutation.isPending
                    ? 'Envoi…'
                    : 'Terminer'
                  : 'Suivant'}
              </button>
            </div>

            <div className="play-quiz__dots" role="tablist" aria-label="Questions">
              {questions.map((question, questionIndex) => {
                const done = hasAnswer(
                  answers[question.id],
                  isPlayFreeText(question.type),
                )
                const timedOut = Boolean(expired[question.id])
                const isCurrent = questionIndex === index
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`play-quiz__dot${done ? ' is-done' : ''}${timedOut ? ' is-expired' : ''}${isCurrent ? ' is-current' : ''}`}
                    onClick={() => setIndex(questionIndex)}
                    disabled={submitMutation.isPending}
                    aria-label={`Question ${questionIndex + 1}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {questionIndex + 1}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        {phase === 'done' && result ? (
          <section className="play-quiz__result">
            <h1>Quiz terminé</h1>
            <div className="play-quiz__score" aria-label="Résultat">
              <p className="play-quiz__score-pct">{Math.round(result.percentage)} %</p>
              <ul className="play-quiz__score-facts">
                <li>
                  Score : {result.score} / {result.totalPoints}
                </li>
                <li>+{result.pointsEarned} points gagnés</li>
                {correctCount + wrongCount > 0 ? (
                  <li>
                    {correctCount} bonne{correctCount > 1 ? 's' : ''} · {wrongCount}{' '}
                    mauvaise{wrongCount > 1 ? 's' : ''}
                  </li>
                ) : null}
                {result.newTotalPoints != null ? (
                  <li>Total points : {result.newTotalPoints}</li>
                ) : null}
                {result.newRank != null ? <li>Nouveau rang : #{result.newRank}</li> : null}
              </ul>
            </div>

            <div className="play-quiz__recap">
              <h2>Récapitulatif des réponses</h2>
              <ol className="play-quiz__recap-list">
                {recap.map((item, itemIndex) => {
                  const status =
                    item.isCorrect === true
                      ? 'ok'
                      : item.isCorrect === false
                        ? 'ko'
                        : 'unknown'
                  return (
                    <li
                      key={item.questionId}
                      className={`play-quiz__recap-item play-quiz__recap-item--${status}`}
                    >
                      <div className="play-quiz__recap-head">
                        <span className="play-quiz__recap-index">
                          {itemIndex + 1}.
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.question}</p>
                        </div>
                        {status === 'ok' ? (
                          <span className="play-quiz__recap-badge play-quiz__recap-badge--ok">
                            <FaCircleCheck aria-hidden="true" /> Bonne
                          </span>
                        ) : null}
                        {status === 'ko' ? (
                          <span className="play-quiz__recap-badge play-quiz__recap-badge--ko">
                            <FaCircleXmark aria-hidden="true" /> Mauvaise
                          </span>
                        ) : null}
                      </div>
                      <dl className="play-quiz__recap-answers">
                        <div>
                          <dt>Votre réponse</dt>
                          <dd>{item.userAnswerLabel}</dd>
                        </div>
                        {item.correctAnswerLabel && status === 'ko' ? (
                          <div>
                            <dt>Bonne réponse</dt>
                            <dd>{item.correctAnswerLabel}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </li>
                  )
                })}
              </ol>
            </div>

            {unlocked.length > 0 ? (
              <div className="play-quiz__rewards">
                <h3>
                  <FaAward aria-hidden="true" /> Récompenses débloquées
                </h3>
                <ul>
                  {unlocked.map((reward) => (
                    <li key={reward.id}>
                      {reward.imageUrl || reward.iconUrl ? (
                        <img
                          src={reward.imageUrl || reward.iconUrl || ''}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span className="play-quiz__reward-fallback" aria-hidden="true">
                          <FaAward />
                        </span>
                      )}
                      <div>
                        <strong>{reward.title}</strong>
                        <p>{reward.description || reward.rewardType}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : rewards.length > 0 ? (
              <p className="play-quiz__result-note">
                Aucune récompense débloquée cette fois. Réessayez pour viser un
                meilleur score.
              </p>
            ) : null}

            <div className="play-quiz__result-actions">
              <button
                type="button"
                className="play-quiz__nav-btn play-quiz__nav-btn--primary"
                onClick={restartQuiz}
              >
                Rejouer
              </button>
              <a className="play-quiz__secondary" href="/play">
                Retour à Play
              </a>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function QuizTimer({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const ratio = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0
  const level = ratio > 0.5 ? 'ok' : ratio > 0.2 ? 'warn' : 'danger'
  const urgent = remainingMs <= URGENT_THRESHOLD_MS
  const seconds = Math.ceil(remainingMs / 1000)

  return (
    <div
      className={`play-quiz-timer play-quiz-timer--${level}${urgent ? ' is-urgent' : ''}`}
      role="timer"
      aria-label={`Temps restant : ${formatPlayDuration(seconds)}`}
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="play-quiz-timer__track" cx="32" cy="32" r={TIMER_RADIUS} />
        <circle
          className="play-quiz-timer__bar"
          cx="32"
          cy="32"
          r={TIMER_RADIUS}
          strokeDasharray={TIMER_CIRCUMFERENCE}
          strokeDashoffset={TIMER_CIRCUMFERENCE * (1 - ratio)}
        />
      </svg>
      <span key={urgent ? seconds : 'steady'} className="play-quiz-timer__value">
        {formatPlayClock(remainingMs)}
      </span>
    </div>
  )
}

function QuestionMedia({
  contentType,
  contentUrl,
}: {
  contentType: string
  contentUrl?: string | null
}) {
  const kind = contentType?.trim().toUpperCase() ?? 'TEXT'
  const url = contentUrl?.trim()
  if (!url || kind === 'TEXT') return null

  if (kind === 'IMAGE') {
    return (
      <div className="play-quiz__media">
        <img src={url} alt="" loading="lazy" />
      </div>
    )
  }

  if (kind === 'VIDEO') {
    const embed = youtubeEmbedUrl(url)
    if (embed) {
      return (
        <div className="play-quiz__media play-quiz__media--video">
          <iframe
            src={embed}
            title="Vidéo de la question"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    return (
      <div className="play-quiz__media play-quiz__media--video">
        <video src={url} controls playsInline preload="metadata" />
      </div>
    )
  }

  return null
}
