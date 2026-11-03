import { useMemo, useState } from 'react'
import { getSkillImageCandidates, SKILLS } from '../data/skills'
import {
  useActiveEditionId,
  useEmissionCategories,
} from '../hooks/use-emission-queries'
import { HeroVideo } from './HeroVideo'
import { SectionBridge } from './SectionBridge'
import { PageLoader } from './PageLoader'
import './MetiersPage.css'
import './ConcoursPage.css'

const CATEGORY_STYLES = [
  { emoji: '📈', className: 'metiers-page__category-title--tertiaire' },
  { emoji: '🍽️', className: 'metiers-page__category-title--hotellerie' },
  { emoji: '⚙️', className: 'metiers-page__category-title--industrielle' },
  { emoji: '🎨', className: 'metiers-page__category-title--arts' },
  { emoji: '🏗️', className: 'metiers-page__category-title--batiment' },
] as const

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function resolveLocalSkillId(tagName: string): string | null {
  const byName = SKILLS.find(
    (skill) => normalizeLabel(skill.name) === normalizeLabel(tagName),
  )
  return byName?.id ?? null
}

function SkillCardImage({
  name,
  imageUrl,
  alt,
}: {
  name: string
  imageUrl?: string | null
  alt: string
}) {
  const candidates = useMemo(() => {
    const remote = imageUrl?.trim() ? [imageUrl.trim()] : []
    const localId = resolveLocalSkillId(name)
    const local = localId ? getSkillImageCandidates(localId, name) : []
    return [...remote, ...local, '/logo-worldskills.svg']
  }, [name, imageUrl])
  const [index, setIndex] = useState(0)
  const src = candidates[index] ?? '/logo-worldskills.svg'

  return (
    <img
      className="metiers-page__card-image"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        setIndex((current) =>
          current < candidates.length - 1 ? current + 1 : current,
        )
      }}
    />
  )
}

export function MetiersPage() {
  const activeEditionQuery = useActiveEditionId()
  const categoriesQuery = useEmissionCategories(activeEditionQuery.data ?? null)
  const categories = categoriesQuery.data ?? []
  const isLoading = activeEditionQuery.isLoading || categoriesQuery.isLoading
  const isError = activeEditionQuery.isError || categoriesQuery.isError
  const totalTags = categories.reduce((sum, category) => sum + category.tags.length, 0)

  return (
    <main className="concours-page metiers-page" aria-labelledby="metiers-title">
      <HeroVideo
        subtitle="Disciplines officielles"
        title="Les métiers en compétition"
      />
      <SectionBridge variant="ribbon" />

      <section className="concours-page__stack">
        <section className="concours-page__section">
          <div className="concours-page__inner metiers-page__intro">
            <p className="concours-page__eyebrow">
              {totalTags > 0 ? `${totalTags} disciplines` : 'Disciplines'}
            </p>
            <h1 id="metiers-title">Olympiades des métiers 2026</h1>
            <p className="concours-page__lead">
              Domaines et métiers issus du référentiel officiel de l&apos;édition
              active.
            </p>
          </div>
        </section>

        {isLoading ? (
          <section className="concours-page__section">
            <div className="concours-page__inner">
              <PageLoader label="Chargement des domaines et métiers…" />
            </div>
          </section>
        ) : null}

        {isError && categories.length === 0 ? (
          <section className="concours-page__section">
            <div className="concours-page__inner">
              <p className="metiers-page__note">
                Impossible de charger les métiers pour le moment. Réessayez plus tard.
              </p>
            </div>
          </section>
        ) : null}

        {!isLoading && !isError && categories.length === 0 ? (
          <section className="concours-page__section">
            <div className="concours-page__inner">
              <p className="metiers-page__note">
                Aucun domaine / métier n&apos;est encore publié pour cette édition.
              </p>
            </div>
          </section>
        ) : null}

        {categories.map((category, categoryIndex) => {
          if (category.tags.length === 0) return null
          const meta = CATEGORY_STYLES[categoryIndex % CATEGORY_STYLES.length]

          return (
            <section
              key={category.id}
              className="concours-page__section metiers-page__cards-section"
            >
              <div className="concours-page__inner">
                <h2 className={`metiers-page__category-title ${meta.className}`}>
                  <span className="metiers-page__category-emoji" aria-hidden="true">
                    {meta.emoji}
                  </span>{' '}
                  {category.name}
                </h2>
                <div className="metiers-page__cards-grid">
                  {category.tags.map((tag) => (
                    <article key={tag.id} className="metiers-page__card">
                      <SkillCardImage
                        name={tag.name}
                        imageUrl={tag.imageUrl}
                        alt={tag.name}
                      />
                      <div className="metiers-page__card-body">
                        <h3 className="metiers-page__card-title">{tag.name}</h3>
                        <p className="metiers-page__card-category">
                          <span aria-hidden="true">{meta.emoji}</span> {category.name}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )
        })}

        <section className="concours-page__section">
          <div className="concours-page__inner">
            <p className="metiers-page__note">
              D&apos;autres disciplines peuvent être ajoutées selon les éditions.
              Consultez le règlement officiel pour la liste exhaustive.
            </p>
            <a className="concours-page__inline-link" href="/competition">
              Voir le calendrier de compétition
            </a>
          </div>
        </section>
      </section>
    </main>
  )
}
