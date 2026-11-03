import type { IconType } from 'react-icons'
import {
  FaCheck,
  FaListUl,
  FaScaleBalanced,
  FaTrophy,
  FaUser,
  FaUserGraduate,
  FaWrench,
} from 'react-icons/fa6'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './InscriptionsSection.css'

const CARDS = [
  {
    id: 'candidats',
    title: 'Candidats',
    subtitle: 'Participez et montrez votre talent !',
    description:
      'Vous avez entre 16 et 30 ans ? Inscrivez-vous aux Olympiades des métiers et mettez votre savoir-faire à l’épreuve.',
    points: [
      { text: 'Participez à votre métier', icon: FaWrench },
      { text: 'Démontrez vos compétences', icon: FaCheck },
      { text: 'Valorisez votre savoir-faire', icon: FaTrophy },
    ],
    cta: "Je m'inscris comme candidat",
    href: '/inscription-candidat',
    icon: FaUser,
  },
  {
    id: 'experts',
    title: 'Experts',
    subtitle: 'Partagez votre expertise !',
    description:
      'Professionnels, formateurs, artisans ou spécialistes, inscrivez-vous pour évaluer, encadrer et inspirer la prochaine génération.',
    points: [
      { text: 'Évaluez les candidats', icon: FaScaleBalanced },
      { text: 'Encadrez et accompagnez', icon: FaCheck },
      { text: "Contribuez à l'excellence des métiers", icon: FaCheck },
    ],
    cta: "Je m'inscris comme expert",
    href: '/inscription-expert',
    icon: FaUserGraduate,
  },
  {
    id: 'challenges',
    title: 'Challenges métiers',
    subtitle: 'Découvrez les métiers en compétition !',
    description:
      'Explorez les métiers en compétition, les thématiques abordées et les challenges à relever lors de cette édition 2026.',
    points: [
      { text: 'Consultez la liste des métiers', icon: FaListUl },
      { text: 'Découvrez les challenges', icon: FaCheck },
      { text: "Préparez-vous et suivez l'actualité", icon: FaCheck },
    ],
    cta: "Je m'inscris au challenge",
    href: '/competition',
    icon: FaTrophy,
  },
] as const satisfies ReadonlyArray<{
  id: string
  title: string
  subtitle: string
  description: string
  points: ReadonlyArray<{ text: string; icon: IconType }>
  cta: string
  href: string
  icon: IconType
}>

function CardWatermark({ variant }: { variant: (typeof CARDS)[number]['id'] }) {
  if (variant === 'experts') {
    return (
      <svg className="ws-insc__watermark" viewBox="0 0 88 88" aria-hidden="true">
        <path d="M28 18h32v10c0 12-7 20-16 22v8h-8v-8c-9-2-16-10-16-22V18Z" />
        <path d="M24 18h40" />
        <path d="M36 58h16v6H36z" />
        <path d="M28 72h32" />
      </svg>
    )
  }

  if (variant === 'challenges') {
    return (
      <svg className="ws-insc__watermark" viewBox="0 0 88 88" aria-hidden="true">
        <path d="M26 18h36v10a18 18 0 0 1-36 0V18Z" />
        <path d="M22 18h44" />
        <path d="M44 46v12" />
        <path d="M34 70h20" />
        <path d="M38 58h12v12H38z" />
      </svg>
    )
  }

  return (
    <svg className="ws-insc__watermark" viewBox="0 0 96 88" aria-hidden="true">
      <circle cx="34" cy="22" r="12" />
      <path d="M12 70c3-20 11-28 22-28s19 8 22 28" />
      <rect x="58" y="36" width="24" height="30" rx="3" />
      <path d="M64 50l8 8" />
    </svg>
  )
}

export function InscriptionsSection() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      id="inscriptions"
      className={`ws-insc${isVisible ? ' ws-insc--visible' : ''}`}
      aria-labelledby="ws-insc-title"
    >
      <div className="ws-insc__inner">
        <header className="ws-insc__header">
          <p className="ws-insc__eyebrow">Inscriptions</p>
          <h2 id="ws-insc-title">Choisissez votre espace</h2>
        </header>

        <div className="ws-insc__grid">
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.id} className={`ws-insc__card ws-insc__card--${card.id}`}>
                <div className="ws-insc__card-head">
                  <div className="ws-insc__icon" aria-hidden="true">
                    <Icon />
                  </div>
                  <div className="ws-insc__card-titles">
                    <h3>{card.title}</h3>
                    <p className="ws-insc__lead">{card.subtitle}</p>
                  </div>
                </div>
                <p className="ws-insc__desc">{card.description}</p>
                <div className="ws-insc__points">
                  <CardWatermark variant={card.id} />
                  <ul>
                    {card.points.map((point) => {
                      const PointIcon = point.icon
                      return (
                        <li key={point.text}>
                          <PointIcon aria-hidden="true" />
                          <span>{point.text}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <a className="ws-insc__cta" href={card.href}>
                  <span>{card.cta}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
