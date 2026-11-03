import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  FaArrowLeft,
  FaClockRotateLeft,
  FaMagnifyingGlass,
  FaXmark,
} from 'react-icons/fa6'
import { useDebouncedValue, useSearchSuggestions } from '../hooks/use-search-queries'
import type { SearchResultDto } from '../lib/api/modules/search/search.types'
import {
  clearRecentSearches,
  isSearchModuleType,
  pushRecentSearch,
  readRecentSearches,
  recentFromResult,
  removeRecentSearch,
  SEARCH_MIN_CHARS,
  searchModuleLabel,
  searchPageHref,
  searchResultImage,
  searchResultLink,
  searchResultSubtitle,
  type RecentSearch,
} from '../lib/search'
import { SearchResultThumb } from './SearchResultThumb'
import './Search.css'

type OverlayItem =
  | { kind: 'recent'; entry: RecentSearch }
  | { kind: 'result'; result: SearchResultDto }
  | { kind: 'all'; query: string }

function navigate(href: string, external: boolean) {
  if (external) {
    window.open(href, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = href
  }
}

export function SearchOverlay({
  open,
  onClose,
  initialQuery = '',
}: {
  open: boolean
  onClose: () => void
  initialQuery?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [recents, setRecents] = useState<RecentSearch[]>(() => readRecentSearches())
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const trimmed = query.trim()
  const debounced = useDebouncedValue(trimmed, 280)
  const typing = trimmed.length >= SEARCH_MIN_CHARS
  const suggestions = useSearchSuggestions(typing ? debounced : '')
  const results = typing ? suggestions.data?.data ?? [] : []
  const waiting = typing && (debounced !== trimmed || suggestions.isFetching)

  useEffect(() => {
    if (!open) return
    setRecents(readRecentSearches())
    setQuery(initialQuery)
    setActiveIndex(-1)
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.cancelAnimationFrame(id)
      document.body.style.overflow = previousOverflow
    }
  }, [open, initialQuery])

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const items = useMemo<OverlayItem[]>(() => {
    if (!typing) return recents.map((entry) => ({ kind: 'recent', entry }))
    return [
      ...results.map((result) => ({ kind: 'result' as const, result })),
      { kind: 'all' as const, query: trimmed },
    ]
  }, [typing, recents, results, trimmed])

  useEffect(() => {
    setActiveIndex(-1)
  }, [trimmed])

  useEffect(() => {
    if (activeIndex < 0) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function searchAll(q: string) {
    const value = q.trim()
    if (value.length < SEARCH_MIN_CHARS) return
    pushRecentSearch({ kind: 'query', query: value })
    navigate(searchPageHref(value), false)
  }

  function openResult(result: SearchResultDto) {
    const link = searchResultLink(result)
    const recent = recentFromResult(result)
    if (recent) setRecents(pushRecentSearch(recent))
    if (link) {
      navigate(link.href, link.external)
      if (link.external) onClose()
      return
    }
    pushRecentSearch({ kind: 'query', query: trimmed })
    navigate(
      searchPageHref(trimmed, isSearchModuleType(result.contentType) ? result.contentType : null),
      false,
    )
  }

  function openRecent(entry: RecentSearch) {
    if (entry.kind === 'query') {
      searchAll(entry.query)
      return
    }
    setRecents(pushRecentSearch(entry))
    navigate(entry.href, entry.external)
    if (entry.external) onClose()
  }

  function activate(item: OverlayItem) {
    if (item.kind === 'recent') openRecent(item.entry)
    else if (item.kind === 'result') openResult(item.result)
    else searchAll(item.query)
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : -1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (items.length ? (i <= 0 ? items.length - 1 : i - 1) : -1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items[activeIndex]
      if (item) activate(item)
      else searchAll(trimmed)
    }
  }

  if (!open) return null

  const activeId = activeIndex >= 0 ? `search-option-${activeIndex}` : undefined

  return createPortal(
    <div className="search-overlay" role="presentation">
      <button
        type="button"
        className="search-overlay__backdrop"
        aria-label="Fermer la recherche"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        className="search-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher sur le site"
      >
        <div className="search-overlay__bar">
          <button
            type="button"
            className="search-overlay__back"
            onClick={onClose}
            aria-label="Fermer la recherche"
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <label className="search-field">
            <FaMagnifyingGlass className="search-field__icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Rechercher sur WorldSkills CI"
              aria-label="Rechercher"
              role="combobox"
              aria-expanded={items.length > 0}
              aria-controls="search-overlay-list"
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              autoComplete="off"
              enterKeyHint="search"
            />
            {query ? (
              <button
                type="button"
                className="search-field__clear"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label="Effacer"
              >
                <FaXmark aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </div>

        <div className="search-overlay__body">
          {!typing ? (
            <div className="search-overlay__section-head">
              <span>Recherches récentes</span>
              {recents.length > 0 ? (
                <button type="button" onClick={() => setRecents(clearRecentSearches())}>
                  Tout effacer
                </button>
              ) : null}
            </div>
          ) : null}

          {!typing && recents.length === 0 ? (
            <p className="search-overlay__hint">
              {trimmed.length > 0
                ? `Saisissez au moins ${SEARCH_MIN_CHARS} caractères.`
                : 'Aucune recherche récente. Cherchez une personne, un métier, une vidéo…'}
            </p>
          ) : null}

          {typing && suggestions.isError && !waiting ? (
            <p className="search-overlay__hint search-overlay__hint--error">
              La recherche est momentanément indisponible.
            </p>
          ) : null}

          <ul
            ref={listRef}
            id="search-overlay-list"
            className={`search-overlay__list${waiting ? ' is-waiting' : ''}`}
            role="listbox"
            aria-label={typing ? 'Suggestions' : 'Recherches récentes'}
          >
            {items.map((item, index) => {
              const isActive = index === activeIndex
              const common = {
                id: `search-option-${index}`,
                'data-index': index,
                role: 'option' as const,
                'aria-selected': isActive,
                className: `search-overlay__item${isActive ? ' is-active' : ''}`,
                onMouseEnter: () => setActiveIndex(index),
              }

              if (item.kind === 'recent') {
                const entry = item.entry
                return (
                  <li key={`r-${index}`} {...common}>
                    <button
                      type="button"
                      className="search-overlay__item-main"
                      onClick={() => openRecent(entry)}
                      tabIndex={-1}
                    >
                      {entry.kind === 'query' ? (
                        <span className="search-thumb search-thumb--sm search-thumb--round search-thumb--icon search-thumb--history">
                          <FaClockRotateLeft aria-hidden="true" />
                        </span>
                      ) : (
                        <SearchResultThumb
                          contentType={entry.contentType}
                          image={entry.image}
                          size="sm"
                        />
                      )}
                      <span className="search-overlay__item-text">
                        <strong>{entry.kind === 'query' ? entry.query : entry.title}</strong>
                        {entry.kind === 'item' ? (
                          <small>{searchModuleLabel(entry.contentType)}</small>
                        ) : null}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="search-overlay__remove"
                      onClick={() => setRecents(removeRecentSearch(entry))}
                      aria-label="Retirer de l’historique"
                      tabIndex={-1}
                    >
                      <FaXmark aria-hidden="true" />
                    </button>
                  </li>
                )
              }

              if (item.kind === 'result') {
                const result = item.result
                return (
                  <li key={`s-${result.contentType}-${result.id}`} {...common}>
                    <button
                      type="button"
                      className="search-overlay__item-main"
                      onClick={() => openResult(result)}
                      tabIndex={-1}
                    >
                      <SearchResultThumb
                        contentType={result.contentType}
                        image={searchResultImage(result)}
                        size="sm"
                      />
                      <span className="search-overlay__item-text">
                        <strong>{result.title}</strong>
                        <small>{searchResultSubtitle(result)}</small>
                      </span>
                    </button>
                  </li>
                )
              }

              return (
                <li key="all" {...common}>
                  <button
                    type="button"
                    className="search-overlay__item-main search-overlay__item-main--all"
                    onClick={() => searchAll(item.query)}
                    tabIndex={-1}
                  >
                    <span className="search-thumb search-thumb--sm search-thumb--round search-thumb--icon search-thumb--accent">
                      <FaMagnifyingGlass aria-hidden="true" />
                    </span>
                    <span className="search-overlay__item-text">
                      <strong>Rechercher « {item.query} »</strong>
                      <small>
                        {suggestions.data?.pagination?.total_items
                          ? `Voir les ${suggestions.data.pagination.total_items} résultats`
                          : 'Voir tous les résultats'}
                      </small>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {typing && !waiting && results.length === 0 && !suggestions.isError ? (
            <p className="search-overlay__hint">Aucune suggestion pour « {trimmed} ».</p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
