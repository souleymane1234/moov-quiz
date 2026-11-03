import { useRevealOnView } from '../hooks/useRevealOnView'
import './AboutSection.css'

export function AboutSection() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      className={`ws-about${isVisible ? ' ws-about--visible' : ''}`}
      aria-labelledby="ws-about-title"
    >
      <div className="ws-about__inner">
        <div className="ws-about__headline">
          <div className="ws-about__headline-text">
            <p className="ws-about__eyebrow">À propos</p>
            <h2 id="ws-about-title" className="ws-about__title">
              WorldSkills Côte d&apos;Ivoire
            </h2>
          </div>
          <a className="ws-about__cta-link" href="/competition">
            Les Olympiades des métiers
          </a>
        </div>

        <div className="ws-about__copy">
          <p className="ws-about__summary">
            <strong>
              WorldSkills Côte d&apos;Ivoire valorise les métiers, les compétences et
              les talents de la jeunesse ivoirienne.
            </strong>{' '}
            À travers les Olympiades des métiers, nous révélons l&apos;excellence et
            le savoir-faire des jeunes dans des conditions réelles de compétition.
            L&apos;événement crée des passerelles entre{' '}
            <strong>formation, entreprises et emploi</strong>, tout en encourageant
            l&apos;innovation et la créativité. Il contribue ainsi à mieux faire
            connaître les métiers et à répondre aux besoins du monde professionnel.
          </p>
          <p className="ws-about__summary">
            WorldSkills Côte d&apos;Ivoire 2026, c&apos;est une ambition : faire de
            la compétence un levier d&apos;avenir pour la jeunesse.
          </p>
          <p className="ws-about__summary ws-about__summary--tagline">
            Formation • Innovation • Employabilité des jeunes.
          </p>
        </div>
      </div>
    </section>
  )
}
