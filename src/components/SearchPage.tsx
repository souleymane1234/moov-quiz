import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { FaArrowUpRightFromSquare, FaEye, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6'
import { useSearchResults, useSearchSuggestions } from '../hooks/use-search-queries'
import { ApiHttpError } from '../lib/api'
import type { SearchModuleType, SearchResultDto } from '../lib/api/modules/search/search.types'
import { formatCompactCount } from '../lib/media-embed'
import {
  isSearchModuleType,
  pushRecentSearch,
  recentFromResult,
  SEARCH_MIN_CHARS,
  SEARCH_MODULES,
  searchModuleLabel,
  searchPageHref,
  searchResultImage,
  searchResultLink,
  searchResultSubtitle,
  searchResultSummary,
} from '../lib/search'
import { PageLoader } from './PageLoader'
import { SearchModuleIcon, SearchResultThumb } from './SearchResultThumb'
import './Search.css'

function readUrlState(): { query: string; type: SearchModuleType | null } {
  const params = new URLSearchParams(window.location.search)
  const type = params.get('type')
  return {
    query: params.get('q')?.trim() ?? '',
    type: isSearchModuleType(type) ? type : null,
  }
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SearchResultCard({ result, index }: { result: SearchResultDto; index: number }) {
  const link = searchResultLink(result)
  const summary = searchResultSummary(result)
  const date = result.contentType === 'users' ? null : formatDate(result.publishedAt)
  const views = result.views && result.views > 0 ? result.views : null

  const body = (
    <>
      <SearchResultThumb
        contentType={result.contentType}
        image={searchResultImage(result)}
        size="lg"
      />
      <span className="search-card__body">
        <strong className="search-card__title">{result.title}</strong>
        <span className="search-card__subtitle">{searchResultSubtitle(result)}</span>
        {summary ? <span className="search-card__summary">{summary}</span> : null}
        {date || views ? (
          <span className="search-card__meta">
            {date ? <span>{date}</span> : null}
            {views ? (
              <span>
                <FaEye aria-hidden="true" /> {formatCompactCount(views)}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
      {link ? (
        <span className="search-card__action" aria-hidden="true">
          {link.external ? <FaArrowUpRightFromSquare /> : 'Voir'}
        </span>
      ) : null}
    </>
  )

  const style = { ['--search-i' as string]: index % 12 }

  if (!link) {
    return (
      <li className="search-card search-card--static" style={style}>
        <div className="search-card__inner">{body}</div>
      </li>
    )
  }

  return (
    <li className="search-card" style={style}>
      <a
        className="search-card__inner"
        href={link.href}
        target={link.external ? '_blank' : undefined}
        rel={link.external ? 'noopener noreferrer' : undefined}
        onClick={() => {
          const recent = recentFromResult(result)
          if (recent) pushRecentSearch(recent)
        }}
      >
        {body}
      </a>
    </li>
  )
}

export function SearchPage() {
  const initial = useMemo(readUrlState, [])
  const [query, setQuery] = useState(initial.query)
  const [draft, setDraft] = useState(initial.query)
  const [type, setType] = useState<SearchModuleType | null>(initial.type)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const validQuery = query.length >= SEARCH_MIN_CHARS
  const resultsQuery = useSearchResults(query, type)
  const statsQuery = useSearchSuggestions(query)

  const results = useMemo(() => {
    const seen = new Set<string>()
    const out: SearchResultDto[] = []
    for (const page of resultsQuery.data?.pages ?? []) {
      for (const r of page.data ?? []) {
        const key = `${r.contentType}:${r.id}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push(r)
      }
    }
    return out
  }, [resultsQuery.data])

  const totalItems = resultsQuery.data?.pages[0]?.pagination?.total_items ?? results.length
  const stats = statsQuery.data?.stats ?? resultsQuery.data?.pages[0]?.stats ?? null
  const allCount = statsQuery.data?.pagination?.total_items ?? (type ? null : totalItems)

  const filters = useMemo(() => {
    const visible = SEARCH_MODULES.filter((m) => {
      if (m.id === type) return true
      if (!stats) return false
      return (stats[m.id] ?? 0) > 0
    })
    return visible.map((m) => ({ ...m, count: stats?.[m.id] ?? null }))
  }, [stats, type])

  const sections = useMemo(() => {
    if (type) return []
    const byType = new Map<string, SearchResultDto[]>()
    for (const r of results) {
      const list = byType.get(r.contentType) ?? []
      list.push(r)
      byType.set(r.contentType, list)
    }
    const order = SEARCH_MODULES.map((m) => m.id as string)
    return [...byType.entries()].sort(
      ([a], [b]) =>
        (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) -
        (order.indexOf(b) === -1 ? 99 : order.indexOf(b)),
    )
  }, [results, type])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [query, type])

  useEffect(() => {
    const onPop = () => {
      const next = readUrlState()
      setQuery(next.query)
      setDraft(next.query)
      setType(next.type)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = resultsQuery
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !type || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [type, hasNextPage, isFetchingNextPage, fetchNextPage, results.length])

  function applyState(nextQuery: string, nextType: SearchModuleType | null) {
    window.history.pushState(null, '', searchPageHref(nextQuery, nextType))
    setQuery(nextQuery)
    setType(nextType)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const value = draft.trim()
    if (value.length < SEARCH_MIN_CHARS) return
    pushRecentSearch({ kind: 'query', query: value })
    applyState(value, type)
  }

  const errorStatus = ApiHttpError.isInstance(resultsQuery.error)
    ? resultsQuery.error.status
    : null

  return (
    <main className="search-page" aria-labelledby="search-page-title">
      <div className="search-page__layout">
        <aside className="search-page__sidebar">
          <h1 id="search-page-title">Résultats de recherche</h1>

          <form className="search-page__form" onSubmit={onSubmit} role="search">
            <label className="search-field search-field--page">
              <FaMagnifyingGlass className="search-field__icon" aria-hidden="true" />
              <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Rechercher"
                aria-label="Rechercher"
                enterKeyHint="search"
              />
              {draft ? (
                <button
                  type="button"
                  className="search-field__clear"
                  onClick={() => setDraft('')}
                  aria-label="Effacer"
                >
                  <FaXmark aria-hidden="true" />
                </button>
              ) : null}
            </label>
          </form>

          <p className="search-page__filters-label">Filtres</p>
          <nav className="search-page__filters" aria-label="Filtrer par type">
            <button
              type="button"
              className={`search-filter${type === null ? ' is-active' : ''}`}
              aria-pressed={type === null}
              onClick={() => applyState(query, null)}
            >
              <span className="search-filter__icon" aria-hidden="true">
                <FaMagnifyingGlass />
              </span>
              <span className="search-filter__label">Tous</span>
              {allCount ? <span className="search-filter__count">{allCount}</span> : null}
            </button>
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`search-filter${type === f.id ? ' is-active' : ''}`}
                aria-pressed={type === f.id}
                onClick={() => applyState(query, f.id)}
              >
                <span className="search-filter__icon" aria-hidden="true">
                  <SearchModuleIcon contentType={f.id} />
                </span>
                <span className="search-filter__label">{f.label}</span>
                {f.count ? <span className="search-filter__count">{f.count}</span> : null}
              </button>
            ))}
          </nav>
        </aside>

        <section className="search-page__main" aria-live="polite">
          {!validQuery ? (
            <div className="search-page__empty">
              <span className="search-page__empty-icon" aria-hidden="true">
                <FaMagnifyingGlass />
              </span>
              <h2>Que recherchez-vous ?</h2>
              <p>Saisissez au moins {SEARCH_MIN_CHARS} caractères pour lancer la recherche.</p>
            </div>
          ) : resultsQuery.isLoading ? (
            <PageLoader label="Recherche en cours…" />
          ) : resultsQuery.isError ? (
            <div className="search-page__empty">
              <h2>Recherche indisponible</h2>
              <p>
                {errorStatus === 429
                  ? 'Trop de recherches en peu de temps. Réessayez dans un instant.'
                  : 'Impossible de charger les résultats pour le moment.'}
              </p>
              <button
                type="button"
                className="search-page__more"
                onClick={() => void resultsQuery.refetch()}
              >
                Réessayer
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="search-page__empty">
              <span className="search-page__empty-icon" aria-hidden="true">
                <FaMagnifyingGlass />
              </span>
              <h2>Aucun résultat</h2>
              <p>
                Nous n’avons rien trouvé pour « {query} »
                {type ? ` dans ${searchModuleLabel(type, true)}` : ''}. Essayez d’autres mots-clés.
              </p>
            </div>
          ) : (
            <>
              <p className="search-page__summary">
                <strong>{totalItems}</strong> résultat{totalItems > 1 ? 's' : ''} pour «{' '}
                {query} »{type ? ` · ${searchModuleLabel(type, true)}` : ''}
              </p>

              {type ? (
                <ul className="search-page__list">
                  {results.map((r, i) => (
                    <SearchResultCard key={`${r.contentType}-${r.id}`} result={r} index={i} />
                  ))}
                </ul>
              ) : (
                sections.map(([contentType, list]) => {
                  const count = stats?.[contentType] ?? list.length
                  const canFilter = isSearchModuleType(contentType)
                  return (
                    <section key={contentType} className="search-page__section">
                      <header className="search-page__section-head">
                        <h2>
                          <SearchModuleIcon contentType={contentType} />
                          {searchModuleLabel(contentType, true)}
                        </h2>
                        {canFilter && count > list.length ? (
                          <button
                            type="button"
                            onClick={() => applyState(query, contentType)}
                          >
                            Voir tout ({count})
                          </button>
                        ) : null}
                      </header>
                      <ul className="search-page__list">
                        {list.map((r, i) => (
                          <SearchResultCard
                            key={`${r.contentType}-${r.id}`}
                            result={r}
                            index={i}
                          />
                        ))}
                      </ul>
                    </section>
                  )
                })
              )}

              {hasNextPage ? (
                <div ref={sentinelRef} className="search-page__more-wrap">
                  <button
                    type="button"
                    className="search-page__more"
                    onClick={() => void fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Chargement…' : 'Voir plus de résultats'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
