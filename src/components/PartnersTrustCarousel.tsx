import { useActivePartenaires, type PartnerLogo } from '../hooks/use-partenaires-query'
import './PartnersTrustCarousel.css'

/** @deprecated Prefer PartnerLogo from use-partenaires-query. */
export type TrustLogo = PartnerLogo

type PartnersTrustCarouselProps = {
  /** Ancre #partenaires (accueil). Desactive sur pages dediees qui ont deja l'ancre. */
  includeAnchorId?: boolean
}

export function PartnersTrustCarousel({ includeAnchorId = true }: PartnersTrustCarouselProps) {
  const partnersQuery = useActivePartenaires()
  const logos = partnersQuery.data ?? []

  if (partnersQuery.isLoading || logos.length === 0) return null

  const loopLogos = [...logos, ...logos]

  return (
    <section
      {...(includeAnchorId ? { id: 'partenaires' } : {})}
      className="partners-trust"
      aria-labelledby="partners-trust-title"
    >
      <div className="partners-trust__inner">
        <header className="partners-trust__header">
          <h2 id="partners-trust-title" className="partners-trust__title">
            Ils nous font confiance
          </h2>
        </header>

        <div className="partners-trust__viewport" aria-label="Logos partenaires">
          <div className="partners-trust__track">
            {loopLogos.map((logo, index) => {
              const isDuplicate = index >= logos.length
              const img = (
                <img
                  className="partners-trust__logo"
                  src={logo.src}
                  alt={isDuplicate ? '' : logo.alt}
                  width={180}
                  height={90}
                  loading="lazy"
                  decoding="async"
                />
              )

              return (
                <div
                  key={`${logo.id}-${index}`}
                  className="partners-trust__item"
                  aria-hidden={isDuplicate}
                >
                  {logo.href ? (
                    <a
                      className="partners-trust__link"
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={isDuplicate ? -1 : undefined}
                      aria-label={isDuplicate ? undefined : `${logo.alt} (ouvre le site)`}
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
