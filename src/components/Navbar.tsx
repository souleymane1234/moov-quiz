import { useCallback, useEffect, useState } from 'react'
import { FaMagnifyingGlass, FaUser } from 'react-icons/fa6'
import { getAuthEventName, isCandidateLoggedIn, logoutCandidate } from '../lib/candidate-auth'
import { clearAuthSession } from '../lib/auth-session'
import { isMediaDetailPath, MEDIA_HUB_PATHS } from '../lib/media-hubs'
import { SEARCH_PAGE_PATH } from '../lib/search'
import { SearchOverlay } from './SearchOverlay'
import './Navbar.css'

const SCROLL_SOLID_THRESHOLD_PX = 32

const SUBPAGE_PREFIXES = [
  ...MEDIA_HUB_PATHS,
  '/competition',
  '/concours',
  '/metiers',
  '/partenariat',
  '/contact',
  '/connexion',
  '/inscription',
  '/inscription-candidat',
  '/inscription-expert',
  '/candidature',
  '/profil',
  '/showroom',
  '/vote',
  SEARCH_PAGE_PATH,
] as const

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [candidateLoggedIn, setCandidateLoggedIn] = useState(() => isCandidateLoggedIn())
  const [searchOpen, setSearchOpen] = useState(false)
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const pathname = window.location.pathname
  const hash = window.location.hash

  const isSubPage = SUBPAGE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
  const isMediaDetail = isMediaDetailPath(pathname)
  const homePrefix = isSubPage || isMediaDetail ? '/#' : '#'

  const navLinks = [
    { href: `${homePrefix}accueil`, label: 'Accueil' },
    { href: '/competition', label: 'Compétitions' },
    { href: '/actualites', label: 'Actualités' },
    { href: '/alertes', label: 'Alertes' },
    { href: '/play', label: 'Play' },
    { href: '/reels', label: 'Reels' },
    { href: '/partenariat', label: 'Partenariat' },
    ...(candidateLoggedIn
      ? [{ href: '/profil', label: 'Profil' }]
      : [{ href: '/inscription', label: 'Inscription' }]),
  ]

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_SOLID_THRESHOLD_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onAuthChanged = () => setCandidateLoggedIn(isCandidateLoggedIn())
    window.addEventListener(getAuthEventName(), onAuthChanged)
    window.addEventListener('storage', onAuthChanged)
    return () => {
      window.removeEventListener(getAuthEventName(), onAuthChanged)
      window.removeEventListener('storage', onAuthChanged)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMenuOpen(false)
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const searchInitialQuery =
    pathname === SEARCH_PAGE_PATH
      ? new URLSearchParams(window.location.search).get('q') ?? ''
      : ''

  const isSolid =
    isSubPage || isMediaDetail || scrolled || menuOpen

  const isLinkActive = (href: string) => {
    if (href.includes('#accueil')) {
      return pathname === '/' && (hash === '' || hash === '#accueil')
    }
    if (href === '/actualites') {
      return pathname === '/actualites' || pathname.startsWith('/actualites/')
    }
    if (href === '/inscription') {
      return pathname === '/inscription' || pathname.startsWith('/inscription/')
    }
    if (href === '/connexion') {
      return pathname === '/connexion' || pathname.startsWith('/connexion/')
    }
    if (href === '/partenariat') {
      return (
        pathname === '/partenariat' ||
        pathname.startsWith('/partenariat/') ||
        pathname === '/contact' ||
        pathname.startsWith('/contact/')
      )
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className={`site-navbar${isSolid ? ' site-navbar--solid' : ''}`}>
      <a
        className="site-navbar__brand"
        href="/#accueil"
        onClick={() => setMenuOpen(false)}
      >
        <img
          className="site-navbar__logo site-navbar__logo--arms"
          src="/Amoirie.png"
          width={140}
          height={140}
          alt="Armoiries de la République de Côte d'Ivoire"
        />
        <span className="site-navbar__divider" aria-hidden="true" />
        <img
          className="site-navbar__logo site-navbar__logo--skills"
          src="/logo.png"
          width={280}
          height={72}
          alt="WorldSkills Côte d'Ivoire — Les Olympiades des Métiers"
        />
      </a>

      <div className="site-navbar__actions">
        <button
          type="button"
          className="site-navbar__search-btn"
          aria-label="Rechercher"
          title="Rechercher (Ctrl + K)"
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          onClick={() => {
            setMenuOpen(false)
            setSearchOpen(true)
          }}
        >
          <FaMagnifyingGlass aria-hidden="true" />
        </button>

        <button
          type="button"
          className="site-navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-navbar-menu"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-navbar__toggle-bar" />
          <span className="site-navbar__toggle-bar" />
          <span className="site-navbar__toggle-bar" />
        </button>
      </div>

      <nav
        id="site-navbar-menu"
        className={`site-navbar__nav${menuOpen ? ' site-navbar__nav--open' : ''}`}
        aria-label="Navigation principale"
      >
        <ul className="site-navbar__list">
          {navLinks.map(({ href, label }) => (
            <li key={href + label}>
              <a
                className={`site-navbar__link${label === 'Inscription' ? ' site-navbar__link--cta' : ''}${isLinkActive(href) ? ' site-navbar__link--active' : ''}`}
                href={href}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
          {candidateLoggedIn ? (
            <li>
              <button
                type="button"
                className="site-navbar__link site-navbar__link--logout"
                onClick={() => {
                  setMenuOpen(false)
                  clearAuthSession()
                  logoutCandidate()
                  window.location.href = '/'
                }}
              >
                Déconnexion
              </button>
            </li>
          ) : (
            <li>
              <a
                className={`site-navbar__icon-btn${isLinkActive('/connexion') ? ' is-active' : ''}`}
                href="/connexion"
                aria-label="Connexion"
                title="Connexion"
                onClick={() => setMenuOpen(false)}
              >
                <FaUser aria-hidden="true" />
                <span className="site-navbar__icon-btn-label">Connexion</span>
              </a>
            </li>
          )}
        </ul>
      </nav>

      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        initialQuery={searchInitialQuery}
      />
    </header>
  )
}
