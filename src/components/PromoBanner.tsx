import type { ReactNode } from 'react'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './PromoBanner.css'

type PromoBannerProps = {
  title?: string
  subtitle?: string
  ctaHref?: string
  ctaLabel?: string
  ctaOnClick?: () => void
  showCta?: boolean
  secondaryCtaLabel?: string
  secondaryCtaOnClick?: () => void
  showSecondaryCta?: boolean
  /** Message à la place du CTA principal (ex. candidature déjà soumise). */
  statusNotice?: string | null
  criteria?: readonly string[]
  criteriaTitle?: string
  children?: ReactNode
}

export function PromoBanner({
  title = 'FORMATION – INNOVATION – EMPLOYABILITE DES JEUNES',
  subtitle = 'Finale nationale · 02—04 octobre 2026 · Parc des Expositions d\'Abidjan',
  ctaHref = '/competition',
  ctaLabel = 'Découvrir le programme',
  ctaOnClick,
  showCta = true,
  secondaryCtaLabel = 'Devenir expert',
  secondaryCtaOnClick,
  showSecondaryCta = false,
  statusNotice,
  criteria,
  criteriaTitle = 'Conditions de participation',
  children,
}: PromoBannerProps) {
  const { ref, isVisible } = useRevealOnView<HTMLDivElement>()
  const showPrimary = Boolean(showCta && !statusNotice)
  const showSecondary = Boolean(showSecondaryCta && secondaryCtaOnClick)
  const showActions = Boolean(statusNotice || showPrimary || showSecondary)

  return (
    <div
      ref={ref}
      className={`site-promo-banner site-promo-banner--ws${isVisible ? ' site-promo-banner--reveal' : ''}${
        criteria?.length ? ' site-promo-banner--with-criteria' : ''
      }`}
      role="region"
      aria-label="Événement à venir"
    >
      <div className="site-promo-banner__content">
        <p className="site-promo-banner__subtitle">{subtitle}</p>
        <h2 className="site-promo-banner__title">{title}</h2>
        {children}
        {criteria && criteria.length > 0 ? (
          <div className="site-promo-banner__criteria">
            <h3 className="site-promo-banner__criteria-title">{criteriaTitle}</h3>
            <ul className="site-promo-banner__criteria-list">
              {criteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {showActions ? (
          <div className="site-promo-banner__actions">
            {statusNotice ? (
              <p className="site-promo-banner__status" role="status">
                {statusNotice}
              </p>
            ) : null}
            {showPrimary ? (
              ctaOnClick ? (
                <button
                  type="button"
                  className="site-promo-banner__cta site-promo-banner__cta--button"
                  onClick={ctaOnClick}
                >
                  {ctaLabel}
                </button>
              ) : (
                <a className="site-promo-banner__cta" href={ctaHref}>
                  {ctaLabel}
                </a>
              )
            ) : null}
            {showSecondary ? (
              <button
                type="button"
                className="site-promo-banner__cta site-promo-banner__cta--secondary site-promo-banner__cta--button"
                onClick={secondaryCtaOnClick}
              >
                {secondaryCtaLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
