import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaBell,
  FaBriefcase,
  FaCalendarDays,
  FaClipboardList,
  FaGraduationCap,
  FaLightbulb,
  FaLocationDot,
  FaMagnifyingGlass,
  FaUserGroup,
} from 'react-icons/fa6'
import { useAnnoncesInfinite } from '../hooks/use-annonces-queries'
import {
  alerteDetailPath,
  extractAnnonceTypes,
  formatAlerteDate,
  formatAnnonceTypeLabel,
  getAnnonceTypeTone,
  getDeadlineStatus,
  isRecentAlerte,
  mergeAnnonceTypes,
  type AlerteTone,
} from '../lib/alertes'
import type { AnnonceTypeDto } from '../lib/api/modules/annonces/annonces.types'
import { useRevealOnView } from '../hooks/useRevealOnView'
import { PageLoader } from './PageLoader'
import './AlertesPage.css'

const TONE_ICONS: Record<AlerteTone, typeof FaBell> = {
  orange: FaGraduationCap,
  green: FaBriefcase,
  blue: FaClipboardList,
  gold: FaLightbulb,
  navy: FaUserGroup,
  muted: FaBell,
}

function deadlineLabel(status: ReturnType<typeof getDeadlineStatus>) {
  if (status === 'closed') return 'Clôturé'
  if (status === 'soon') return 'Bientôt clôturé'
  return 'Ouvert'
}

export function AlertesPage() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  const [typeId, setTypeId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [knownTypes, setKnownTypes] = useState<AnnonceTypeDto[]>([])
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const annoncesQuery = useAnnoncesInfinite(typeId ?? undefined)

  const items = useMemo(
    () => annoncesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [annoncesQuery.data],
  )

  const totalItems =
    annoncesQuery.data?.pages[0]?.pagination.total_items ?? items.length

  useEffect(() => {
    const fromPage = extractAnnonceTypes(items)
    if (fromPage.length === 0) return
    setKnownTypes((prev) => mergeAnnonceTypes(prev, fromPage))
  }, [items])

  useEffect(() => {
    if (typeId !== null) return
    const counts: Record<string, number> = {}
    for (const item of items) {
      if (!item.type?.id) continue
      counts[item.type.id] = (counts[item.type.id] ?? 0) + 1
    }
    setTypeCounts(counts)
  }, [items, typeId])

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) =>
      [item.title, item.description, item.place, item.type?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [items, query])

  const hasMore = Boolean(annoncesQuery.hasNextPage)
  const isInitialLoading = annoncesQuery.isLoading && items.length === 0

  useEffect(() => {
    const target = sentinelRef.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (!annoncesQuery.isFetchingNextPage) {
          void annoncesQuery.fetchNextPage()
        }
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, annoncesQuery.fetchNextPage, annoncesQuery.isFetchingNextPage])

  return (
    <main
      ref={ref}
      id="alertes"
      className={`alertes-page${isVisible ? ' alertes-page--visible' : ''}`}
      aria-labelledby="alertes-title"
    >
      <div className="alertes-page__inner">
        <header className="alertes-page__hero">
          <p className="alertes-page__eyebrow">Opportunités</p>
          <h1 id="alertes-title">Alertes</h1>
          <p className="alertes-page__lead">
            Bourses, inscriptions, événements, appels et autres annonces utiles aux
            talents de Côte d’Ivoire Skills.
          </p>
        </header>

        <section className="alertes-page__types" aria-label="Filtrer les alertes">
          <button
            type="button"
            className={`alertes-type alertes-type--all${typeId === null ? ' is-active' : ''}`}
            onClick={() => setTypeId(null)}
            aria-pressed={typeId === null}
            aria-label={`Toutes les alertes (${totalItems})`}
            title="Toutes"
          >
            <span className="alertes-type__icon" aria-hidden="true">
              <FaBell />
            </span>
            <span className="alertes-type__body">
              <strong>Toutes</strong>
            </span>
            <span className="alertes-type__count">{totalItems}</span>
          </button>
          {knownTypes.map((type) => {
            const tone = getAnnonceTypeTone(type.name)
            const Icon = TONE_ICONS[tone]
            const label = formatAnnonceTypeLabel(type.name)
            const active = typeId === type.id
            const count = typeId === type.id ? totalItems : (typeCounts[type.id] ?? 0)
            return (
              <button
                key={type.id}
                type="button"
                className={`alertes-type alertes-type--${tone}${active ? ' is-active' : ''}`}
                onClick={() => setTypeId(type.id)}
                aria-pressed={active}
                aria-label={`${label} (${count})`}
                title={label}
              >
                <span className="alertes-type__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="alertes-type__body">
                  <strong>
                    <span className="alertes-type__label-full">{label}</span>
                    <span className="alertes-type__label-short">{label}</span>
                  </strong>
                </span>
                <span className="alertes-type__count">{count}</span>
              </button>
            )
          })}
        </section>

        <div className="alertes-page__toolbar">
          <label className="alertes-page__search">
            <FaMagnifyingGlass aria-hidden="true" />
            <span className="visually-hidden">Rechercher une alerte</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un titre, un lieu…"
            />
          </label>
        </div>

        {isInitialLoading ? <PageLoader label="Chargement des alertes…" /> : null}

        {!isInitialLoading && annoncesQuery.isError ? (
          <p className="alertes-page__status alertes-page__status--error">
            Impossible de charger les alertes pour le moment.
          </p>
        ) : null}

        {!isInitialLoading && !annoncesQuery.isError ? (
          <p className="alertes-page__count">
            {filteredItems.length === 0
              ? 'Aucune alerte ne correspond à votre recherche.'
              : `${filteredItems.length} alerte${filteredItems.length > 1 ? 's' : ''} affichée${filteredItems.length > 1 ? 's' : ''}${hasMore ? ` sur ${totalItems}` : ''}`}
          </p>
        ) : null}

        {!isInitialLoading && filteredItems.length === 0 && !annoncesQuery.isError ? (
          <div className="alertes-page__empty">
            <FaBell aria-hidden="true" />
            <p>Essayez un autre type ou un autre mot-clé.</p>
            <button
              type="button"
              className="ui-btn ui-btn--primary"
              onClick={() => {
                setTypeId(null)
                setQuery('')
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : null}

        {filteredItems.length > 0 ? (
          <ul className="alertes-page__grid">
            {filteredItems.map((item) => {
              const tone = getAnnonceTypeTone(item.type?.name ?? '')
              const Icon = TONE_ICONS[tone]
              const label = formatAnnonceTypeLabel(item.type?.name ?? 'Autre')
              const status = getDeadlineStatus(item.endDate)
              const recent = isRecentAlerte(item.createdAt)
              const cover = item.imageUrls?.find(Boolean)
              return (
                <li key={item.id}>
                  <article className={`alertes-card alertes-card--${tone}`}>
                    {cover ? (
                      <a className="alertes-card__cover" href={alerteDetailPath(item.id)}>
                        <img src={cover} alt="" loading="lazy" decoding="async" />
                      </a>
                    ) : null}
                    <div className="alertes-card__body">
                      <div className="alertes-card__meta">
                        <span className={`alertes-badge alertes-badge--${tone}`}>
                          <Icon aria-hidden="true" />
                          {label}
                        </span>
                        <span className={`alertes-deadline alertes-deadline--${status}`}>
                          {deadlineLabel(status)}
                        </span>
                        {recent ? <span className="alertes-new">Nouveau</span> : null}
                      </div>
                      <h2>
                        <a href={alerteDetailPath(item.id)}>{item.title}</a>
                      </h2>
                      <p className="alertes-card__summary">{item.description}</p>
                      <ul className="alertes-card__facts">
                        {item.place ? (
                          <li>
                            <FaLocationDot aria-hidden="true" />
                            {item.place}
                          </li>
                        ) : null}
                        <li>
                          <FaCalendarDays aria-hidden="true" />
                          {item.endDate
                            ? `Limite : ${formatAlerteDate(item.endDate)}`
                            : 'Sans date limite'}
                        </li>
                      </ul>
                      <a className="alertes-card__cta" href={alerteDetailPath(item.id)}>
                        Consulter l’alerte
                      </a>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        ) : null}

        <div className="alertes-page__loading" aria-live="polite">
          {hasMore ? (
            <>
              <p>
                {annoncesQuery.isFetchingNextPage
                  ? 'Chargement des alertes…'
                  : 'Faites défiler pour charger plus d’alertes…'}
              </p>
              <div ref={sentinelRef} className="alertes-page__sentinel" aria-hidden="true" />
            </>
          ) : null}
        </div>
      </div>
    </main>
  )
}
