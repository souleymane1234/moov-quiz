import type { CSSProperties } from 'react'
import type { IconType } from 'react-icons'
import {
  FaBuilding,
  FaChartLine,
  FaIndustry,
  FaMicrochip,
  FaScissors,
  FaUtensils,
} from 'react-icons/fa6'
import {
  useActiveEditionId,
  useEmissionCategories,
} from '../hooks/use-emission-queries'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './SkillsPreview.css'

const CATEGORY_ICONS: IconType[] = [
  FaIndustry,
  FaChartLine,
  FaMicrochip,
  FaUtensils,
  FaBuilding,
  FaScissors,
]

const CATEGORY_ACCENTS = [
  {
    color: '#16A34A',
    description:
      'Industrie 4.0, maintenance, robotique, énergie renouvelable.',
  },
  {
    color: '#F58220',
    description:
      'Mobilité, bâtiment intelligent, infrastructures connectées.',
  },
  {
    color: '#0B1F3A',
    description:
      'IA, data, cybersécurité, développement d’applications.',
  },
  {
    color: '#16A34A',
    description:
      'Agriculture intelligente, transformation agroalimentaire, traçabilité.',
  },
  {
    color: '#7C3AED',
    description:
      'Mode, design, audiovisuel, arts & culture, entrepreneuriat créatif.',
  },
] as const

const FALLBACK_UNIVERSES = [
  'Smart Industry & Energy',
  'Smart City & Mobility',
  'Digital & AI',
  'Agritech & Food',
  'Creative Industries',
] as const

export function SkillsPreview() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  const activeEditionQuery = useActiveEditionId()
  const categoriesQuery = useEmissionCategories(activeEditionQuery.data ?? null)
  const categories = categoriesQuery.data ?? []
  const displayCategories =
    categories.length > 0
      ? categories.map((category) => ({ id: category.id, name: category.name }))
      : FALLBACK_UNIVERSES.map((name) => ({ id: name, name }))

  return (
    <section
      ref={ref}
      id="metiers"
      className={`ws-skills-preview${isVisible ? ' ws-skills-preview--visible' : ''}`}
      aria-labelledby="ws-skills-preview-title"
    >
      <div className="ws-skills-preview__inner">
        <div className="ws-skills-preview__header">
          <div>
            <p className="ws-skills-preview__eyebrow">Catégories</p>
            <h2 id="ws-skills-preview-title">Les 5 univers de challenges</h2>
          </div>
          <a href="/competition" className="ws-skills-preview__link">
            Voir tous les métiers
          </a>
        </div>

        <ul className="ws-skills-preview__categories">
          {displayCategories.map((category, index) => {
            const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length]
            const accent = CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]
            return (
              <li
                key={category.id}
                className={`ws-skills-preview__category-card ws-skills-preview__category-card--${
                  (index % 5) + 1
                }`}
                style={
                  {
                    '--category-accent': accent.color,
                  } as CSSProperties
                }
              >
                <span
                  className="ws-skills-preview__category-icon-wrap"
                  aria-hidden="true"
                >
                  <Icon className="ws-skills-preview__category-icon" />
                </span>
                <span className="ws-skills-preview__category-name">{category.name}</span>
                <p className="ws-skills-preview__category-desc">{accent.description}</p>
                <a className="ws-skills-preview__category-link" href="/competition">
                  En savoir plus <span aria-hidden="true">→</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
