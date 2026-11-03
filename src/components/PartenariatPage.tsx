import { useEffect } from 'react'
import { ContactSection } from './ContactSection'
import { SectionBridge } from './SectionBridge'
import { PartnersTrustCarousel } from './PartnersTrustCarousel'
import { SponsoringCards } from './SponsoringSection'
import './ConcoursPage.css'
import './PartenariatPage.css'
import './SponsoringSection.css'

const PARTNERSHIP_CATEGORIES = [
  {
    title: 'Partenaire stratégique',
    subtitle: 'Partenaire global de l’événement et de son rayonnement.',
    tone: 'green',
    icon: 'diamond',
  },
  {
    title: 'Partenaire challenge',
    subtitle: 'Porteur d’un Challenge métier et co-créateur de solutions.',
    tone: 'orange',
    icon: 'star',
  },
  {
    title: 'Partenaire métier',
    subtitle: 'Soutien spécifique à un ou plusieurs métiers en compétition.',
    tone: 'blue',
    icon: 'wrench',
  },
  {
    title: 'Partenaire innovation & technologie',
    subtitle: 'Fournisseur de technologies et de solutions innovantes.',
    tone: 'green',
    icon: 'laptop',
  },
  {
    title: 'Partenaire formation & expertise',
    subtitle: 'Renforcement des compétences et accompagnement des talents.',
    tone: 'orange',
    icon: 'cap',
  },
  {
    title: 'Partenaire impact & institutionnel',
    subtitle: 'Engagement pour l’impact jeunesse, l’inclusion et le développement.',
    tone: 'blue',
    icon: 'users',
  },
] as const

const WHY_PARTNER_POINTS = [
  {
    title: 'Une visibilité à 360°',
    text: 'Médias, digital, réseaux sociaux, affichage, relations publiques, présence sur site et bien plus.',
    tone: 'green',
    icon: 'megaphone',
  },
  {
    title: 'Un impact durable',
    text: 'Votre soutien contribue à la formation, à l’employabilité et à l’excellence des jeunes ivoiriens.',
    tone: 'orange',
    icon: 'target',
  },
  {
    title: 'Un réseau d’influence',
    text: 'Rencontrez des décideurs, entrepreneurs, institutions et acteurs clés du secteur public et privé.',
    tone: 'blue',
    icon: 'network',
  },
] as const

function CategoryIcon({ kind }: { kind: (typeof PARTNERSHIP_CATEGORIES)[number]['icon'] }) {
  switch (kind) {
    case 'diamond':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 3.2 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.5l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8Z" />
        </svg>
      )
    case 'wrench':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l.8-.8a4.5 4.5 0 0 1-5.9 5.9l-6.7 6.7a2.1 2.1 0 0 1-3-3l6.7-6.7a4.5 4.5 0 0 1 5.9-5.9l-.8.8Z" />
        </svg>
      )
    case 'laptop':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <path d="M2.5 19h19" />
          <path d="M8 19h8" />
        </svg>
      )
    case 'cap':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3.5 10 8.5-4.5L20.5 10 12 14.5 3.5 10Z" />
          <path d="M7.5 12.2v3.5c0 1.5 2 2.7 4.5 2.7s4.5-1.2 4.5-2.7v-3.5" />
          <path d="M20.5 10v5.5" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8.5" r="2.4" />
          <circle cx="16" cy="9.2" r="2" />
          <path d="M4.5 18.5c.6-3.2 2.6-4.8 4.5-4.8s3.9 1.6 4.5 4.8" />
          <path d="M13.2 15.2c.9-1.5 2.2-2.2 3.5-2.2 1.5 0 2.8.9 3.3 2.8" />
        </svg>
      )
  }
}

function ReasonIcon({ kind }: { kind: (typeof WHY_PARTNER_POINTS)[number]['icon'] }) {
  switch (kind) {
    case 'megaphone':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11.2V8.6A1.6 1.6 0 0 1 5.6 7h3l7.6-3.2a1 1 0 0 1 1.4.9v13.2a1 1 0 0 1-1.4.9l-7.6-3.2h-3A1.6 1.6 0 0 1 4 14v-2.8Z" />
        </svg>
      )
    case 'target':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="8.5" cy="9.5" r="2.2" />
          <circle cx="15.5" cy="9.5" r="2.2" />
          <path d="M4.8 18a3.7 3.7 0 0 1 3.7-3.7h7a3.7 3.7 0 0 1 3.7 3.7" />
        </svg>
      )
  }
}

export function PartenariatPage() {
  useEffect(() => {
    if (window.location.hash !== '#contact') return
    const el = document.getElementById('contact')
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  return (
    <main className="concours-page concours-page--nav-offset partenariat-page" aria-labelledby="partenariat-title">
      <section id="partenaires" className="concours-page__stack">
        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner partenariat-page__hero-card">
            <p className="concours-page__eyebrow">Partenariat</p>
            <h1 id="partenariat-title">Associez-vous aux Olympiades des métiers</h1>
            <div className="concours-page__actions">
              <a href="#contact" className="partenariat-page__cta-link">
                Nous contacter
              </a>
              <a href="/competition" className="partenariat-page__cta-secondary">Voir la compétition</a>
            </div>
          </div>
        </section>

        <section className="concours-page__section">
          <div className="concours-page__inner partenariat-page__engagement">
            <header className="partenariat-page__sponsoring-intro">
              <p className="partenariat-page__sponsoring-eyebrow">Sponsoring</p>
              <h2 className="partenariat-page__sponsoring-title">
                Devenez acteur de WorldSkills Côte d&apos;Ivoire
              </h2>
              <p className="partenariat-page__sponsoring-lead">
                Associez votre marque à la plus grande compétition des métiers en Côte
                d&apos;Ivoire et contribuez à former, valoriser et propulser les talents
                de demain.
              </p>
            </header>
            <h3 className="partenariat-page__engagement-title">
              Choisissez votre manière de vous engager
            </h3>
            <SponsoringCards linkHref="#contact" />
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner partenariat-page__card partenariat-page__categories">
            <h2>Nos catégories de partenariat</h2>
            <div className="partenariat-page__categories-grid">
              {PARTNERSHIP_CATEGORIES.map((category) => (
                <article
                  key={category.title}
                  className={`partenariat-page__category-card partenariat-page__category-card--${category.tone}`}
                >
                  <span className="partenariat-page__category-icon" aria-hidden="true">
                    <CategoryIcon kind={category.icon} />
                  </span>
                  <h3>{category.title}</h3>
                  <span className="partenariat-page__category-rule" aria-hidden="true" />
                  <p>{category.subtitle}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <SectionBridge variant="wave" />

        <section className="concours-page__section">
          <div className="concours-page__inner partenariat-page__why-layout">
            <article className="partenariat-page__card partenariat-page__why-card">
              <h2>Pourquoi devenir partenaire de Côte d&apos;Ivoire Skills 2026 ?</h2>
              <div className="partenariat-page__reasons-grid">
                {WHY_PARTNER_POINTS.map((reason) => (
                  <div key={reason.title} className={`partenariat-page__reason partenariat-page__reason--${reason.tone}`}>
                    <span aria-hidden="true" className="partenariat-page__reason-icon">
                      <ReasonIcon kind={reason.icon} />
                    </span>
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </div>
                ))}
              </div>
            </article>

            <aside className="partenariat-page__contact-cta">
              <h2>Intéressé par un partenariat ?</h2>
              <p>
                Contactez notre équipe pour discuter d&apos;un partenariat adapté à vos
                objectifs et à votre impact.
              </p>
              <a className="partenariat-page__cta-link" href="#contact">
                Nous contacter →
              </a>
            </aside>
          </div>
        </section>

        <SectionBridge variant="wave" />
        <ContactSection embedded />
        <SectionBridge variant="wave" />
        <PartnersTrustCarousel />
      </section>
    </main>
  )
}
