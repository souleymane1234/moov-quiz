import { PlayStoreDownloadButton } from './PlayStoreDownloadButton'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './PlayStoreDownloadButton.css'
import './MobileAppSection.css'

export function MobileAppSection() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      id="application-mobile"
      className={`ws-mobile-app${isVisible ? ' ws-mobile-app--visible' : ''}`}
      aria-labelledby="ws-mobile-app-title"
    >
      <div className="ws-mobile-app__inner">
        <div className="ws-mobile-app__content">
          <p className="ws-mobile-app__eyebrow">Application mobile</p>
          <h2 id="ws-mobile-app-title" className="ws-mobile-app__title">
            L&apos;app Android est disponible
          </h2>
          <p className="ws-mobile-app__lead">
            Suivez WorldSkills Côte d&apos;Ivoire depuis votre téléphone. Téléchargez et
            installez l&apos;application en quelques secondes.
          </p>

          <PlayStoreDownloadButton />
        </div>

        <div className="ws-mobile-app__visual" aria-hidden="true">
          <div className="ws-mobile-app__phone">
            <div className="ws-mobile-app__phone-screen">
              <img
                className="ws-mobile-app__logo"
                src="/logo.png"
                alt=""
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
              />
              <p>WorldSkills Côte d&apos;Ivoire</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
