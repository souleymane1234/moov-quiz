import { useRevealOnView } from '../hooks/useRevealOnView'
import './ParticipateSection.css'

export function ParticipateSection() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      id="participer"
      className={`ws-participate${isVisible ? ' ws-participate--visible' : ''}`}
      aria-labelledby="ws-participate-title"
    >
      <div className="ws-participate__inner">
        <div className="ws-participate__content">
          <p className="ws-participate__eyebrow">Participer</p>
          <h2 id="ws-participate-title" className="ws-participate__title">
            <span className="ws-participate__title-line">Établissements &</span>
            <span className="ws-participate__title-accent">apprenants</span>
          </h2>
          <p className="ws-participate__body">
            Les compétiteurs sont sélectionnés via les présélections régionales.
            Chaque établissement de formation professionnelle peut inscrire ses
            meilleurs talents dans les disciplines ouvertes.
          </p>
          <h3 className="ws-participate__subhead">Qui peut concourir ?</h3>
          <p className="ws-participate__hint">
            Apprenants âgés de 15 à 23 ans, inscrits dans un centre agréé,
            après validation par l&apos;encadrement pédagogique.
          </p>
          <a className="ws-participate__cta" href="/competition">
            Calendrier et règlement
          </a>
        </div>
        <figure className="ws-participate__figure">
          <img
            className="ws-participate__img"
            src="/miss.jpg"
            alt="Compétiteurs en atelier — formation professionnelle"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  )
}
