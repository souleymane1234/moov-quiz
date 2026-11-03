import { useMemo, type ReactNode } from 'react'
import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import './ProfileBanner.css'

export type ProfileBannerSocialLink = {
  platform?: string | null
  url?: string | null
  logoUrl?: string | null
}

type ProfileBannerProps = {
  titleId: string
  eyebrow: string
  name: string
  coverSrc?: string | null
  avatarSrc?: string | null
  avatarFallbackSrc?: string
  avatarInitials?: string
  socialLinks?: ProfileBannerSocialLink[] | null
  back?: { href: string; label: string; ariaLabel?: string }
  aside?: ReactNode
  children?: ReactNode
}

function normalizeExternalUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function socialPlatformKey(platform: string): string {
  const key = platform.trim().toLowerCase()
  if (key.includes('facebook') || key === 'fb') return 'facebook'
  if (key.includes('instagram') || key === 'ig') return 'instagram'
  if (key.includes('linkedin') || key === 'in') return 'linkedin'
  if (key.includes('tiktok')) return 'tiktok'
  if (key.includes('youtube') || key === 'yt') return 'youtube'
  if (key.includes('twitter') || key === 'x' || key.includes('x.com')) return 'x'
  return 'default'
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
}

function SocialPlatformIcon({ tone }: { tone: string }) {
  switch (tone) {
    case 'facebook':
      return <FaFacebookF aria-hidden="true" />
    case 'instagram':
      return <FaInstagram aria-hidden="true" />
    case 'linkedin':
      return <FaLinkedinIn aria-hidden="true" />
    case 'tiktok':
      return <FaTiktok aria-hidden="true" />
    case 'youtube':
      return <FaYoutube aria-hidden="true" />
    case 'x':
      return <FaXTwitter aria-hidden="true" />
    default:
      return <FaGlobe aria-hidden="true" />
  }
}

export function ProfileBanner({
  titleId,
  eyebrow,
  name,
  coverSrc,
  avatarSrc,
  avatarFallbackSrc = '/logo-worldskills.svg',
  avatarInitials,
  socialLinks,
  back,
  aside,
  children,
}: ProfileBannerProps) {
  const links = useMemo(() => {
    const seen = new Set<string>()
    const out: Array<{
      id: string
      tone: string
      label: string
      href: string
      logoUrl?: string | null
    }> = []
    for (const link of socialLinks ?? []) {
      const href = normalizeExternalUrl(link?.url ?? '')
      if (!href || seen.has(href)) continue
      seen.add(href)
      const platform = link.platform?.trim() || 'Lien'
      const tone = socialPlatformKey(platform)
      out.push({
        id: `${platform}-${href}`,
        tone,
        label: SOCIAL_LABELS[tone] ?? (platform || 'Réseau social'),
        href,
        logoUrl: link.logoUrl,
      })
    }
    return out
  }, [socialLinks])

  const cover = coverSrc?.trim()
  const avatar = avatarSrc?.trim()

  return (
    <header className="showroom-page__profile-banner">
      <div className="showroom-page__cover">
        {cover ? (
          <img
            className="showroom-page__cover-img"
            src={cover}
            alt=""
            aria-hidden="true"
          />
        ) : null}
        <div className="showroom-page__cover-shade" />
        {back ? (
          <a
            href={back.href}
            className="showroom-page__cover-back"
            aria-label={back.ariaLabel ?? back.label}
          >
            <span className="showroom-page__cover-back-icon" aria-hidden="true">←</span>
            <span className="showroom-page__cover-back-text">{back.label}</span>
          </a>
        ) : null}
      </div>

      <div className="showroom-page__profile-bar">
        <div className="showroom-page__avatar-wrap">
          {avatar || !avatarInitials ? (
            <img
              className="showroom-page__avatar"
              src={avatar || avatarFallbackSrc}
              alt={name}
              onError={(event) => {
                const img = event.currentTarget
                if (img.dataset.fallbackApplied === '1') return
                img.dataset.fallbackApplied = '1'
                img.src = avatarFallbackSrc
              }}
            />
          ) : (
            <div
              className="showroom-page__avatar showroom-page__avatar--initials"
              role="img"
              aria-label={name}
            >
              {avatarInitials}
            </div>
          )}
        </div>

        <div className="showroom-page__profile-body">
          <div className="showroom-page__profile-head">
            <div className="showroom-page__identity">
              <p className="showroom-page__eyebrow">{eyebrow}</p>
              <h1 id={titleId}>{name}</h1>
              {links.length > 0 ? (
                <ul className="showroom-page__socials" aria-label="Réseaux sociaux">
                  {links.map((link) => (
                    <li key={link.id}>
                      <a
                        className={`showroom-page__social-link showroom-page__social-link--${link.tone}`}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${link.label} (ouvre dans un nouvel onglet)`}
                        title={link.label}
                      >
                        {link.logoUrl?.trim() ? (
                          <img
                            className="showroom-page__social-logo"
                            src={link.logoUrl}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <SocialPlatformIcon tone={link.tone} />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {children}
            </div>
            {aside}
          </div>
        </div>
      </div>
    </header>
  )
}
