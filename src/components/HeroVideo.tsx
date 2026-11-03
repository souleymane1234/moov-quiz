import { useEffect, useRef, useState } from 'react'
import './HeroVideo.css'

const DEFAULT_SRC = '/worldskills.mp4'
const DEFAULT_SUBTITLE = 'Olympiades des métiers'
const DEFAULT_TITLE = 'WorldSkills Côte d\'Ivoire'

type HeroVideoProps = {
  src?: string
  poster?: string
  subtitle?: string
  title?: string
  /** Lecture avec controles (video de presentation d'edition) */
  controls?: boolean
  /** Active le son en haut de page, puis le coupe au scroll */
  soundOnTopMuteOnScroll?: boolean
  /** Affiche le titre / sous-titre / boutons au-dessus de la video */
  showOverlay?: boolean
}

export function HeroVideo({
  src = DEFAULT_SRC,
  poster,
  subtitle = DEFAULT_SUBTITLE,
  title = DEFAULT_TITLE,
  controls = false,
  soundOnTopMuteOnScroll = false,
  showOverlay = true,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [soundLockedByBrowser, setSoundLockedByBrowser] = useState(
    Boolean(soundOnTopMuteOnScroll && !controls),
  )
  // Toujours démarrer muet : l’autoplay avec son est bloqué par les navigateurs.
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    if (!soundOnTopMuteOnScroll || controls) return

    const onScroll = () => {
      const scrolled = window.scrollY > 8
      setIsScrolled(scrolled)
      const video = videoRef.current
      if (!video || soundLockedByBrowser) return
      video.muted = scrolled
      setIsMuted(scrolled)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [soundOnTopMuteOnScroll, controls, soundLockedByBrowser])

  useEffect(() => {
    const video = videoRef.current
    if (!video || controls) return

    let cancelled = false

    const tryPlayMuted = async () => {
      video.muted = true
      video.defaultMuted = true
      video.setAttribute('muted', '')
      try {
        await video.play()
        if (cancelled) return
        setIsMuted(true)
        if (soundOnTopMuteOnScroll) {
          setSoundLockedByBrowser(true)
        }
      } catch {
        // Retry once media can play (fichier lourd / buffer pas prêt)
      }
    }

    const onCanPlay = () => {
      void tryPlayMuted()
    }

    void tryPlayMuted()
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('loadeddata', onCanPlay)

    return () => {
      cancelled = true
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('loadeddata', onCanPlay)
    }
  }, [controls, src, soundOnTopMuteOnScroll])

  useEffect(() => {
    if (!soundOnTopMuteOnScroll || controls) return

    const unlockSound = () => {
      if (isScrolled) return
      const video = videoRef.current
      if (!video) return
      video.muted = false
      video.defaultMuted = false
      video.volume = 1
      setSoundLockedByBrowser(false)
      setIsMuted(false)
      void video.play().catch(() => {
        // No-op
      })
    }

    // Débloque le son dès le premier geste utilisateur (politique navigateurs)
    const opts: AddEventListenerOptions = { once: true, capture: true }
    window.addEventListener('pointerdown', unlockSound, opts)
    window.addEventListener('touchstart', unlockSound, opts)
    window.addEventListener('keydown', unlockSound, opts)
    window.addEventListener('click', unlockSound, opts)
    return () => {
      window.removeEventListener('pointerdown', unlockSound, true)
      window.removeEventListener('touchstart', unlockSound, true)
      window.removeEventListener('keydown', unlockSound, true)
      window.removeEventListener('click', unlockSound, true)
    }
  }, [soundOnTopMuteOnScroll, controls, isScrolled, src])

  const enableSound = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.defaultMuted = false
    video.volume = 1
    setSoundLockedByBrowser(false)
    setIsMuted(false)
    void video.play().catch(() => {
      // No-op
    })
  }

  return (
    <div className={`site-hero-video${controls ? ' site-hero-video--controls' : ''}`}>
      <video
        ref={videoRef}
        className="site-hero-video__media"
        src={src}
        poster={poster}
        autoPlay={!controls}
        muted={isMuted}
        loop={!controls}
        controls={controls}
        playsInline
        preload="metadata"
        aria-label="Vidéo de présentation WorldSkills Côte d'Ivoire"
      />

      {soundOnTopMuteOnScroll && !controls && soundLockedByBrowser && !isScrolled ? (
        <button
          type="button"
          className="site-hero-video__sound-btn"
          onClick={enableSound}
          aria-label="Activer le son de la vidéo"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a3.5 3.5 0 0 0-1.8-3.05v6.1A3.5 3.5 0 0 0 16.5 12zM14 4.23v2.06a5.5 5.5 0 0 1 0 11.42v2.06A7.5 7.5 0 0 0 14 4.23z"
            />
          </svg>
          Activer le son
        </button>
      ) : null}

      {showOverlay ? (
        <div className="site-hero-video__overlay">
          <p className="site-hero-video__subtitle">{subtitle}</p>
          <h1 className="site-hero-video__title">{title}</h1>
          {!controls ? (
            <div className="site-hero-video__actions">
              <a className="ui-btn ui-btn--primary" href="/inscription">
                Je m&apos;inscris
              </a>
              <a className="ui-btn ui-btn--ghost" href="/competition">
                Découvrir la compétition
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
