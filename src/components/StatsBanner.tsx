import {
  FaGlobe,
  FaTrophy,
  FaUsers,
  FaBuilding,
} from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { useRevealOnView } from '../hooks/useRevealOnView'
import './StatsBanner.css'

const STATS: ReadonlyArray<{ value: string; label: string; icon: IconType }> = [
  { value: '10 000+', label: 'Jeunes talents attendus', icon: FaUsers },
  { value: '200+', label: 'Entreprises partenaires', icon: FaBuilding },
  { value: '23+', label: 'Métiers en compétition', icon: FaTrophy },
  { value: '1', label: 'Objectif commun : l\u2019excellence', icon: FaGlobe },
]

export function StatsBanner() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()

  return (
    <section
      ref={ref}
      id="chiffres"
      className={`ws-stats${isVisible ? ' ws-stats--visible' : ''}`}
      aria-label="Chiffres clés"
    >
      <ul className="ws-stats__grid">
        {STATS.map(({ value, label, icon: Icon }) => (
          <li key={label} className="ws-stats__item">
            <Icon className="ws-stats__icon" aria-hidden="true" />
            <div>
              <span className="ws-stats__value">{value}</span>
              <span className="ws-stats__label">{label}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
