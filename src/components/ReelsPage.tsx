import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaCommentDots,
  FaEye,
  FaHeart,
  FaVolumeHigh,
  FaVolumeXmark,
} from 'react-icons/fa6'
import { useReelsInfinite } from '../hooks/use-reels-queries'
import type { VideoListItemDto } from '../lib/api/modules/video/video.types'
import {
  formatCompactCount,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
} from '../lib/media-embed'
import { videoApi } from '../services/api-client'
import { PageLoader } from './PageLoader'
import './ReelsPage.css'

const PREFETCH_FROM_END = 3

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes('/uploads/')
}

function ReelMedia({
  video,
  active,
  muted,
}: {
  video: VideoListItemDto
  active: boolean
  muted: boolean
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const source = video.sourceType?.toUpperCase() ?? ''
  const isYoutube =
    source === 'YOUTUBE' ||
    video.url.includes('youtube') ||
    video.url.includes('youtu.be')
  const isVimeo = source === 'VIMEO' || video.url.includes('vimeo.com')
  const youtube = isYoutube
    ? youtubeEmbedUrl(video.url, {
        autoplay: active,
        mute: muted,
        loop: true,
        controls: false,
      })
    : null
  const vimeo = isVimeo ? vimeoEmbedUrl(video.url) : null
  const direct =
    source === 'UPLOAD' ||
    source === 'AUTRE' ||
    isDirectVideoUrl(video.url) ||
    (!isYoutube && !isVimeo)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (active) {
      el.muted = muted
      void el.play().catch(() => undefined)
    } else {
      el.pause()
      try {
        el.currentTime = 0
      } catch {
        /* ignore */
      }
    }
  }, [active, muted])

  if (youtube) {
    if (!active) {
      return (
        <div
          className="reels-slide__fallback"
          style={
            video.thumbnailUrl
              ? { backgroundImage: `url(${video.thumbnailUrl})` }
              : undefined
          }
        />
      )
    }
    return (
      <iframe
        className="reels-slide__media"
        src={youtube}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    )
  }

  if (vimeo) {
    if (!active) {
      return (
        <div
          className="reels-slide__fallback"
          style={
            video.thumbnailUrl
              ? { backgroundImage: `url(${video.thumbnailUrl})` }
              : undefined
          }
        />
      )
    }
    return (
      <iframe
        className="reels-slide__media"
        src={vimeo}
        title={video.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (direct) {
    return (
      <video
        ref={videoRef}
        className="reels-slide__media"
        src={video.url}
        poster={video.thumbnailUrl ?? undefined}
        playsInline
        loop
        muted={muted}
        preload={active ? 'auto' : 'metadata'}
      />
    )
  }

  return (
    <div
      className="reels-slide__fallback"
      style={
        video.thumbnailUrl
          ? { backgroundImage: `url(${video.thumbnailUrl})` }
          : undefined
      }
    >
      <p>{active ? 'Lecture indisponible pour cette source' : video.title}</p>
    </div>
  )
}

function ReelSlide({
  video,
  active,
  muted,
  onToggleMute,
}: {
  video: VideoListItemDto
  active: boolean
  muted: boolean
  onToggleMute: () => void
}) {
  return (
    <article className="reels-slide" data-video-id={video.id}>
        <div className="reels-slide__stage">
          <ReelMedia video={video} active={active} muted={muted} />
          <div className="reels-slide__scrim" aria-hidden="true" />

        <div className="reels-slide__meta">
          {video.category?.name ? (
            <p className="reels-slide__category">{video.category.name}</p>
          ) : null}
          <h2>{video.title}</h2>
          {video.description ? <p className="reels-slide__desc">{video.description}</p> : null}
          {video.tags && video.tags.length > 0 ? (
            <p className="reels-slide__tags">
              {video.tags.slice(0, 4).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </p>
          ) : null}
        </div>

        <aside className="reels-slide__actions" aria-label="Actions">
          <button type="button" className="reels-action" onClick={onToggleMute}>
            {muted ? <FaVolumeXmark aria-hidden="true" /> : <FaVolumeHigh aria-hidden="true" />}
            <span>{muted ? 'Muet' : 'Son'}</span>
          </button>
          <div className="reels-action" aria-label={`${video.likesCount ?? 0} likes`}>
            <FaHeart aria-hidden="true" />
            <span>{formatCompactCount(video.likesCount)}</span>
          </div>
          <div className="reels-action" aria-label={`${video.commentsCount ?? 0} commentaires`}>
            <FaCommentDots aria-hidden="true" />
            <span>{formatCompactCount(video.commentsCount)}</span>
          </div>
          <div className="reels-action" aria-label={`${video.views} vues`}>
            <FaEye aria-hidden="true" />
            <span>{formatCompactCount(video.views)}</span>
          </div>
        </aside>
      </div>
    </article>
  )
}

export function ReelsPage() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [muted, setMuted] = useState(true)

  const reelsQuery = useReelsInfinite()
  const videos = useMemo(
    () => reelsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [reelsQuery.data],
  )

  const activeIndex = useMemo(
    () => (activeId ? videos.findIndex((video) => video.id === activeId) : -1),
    [activeId, videos],
  )

  const loadMore = useCallback(() => {
    if (!reelsQuery.hasNextPage || reelsQuery.isFetchingNextPage) return
    void reelsQuery.fetchNextPage()
  }, [
    reelsQuery.hasNextPage,
    reelsQuery.isFetchingNextPage,
    reelsQuery.fetchNextPage,
  ])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (!activeId && videos[0]?.id) setActiveId(videos[0].id)
  }, [videos, activeId])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return

    const slides = Array.from(root.querySelectorAll<HTMLElement>('.reels-slide'))
    if (slides.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const id = (visible.target as HTMLElement).dataset.videoId
        if (id) setActiveId(id)
      },
      { root, threshold: [0.6, 0.75, 0.9] },
    )

    slides.forEach((slide) => observer.observe(slide))
    return () => observer.disconnect()
  }, [videos])

  useEffect(() => {
    if (!activeId || viewedRef.current.has(activeId)) return
    viewedRef.current.add(activeId)
    void videoApi.markViewed(activeId).catch(() => {
      viewedRef.current.delete(activeId)
    })
  }, [activeId])

  useEffect(() => {
    if (activeIndex < 0 || videos.length === 0) return
    if (activeIndex >= videos.length - PREFETCH_FROM_END) {
      loadMore()
    }
  }, [activeIndex, videos.length, loadMore])

  useEffect(() => {
    const root = scrollerRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel || !reelsQuery.hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      { root, rootMargin: '120% 0px', threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [reelsQuery.hasNextPage, loadMore, videos.length])

  const toggleMute = useCallback(() => setMuted((value) => !value), [])

  if (reelsQuery.isLoading && videos.length === 0) {
    return (
      <main className="reels-page reels-page--status">
        <PageLoader label="Chargement des reels…" fullPage />
      </main>
    )
  }

  if (reelsQuery.isError && videos.length === 0) {
    return (
      <main className="reels-page reels-page--status">
        <p className="reels-page__error">
          Impossible de charger les reels pour le moment.
        </p>
      </main>
    )
  }

  if (videos.length === 0) {
    return (
      <main className="reels-page reels-page--status">
        <p className="reels-page__empty">Aucun reel pour le moment.</p>
      </main>
    )
  }

  return (
    <main className="reels-page" aria-label="Reels">
      <div ref={scrollerRef} className="reels-page__scroller">
        {videos.map((video) => (
          <ReelSlide
            key={video.id}
            video={video}
            active={activeId === video.id}
            muted={muted}
            onToggleMute={toggleMute}
          />
        ))}
        <div
          ref={sentinelRef}
          className="reels-page__sentinel"
          aria-hidden="true"
        />
        {reelsQuery.hasNextPage || reelsQuery.isFetchingNextPage ? (
          <div className="reels-page__loading-more" aria-live="polite">
            {reelsQuery.isFetchingNextPage
              ? 'Chargement…'
              : 'Faites défiler pour voir plus de reels…'}
          </div>
        ) : null}
      </div>
    </main>
  )
}
