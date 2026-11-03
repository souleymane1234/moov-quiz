import {
  FaCalendarDays,
  FaClock,
  FaGlobe,
  FaLocationDot,
  FaMicrochip,
  FaPeopleGroup,
  FaTrophy,
  FaUserGear,
  FaUsers,
  FaWrench,
} from 'react-icons/fa6'
import { useActiveEdition } from '../hooks/use-emission-queries'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './AgendaSection.css'

const META = [
  {
    icon: FaCalendarDays,
    title: '22 - 25 octobre 2026',
    text: "4 jours d'evenements",
  },
  {
    icon: FaLocationDot,
    title: "Palais de la culture d'Abidjan",
    text: 'Abidjan, Cote d’Ivoire',
  },
  {
    icon: FaUsers,
    title: '10 000+',
    text: 'Jeunes talents attendus',
  },
] as const

const AGENDA = [
  {
    step: '01',
    title: 'Préparation',
    accent: 'green',
    date: 'Mercredi 22 octobre 2026',
    points: [
      {
        icon: FaPeopleGroup,
        time: '07h30 – 08h00',
        text: 'Team buildings (nouveaux horizons, compétences, esprit et motivation des jurys)',
      },
      {
        icon: FaClock,
        time: '09h00 – 09h30',
        text: 'Pause-café',
      },
      {
        icon: FaWrench,
        time: '09h30 – 17h00',
        text: 'Installation des ateliers, stand d’exposition et guides de compétition',
      },
      {
        icon: FaUserGear,
        time: '17h00 – 18h00',
        text: 'Réunion technique des chefs d’atelier, préparation du chef et Comité d’organisation',
      },
    ],
    note: 'Mise en place des dispositifs avant lancement officiel.',
  },
  {
    step: '02',
    title: 'Cérémonie d’ouverture',
    accent: 'orange',
    date: 'Jeudi 23 octobre 2026',
    points: [
      {
        icon: FaWrench,
        time: '08h00',
        text: 'Mise en main des postes de compétition et ouverture des stands d’exposition',
      },
      {
        icon: FaUsers,
        time: '09h00 – 11h00',
        text: 'Cérémonie officielle d’ouverture',
      },
      {
        icon: FaClock,
        time: '12h00 – 14h00',
        text: 'Déjeuner d’étoiles',
      },
      {
        icon: FaTrophy,
        time: '14h00 – 17h30',
        text: 'Début des compétitions et visites libres des stands d’exposition',
      },
    ],
    note: 'Ouverture officielle et lancement des compétitions.',
  },
  {
    step: '03',
    title: 'Compétitions, conférences et rencontres B2B',
    accent: 'navy',
    date: 'Vendredi 24 octobre 2026',
    points: [
      {
        icon: FaMicrochip,
        time: '08h00 – 12h30',
        text: 'Épreuves de compétition dans tous les métiers',
      },
      {
        icon: FaGlobe,
        time: '09h00 – 10h30',
        text: 'Conférence 1',
      },
      {
        icon: FaGlobe,
        time: '10h45 – 12h15',
        text: 'Conférence 2',
      },
      {
        icon: FaClock,
        time: '12h30 – 14h00',
        text: 'Déjeuner',
      },
      {
        icon: FaPeopleGroup,
        time: '14h00 – 16h30',
        text: 'Rencontres B2B (entreprises – Centres de formation – Jeunes diplômés – Partenaires techniques et financiers)',
      },
      {
        icon: FaTrophy,
        time: '16h30 – 17h30',
        text: 'Poursuite des compétitions',
      },
    ],
    note: 'La journée la plus dense pour la compétition et le réseau.',
  },
  {
    step: '04',
    title: 'Finales et clôture',
    accent: 'green',
    date: 'Samedi 25 octobre 2026',
    points: [
      {
        icon: FaTrophy,
        time: '08h00 – 11h30',
        text: 'Finales des compétitions et délibérations des jurys',
      },
      {
        icon: FaUserGear,
        time: '11h30 – 12h30',
        text: 'Validation des résultats par les jurys',
      },
      {
        icon: FaClock,
        time: '12h30 – 14h00',
        text: 'Déjeuner',
      },
      {
        icon: FaUsers,
        time: '14h00 – 16h00',
        text: 'Animations, démonstrations techniques et visites des stands',
      },
      {
        icon: FaPeopleGroup,
        time: '16h00 – 17h00',
        text: 'Gala — Accueil',
      },
      {
        icon: FaTrophy,
        time: '17h00 – 18h30',
        text: 'Gala — Remise des prix',
      },
      {
        icon: FaGlobe,
        time: '18h30 – 19h30',
        text: 'Gala — Allocution / clôture',
      },
      {
        icon: FaCalendarDays,
        time: '19h30 – 20h30',
        text: 'Gala — Cocktail',
      },
    ],
    note: 'Gala de clôture et remise des prix.',
  },
] as const

const FALLBACK_COMPETITION_TITLE = 'WorldSkills Côte d’Ivoire 2026'

export function AgendaSection() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  const activeEdition = useActiveEdition()
  const competitionTitle =
    activeEdition.editionDetail?.title?.trim() ||
    activeEdition.nestedEdition?.title?.trim() ||
    FALLBACK_COMPETITION_TITLE

  return (
    <section
      ref={ref}
      id="agenda"
      className={`agenda-section${isVisible ? ' agenda-section--visible' : ''}`}
      aria-labelledby="agenda-section-title"
    >
      <div className="agenda-section__inner">
        <header className="agenda-section__header">
          <div className="agenda-section__heading">
            <p className="agenda-section__eyebrow">Agenda</p>
            <h2 id="agenda-section-title">
              <span className="agenda-section__title-line">Le programme</span>
              <span className="agenda-section__title-line">{competitionTitle}</span>
            </h2>
          </div>

          <ul className="agenda-section__meta">
            {META.map(({ icon: Icon, title, text }) => (
              <li key={title} className="agenda-section__meta-item">
                <span className="agenda-section__meta-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </li>
            ))}
          </ul>

          <p className="agenda-section__lead">
            4 jours d’innovation, de compétition et de rencontres pour bâtir{' '}
            <strong className="agenda-section__lead-accent">l’avenir des métiers</strong>{' '}
            en Côte d’Ivoire.
          </p>
        </header>

        <div className="agenda-section__grid">
          {AGENDA.map((item) => (
            <article
              key={item.step}
              className={`agenda-card agenda-card--${item.accent}`}
            >
              <div className="agenda-card__top">
                <div className="agenda-card__step">{item.step}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p className="agenda-card__date">{item.date}</p>
                </div>
              </div>

              <ul className="agenda-card__list">
                {item.points.map(({ icon: Icon, time, text }) => (
                  <li key={time + text}>
                    <span className="agenda-card__bullet" aria-hidden="true">
                      <Icon />
                    </span>
                    <div>
                      <strong>{time}</strong>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="agenda-card__note">{item.note}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
