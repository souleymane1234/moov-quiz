import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaAward,
  FaCirclePlay,
  FaLayerGroup,
  FaListCheck,
} from 'react-icons/fa6'
import { usePlayQuizzesInfinite } from '../hooks/use-play-queries'
import { ApiHttpError } from '../lib/api/errors/api-http-error'
import type { PlayQuizCategoryDto } from '../lib/api/modules/play/play.types'
import { getAccessToken } from '../lib/auth-session'
import {
  extractPlayCategories,
  formatPlayDifficulty,
  getCategoryTone,
  mergePlayCategories,
  playQuizPath,
} from '../lib/play-quiz'
import { useRevealOnView } from '../hooks/useRevealOnView'
import { PageLoader } from './PageLoader'
import './PlayPage.css'

export function PlayPage() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [knownCategories, setKnownCategories] = useState<PlayQuizCategoryDto[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAccessToken()))
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const quizzesQuery = usePlayQuizzesInfinite(categoryId ?? undefined, {
    enabled: isLoggedIn,
  })

  const quizzes = useMemo(
    () => quizzesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [quizzesQuery.data],
  )

  const totalItems =
    quizzesQuery.data?.pages[0]?.pagination.total_items ?? quizzes.length

  const authError =
    ApiHttpError.isInstance(quizzesQuery.error) &&
    (quizzesQuery.error.status === 401 || quizzesQuery.error.status === 403)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

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
    const fromPage = extractPlayCategories(quizzes)
    if (fromPage.length === 0) return
    setKnownCategories((prev) => mergePlayCategories(prev, fromPage))
  }, [quizzes])

  useEffect(() => {
    if (categoryId !== null) return
    const counts: Record<string, number> = {}
    for (const quiz of quizzes) {
      const id = quiz.category?.id ?? quiz.categoryId
      if (!id) continue
      counts[id] = (counts[id] ?? 0) + 1
    }
    setCategoryCounts(counts)
  }, [quizzes, categoryId])

  const hasMore = Boolean(quizzesQuery.hasNextPage)
  const isInitialLoading = quizzesQuery.isLoading && quizzes.length === 0
  const needsAuth = !isLoggedIn || authError

  useEffect(() => {
    const target = sentinelRef.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (!quizzesQuery.isFetchingNextPage) {
          void quizzesQuery.fetchNextPage()
        }
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, quizzesQuery.fetchNextPage, quizzesQuery.isFetchingNextPage])

  return (
    <main
      ref={ref}
      id="play"
      className={`play-page${isVisible ? ' play-page--visible' : ''}`}
      aria-labelledby="play-title"
    >
      <div className="play-page__inner">
        <header className="play-page__hero">
          <p className="play-page__eyebrow">Côte d’Ivoire Skills Play</p>
          <h1 id="play-title">Play</h1>
          <p className="play-page__lead">
            Quiz par catégorie, avec classement et récompenses. Filtrez une thématique
            puis lancez un défi.
          </p>
        </header>

        {needsAuth ? (
          <div className="play-page__auth">
            <p>
              Connectez-vous pour accéder aux quiz Play (API protégée par
              authentification).
            </p>
            <a className="play-card__cta" href="/connexion">
              Se connecter
            </a>
          </div>
        ) : (
          <>
            <section className="play-page__themes" aria-label="Catégories de quiz">
              <button
                type="button"
                className={`play-theme play-theme--all${categoryId === null ? ' is-active' : ''}`}
                onClick={() => setCategoryId(null)}
                aria-pressed={categoryId === null}
                aria-label={`Toutes les catégories (${totalItems})`}
                title="Toutes"
              >
                <span className="play-theme__icon" aria-hidden="true">
                  <FaCirclePlay />
                </span>
                <span className="play-theme__body">
                  <strong>Toutes</strong>
                </span>
                <span className="play-theme__count">{totalItems}</span>
              </button>
              {knownCategories.map((category) => {
                const tone = getCategoryTone(category.id)
                const active = categoryId === category.id
                const count =
                  categoryId === category.id
                    ? totalItems
                    : (categoryCounts[category.id] ?? 0)
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`play-theme play-theme--${tone}${active ? ' is-active' : ''}`}
                    onClick={() => setCategoryId(category.id)}
                    aria-pressed={active}
                    aria-label={`${category.name} (${count})`}
                    title={category.name}
                  >
                    <span className="play-theme__icon" aria-hidden="true">
                      <FaLayerGroup />
                    </span>
                    <span className="play-theme__body">
                      <strong>
                        <span className="play-theme__label-full">{category.name}</span>
                        <span className="play-theme__label-short">{category.name}</span>
                      </strong>
                    </span>
                    <span className="play-theme__count">{count}</span>
                  </button>
                )
              })}
            </section>

            {isInitialLoading ? <PageLoader label="Chargement des quiz…" /> : null}

            {!isInitialLoading && quizzesQuery.isError ? (
              <p className="play-page__status play-page__status--error">
                Impossible de charger les quiz pour le moment. Vérifiez votre connexion.
              </p>
            ) : null}

            {!isInitialLoading && !quizzesQuery.isError ? (
              <p className="play-page__count">
                {quizzes.length === 0
                  ? 'Aucun quiz dans cette catégorie.'
                  : `${quizzes.length} quiz affiché${quizzes.length > 1 ? 's' : ''}${hasMore ? ` sur ${totalItems}` : ''}`}
              </p>
            ) : null}

            {quizzes.length > 0 ? (
              <ul className="play-page__grid">
                {quizzes.map((quiz) => {
                  const tone = getCategoryTone(quiz.category?.id ?? quiz.categoryId)
                  const categoryName = quiz.category?.name ?? 'Quiz'
                  const rewardsCount = quiz.rewards?.length ?? 0
                  return (
                    <li key={quiz.id}>
                      <article className={`play-card play-card--${tone}`}>
                        <div className="play-card__meta">
                          <span className={`play-badge play-badge--${tone}`}>
                            {categoryName}
                          </span>
                          <span className="play-badge play-badge--soft">
                            {formatPlayDifficulty(quiz.difficulty)}
                          </span>
                          {quiz.hasPlayed ? (
                            <span className="play-badge play-badge--soft">Déjà joué</span>
                          ) : null}
                        </div>
                        <h2>
                          <a href={playQuizPath(quiz.id)}>{quiz.title}</a>
                        </h2>
                        <p>{quiz.description || 'Aucune description.'}</p>
                        <ul className="play-card__facts">
                          <li>
                            <FaListCheck aria-hidden="true" />
                            {quiz.totalQuestions} question
                            {quiz.totalQuestions > 1 ? 's' : ''}
                          </li>
                          {rewardsCount > 0 ? (
                            <li>
                              <FaAward aria-hidden="true" />
                              {rewardsCount} récompense{rewardsCount > 1 ? 's' : ''}
                            </li>
                          ) : null}
                        </ul>
                        {rewardsCount > 0 ? (
                          <div className="play-card__tags">
                            {quiz.rewards?.slice(0, 3).map((reward) => (
                              <span key={reward.id}>{reward.title}</span>
                            ))}
                          </div>
                        ) : null}
                        <a className="play-card__cta" href={playQuizPath(quiz.id)}>
                          Jouer
                        </a>
                      </article>
                    </li>
                  )
                })}
              </ul>
            ) : null}

            <div className="play-page__loading" aria-live="polite">
              {hasMore ? (
                <>
                  <p>
                    {quizzesQuery.isFetchingNextPage
                      ? 'Chargement des quiz…'
                      : 'Faites défiler pour charger plus de quiz…'}
                  </p>
                  <div
                    ref={sentinelRef}
                    className="play-page__sentinel"
                    aria-hidden="true"
                  />
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
