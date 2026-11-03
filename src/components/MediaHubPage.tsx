import { useEffect, useMemo, useRef, useState } from 'react'
import { FaCirclePlay } from 'react-icons/fa6'
import { USE_MOCK_NEWS } from '../config/app-config'
import { ACTUALITES } from '../data/actualites'
import { useNewsFeedInfinite } from '../hooks/use-news-queries'
import { youtubeEmbedUrl } from '../lib/media-embed'
import { getMediaHubFromPath, type MediaHub } from '../lib/media-hubs'
import {
  mapFeedItemsToCards,
  mapNewsItemToPost,
  type NewsFeedCard,
  type NewsPostCard,
} from '../lib/map-news'
import { PageLoader } from './PageLoader'
import './ActualitesPage.css'
import './MediaHubPage.css'

const MOCK_PAGE_SIZE = 5

const LEFT_ASIDE_SLIDES = [
  { src: '/trustCaroussel/Booz.png', alt: 'Booz' },
  { src: '/trustCaroussel/Prosuma.png', alt: 'Prosuma' },
  { src: '/trustCaroussel/Daikin.png', alt: 'Daikin' },
  { src: '/trustCaroussel/Eliwood.png', alt: 'Eliwood' },
] as const

const RIGHT_ASIDE_SLIDES = [
  { src: '/trustCaroussel/festo.webp', alt: 'Festo' },
  { src: '/trustCaroussel/Gipame.png', alt: 'Gipame' },
  { src: '/trustCaroussel/OIPI.png', alt: 'OIPI' },
  { src: '/trustCaroussel/ortt.png', alt: 'ORTT' },
] as const

function isPostCard(item: NewsFeedCard): item is NewsPostCard {
  return item.type === 'post'
}

function MediaEmbed({
  src,
  poster,
  title,
  className,
}: {
  src?: string
  poster?: string
  title: string
  className?: string
}) {
  const youtube = src ? youtubeEmbedUrl(src) : null
  if (youtube) {
    return (
      <iframe
        className={className}
        src={youtube}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    )
  }
  if (src) {
    return (
      <video
        className={className}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
      />
    )
  }
  if (poster) {
    return <img className={className} src={poster} alt={title} loading="lazy" decoding="async" />
  }
  return (
    <div className={`${className ?? ''} media-embed--empty`.trim()}>
      Média bientôt disponible
    </div>
  )
}

function SideAd({
  label,
  slides,
  index,
}: {
  label: string
  slides: readonly { src: string; alt: string }[]
  index: number
}) {
  return (
    <aside className="actu-page__aside" aria-label={label}>
      <article className="actu-side-ad">
        <p>{label === 'Publicites gauche' ? 'Publicite' : 'Annonce'}</p>
        <div className="actu-side-ad__slider">
          <img src={slides[index].src} alt={slides[index].alt} loading="lazy" decoding="async" />
          <div className="actu-side-ad__dots" aria-hidden="true">
            {slides.map((_, slideIndex) => (
              <span
                key={`${label}-dot-${slideIndex}`}
                className={`actu-side-ad__dot${index === slideIndex ? ' is-active' : ''}`}
              />
            ))}
          </div>
        </div>
      </article>
    </aside>
  )
}

function FeedCards({
  items,
  hub,
}: {
  items: NewsFeedCard[]
  hub: MediaHub
}) {
  return (
    <ul className="actu-page__feed">
      {items.map((item) => (
        <li key={item.id}>
          {item.type === 'post' ? (
            <article className={`actu-card${hub.id === 'alertes' ? ' actu-card--alert' : ''}`}>
              <div className="actu-card__top">
                <div className="actu-card__avatar" aria-hidden="true">
                  <img src="/logo.png" alt="" width={40} height={40} />
                </div>
                <div>
                  <p className="actu-card__author">{item.author}</p>
                  <p className="actu-card__meta">
                    {hub.id === 'alertes' ? 'Alerte' : item.role} · {item.time || 'Publié'}
                  </p>
                </div>
              </div>

              <h2 className="actu-card__headline">{item.title}</h2>
              <p className="actu-card__text">{item.text}</p>

              {item.imageSrc ? (
                <img
                  className="actu-card__image"
                  src={item.imageSrc}
                  alt={item.imageAlt || item.title}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}

              <footer className="actu-card__footer">
                <a className="actu-card__read" href={item.detailHref}>
                  {hub.readLabel}
                </a>
              </footer>
            </article>
          ) : (
            <article className="actu-ad">
              <p className="actu-ad__label">{item.label}</p>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <img
                className="actu-ad__image"
                src={item.imageSrc}
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
              />
              <footer className="actu-card__footer">
                <a className="actu-card__read" href={item.href}>
                  {item.cta}
                </a>
              </footer>
            </article>
          )}
        </li>
      ))}
    </ul>
  )
}

function PlayGrid({ items, hub }: { items: NewsPostCard[]; hub: MediaHub }) {
  return (
    <ul className="media-play-grid">
      {items.map((item) => (
        <li key={item.id}>
          <article className="media-play-card">
            <div className="media-play-card__media">
              <MediaEmbed
                src={item.videoSrc}
                poster={item.imageSrc}
                title={item.title}
                className="media-play-card__embed"
              />
              {item.videoSrc ? null : (
                <span className="media-play-card__play" aria-hidden="true">
                  <FaCirclePlay />
                </span>
              )}
            </div>
            <div className="media-play-card__body">
              <h2>{item.title}</h2>
              <p>
                {item.time || 'Publié'}
                {item.role ? ` · ${item.role}` : ''}
              </p>
              <a className="actu-card__read" href={item.detailHref}>
                {hub.readLabel}
              </a>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

function ReelsGrid({ items, hub }: { items: NewsPostCard[]; hub: MediaHub }) {
  return (
    <ul className="media-reels-grid">
      {items.map((item) => (
        <li key={item.id}>
          <article className="media-reel-card">
            <MediaEmbed
              src={item.videoSrc}
              poster={item.imageSrc}
              title={item.title}
              className="media-reel-card__embed"
            />
            <div className="media-reel-card__body">
              <h2>{item.title}</h2>
              <p>{item.time || 'Publié'}</p>
              <a className="actu-card__read" href={item.detailHref}>
                {hub.readLabel}
              </a>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

export function MediaHubPage() {
  const hub = getMediaHubFromPath(window.location.pathname)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const newsQuery = useNewsFeedInfinite(
    USE_MOCK_NEWS
      ? undefined
      : {
          module: hub.module,
          sortBy: 'date',
        },
  )

  const apiItems = useMemo<NewsFeedCard[]>(() => {
    if (!newsQuery.data?.pages) return []
    return newsQuery.data.pages.flatMap((page) =>
      mapFeedItemsToCards(page.data, hub.path),
    )
  }, [hub.path, newsQuery.data])

  const mockItems = useMemo<NewsFeedCard[]>(() => {
    const sorted = [...ACTUALITES].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    )
    return sorted.slice(0, MOCK_PAGE_SIZE).map((item) =>
      mapNewsItemToPost(
        {
          id: String(item.id),
          contentType: 'news',
          title: item.title,
          summary: item.description,
          mainImage: item.image,
          author: item.source,
          publishedAt: item.publishedAt,
          slug: item.slug,
          views: 0,
          category: { id: item.category, name: item.category },
        },
        hub.path,
      ),
    )
  }, [hub.path])

  const items = USE_MOCK_NEWS ? mockItems : apiItems
  const posts = items.filter(isPostCard)
  const hasMore = !USE_MOCK_NEWS && Boolean(newsQuery.hasNextPage)
  const isInitialLoading = !USE_MOCK_NEWS && newsQuery.isLoading && items.length === 0
  const showAsides = hub.layout === 'feed'
  const [leftSlideIndex, setLeftSlideIndex] = useState(0)
  const [rightSlideIndex, setRightSlideIndex] = useState(0)

  useEffect(() => {
    if (!showAsides) return
    const timer = window.setInterval(() => {
      setLeftSlideIndex((i) => (i + 1) % LEFT_ASIDE_SLIDES.length)
      setRightSlideIndex((i) => (i + 1) % RIGHT_ASIDE_SLIDES.length)
    }, 3800)
    return () => window.clearInterval(timer)
  }, [showAsides])

  useEffect(() => {
    if (USE_MOCK_NEWS) return
    const target = sentinelRef.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (!newsQuery.isFetchingNextPage) {
          void newsQuery.fetchNextPage()
        }
      },
      { rootMargin: '120px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, newsQuery.fetchNextPage, newsQuery.isFetchingNextPage])

  return (
    <main
      id={hub.id}
      className={`actu-page media-hub media-hub--${hub.layout}`}
      aria-labelledby="media-hub-title"
    >
      <div className={`actu-page__layout${showAsides ? '' : ' media-hub__layout--wide'}`}>
        {showAsides ? (
          <SideAd label="Publicites gauche" slides={LEFT_ASIDE_SLIDES} index={leftSlideIndex} />
        ) : null}

        <div className="actu-page__inner media-hub__inner">
          <header className="actu-page__header">
            <h1 id="media-hub-title">{hub.title}</h1>
          </header>

          {isInitialLoading ? <PageLoader label={hub.loadingLabel} /> : null}
          {!USE_MOCK_NEWS && newsQuery.isError ? (
            <p className="actu-page__status actu-page__status--error">{hub.errorLabel}</p>
          ) : null}

          {!isInitialLoading && items.length === 0 ? (
            <p className="actu-page__status">{hub.emptyLabel}</p>
          ) : null}

          {hub.layout === 'feed' ? <FeedCards items={items} hub={hub} /> : null}
          {hub.layout === 'play' ? <PlayGrid items={posts} hub={hub} /> : null}
          {hub.layout === 'reels' ? <ReelsGrid items={posts} hub={hub} /> : null}

          <div className="actu-page__loading" aria-live="polite">
            {hasMore ? (
              <>
                <p>
                  {newsQuery.isFetchingNextPage
                    ? 'Chargement des publications…'
                    : 'Faites defiler pour charger plus de publications…'}
                </p>
                <div ref={sentinelRef} className="actu-page__sentinel" aria-hidden="true" />
              </>
            ) : null}
          </div>
        </div>

        {showAsides ? (
          <SideAd label="Publicites droite" slides={RIGHT_ASIDE_SLIDES} index={rightSlideIndex} />
        ) : null}
      </div>
    </main>
  )
}
