import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getSkillImageCandidates,
  SKILLS,
} from '../data/skills'
import {
  useActiveEdition,
  useEditionCandidates,
} from '../hooks/use-emission-queries'
import type {
  EditionExpertDto,
  EditionFullDetailDto,
} from '../lib/api/modules/emission/emission.types'
import {
  buildCompetitionCategoriesFromJobSheets,
  formatEditionDateRange,
  type CompetitionCategoryView,
} from '../lib/map-emission'
import { PageLoader } from './PageLoader'
import './ConcoursPage.css'
import './MetiersPage.css'

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugifyFileName(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'metier'
  )
}

function toAbsoluteAssetUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed
  try {
    return new URL(trimmed, window.location.origin).href
  } catch {
    return trimmed
  }
}

function downloadMetierFiche(params: {
  categoryName: string
  tagName: string
  imageUrl?: string | null
  candidatesCount: number
  editionTitle: string
}) {
  const imageSrc = toAbsoluteAssetUrl(params.imageUrl)
  const logoSrc = toAbsoluteAssetUrl('/logo.png')
  const title = `Fiche métier — ${params.tagName}`
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #1a1a1a;
      background: #f6f4f1;
      line-height: 1.5;
    }
    .sheet {
      max-width: 720px;
      margin: 32px auto;
      padding: 36px 40px;
      background: #fff;
      border: 1px solid #e8e4de;
    }
    header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 3px solid #e87722;
    }
    header img { width: 64px; height: 64px; object-fit: contain; }
    header p { margin: 0; font-size: 0.85rem; letter-spacing: 0.06em; text-transform: uppercase; color: #666; }
    header strong { display: block; margin-top: 4px; font-size: 1.05rem; color: #1a1a1a; letter-spacing: 0; text-transform: none; }
    .eyebrow { margin: 0 0 8px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e87722; }
    h1 { margin: 0 0 16px; font-size: 2rem; line-height: 1.15; }
    .lead { margin: 0 0 24px; color: #444; }
    .media { margin: 0 0 28px; }
    .media img { width: 100%; max-height: 320px; object-fit: cover; border-radius: 8px; background: #f0ebe4; }
    dl { display: grid; grid-template-columns: 140px 1fr; gap: 10px 16px; margin: 0; }
    dt { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #777; }
    dd { margin: 0; font-weight: 600; }
    footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e8e4de; font-size: 0.85rem; color: #777; }
    @media print {
      body { background: #fff; }
      .sheet { margin: 0; border: none; max-width: none; }
    }
  </style>
</head>
<body>
  <article class="sheet">
    <header>
      ${logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="WorldSkills Côte d'Ivoire" />` : ''}
      <div>
        <p>WorldSkills Côte d'Ivoire</p>
        <strong>${escapeHtml(params.editionTitle)}</strong>
      </div>
    </header>
    <p class="eyebrow">Fiche métier</p>
    <h1>${escapeHtml(params.tagName)}</h1>
    <p class="lead">
      Présentation du métier « ${escapeHtml(params.tagName)} » dans le domaine
      ${escapeHtml(params.categoryName)} pour l'édition en cours.
    </p>
    ${
      imageSrc
        ? `<div class="media"><img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(params.tagName)}" /></div>`
        : ''
    }
    <dl>
      <dt>Domaine</dt><dd>${escapeHtml(params.categoryName)}</dd>
      <dt>Métier</dt><dd>${escapeHtml(params.tagName)}</dd>
      <dt>Candidats</dt><dd>${params.candidatesCount}</dd>
      <dt>Édition</dt><dd>${escapeHtml(params.editionTitle)}</dd>
    </dl>
    <footer>Document généré depuis la plateforme WorldSkills Côte d'Ivoire.</footer>
  </article>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `fiche-metier-${slugifyFileName(params.tagName)}.html`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

function resolveLocalSkillId(tagName: string): string | null {
  const byName = SKILLS.find(
    (skill) => normalizeLabel(skill.name) === normalizeLabel(tagName),
  )
  return byName?.id ?? null
}

function extractEstablishment(candidate: {
  schoolName?: string | null
  residenceCountry?: string | null
  description?: string | null
}): string {
  const fromSchool = candidate.schoolName?.trim()
  if (fromSchool) return fromSchool
  const fromResidence = candidate.residenceCountry?.trim()
  if (fromResidence) return fromResidence
  const match = candidate.description?.match(
    /Établissement d['']origine\s*:\s*(.+)/i,
  )
  const fromDescription = match?.[1]?.trim().split('\n')[0]?.trim()
  return fromDescription || '—'
}

type MetierView = 'candidates' | 'experts'

const EXPERT_ROLE_LABELS: Record<string, string> = {
  JURY_EVALUATION: 'Jury / Évaluation',
  COACHING: 'Encadrement / Coaching',
  TECHNICAL_EXPERT: 'Expert technique',
  SPEAKER_TRAINER: 'Conférencier / Formateur',
}

function expertDisplayName(expert: EditionExpertDto): string {
  return (
    [expert.firstName, expert.lastName].filter(Boolean).join(' ').trim() ||
    [expert.user?.studentProfile?.firstName, expert.user?.studentProfile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    'Expert'
  )
}

function expertRoles(expert: EditionExpertDto): string[] {
  return (expert.desiredRoles ?? []).map((role) =>
    role === 'OTHER'
      ? expert.otherRoleDetail?.trim() || 'Autre'
      : EXPERT_ROLE_LABELS[role] ?? role.replace(/_/g, ' ').toLowerCase(),
  )
}

function formatExperience(years: number | null | undefined): string {
  if (!years || years <= 0) return 'Moins d’un an'
  return `${years} an${years > 1 ? 's' : ''}`
}

function CompetitionSkillImage({
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

type CompetitionCategory = CompetitionCategoryView

function competitionCategoriesFromEdition(
  editionDetail: EditionFullDetailDto | null | undefined,
): CompetitionCategory[] {
  const jobSheets = editionDetail?.jobSheets
  if (jobSheets && jobSheets.length > 0) {
    return buildCompetitionCategoriesFromJobSheets(jobSheets)
  }

  if (
    editionDetail?.candidateCategories &&
    editionDetail.candidateCategories.length > 0
  ) {
    return editionDetail.candidateCategories
      .map((entry) => ({
        id: entry.category.id,
        name: entry.category.name,
        imageUrl: entry.category.imageUrl,
        tags: [...entry.tags]
          .filter((tag) => tag.active !== false)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((tag) => ({
            id: tag.id,
            name: tag.name,
            imageUrl: tag.imageUrl,
            active: tag.active,
            sortOrder: tag.sortOrder,
          })),
      }))
      .filter((category) => category.tags.length > 0)
  }

  return []
}

export function ConcoursPage() {
  const [selectedMetier, setSelectedMetier] = useState<{
    categoryId: string
    categoryName: string
    jobSheetId: string
    tagName: string
    imageUrl?: string | null
    candidatesCount?: number
  } | null>(null)
  const [metierView, setMetierView] = useState<MetierView>('candidates')

  const activeEditionQuery = useActiveEdition()
  const editionDetail = activeEditionQuery.editionDetail
  const editionId = editionDetail?.id ?? activeEditionQuery.nestedEdition?.id ?? null

  const candidatesQuery = useEditionCandidates(editionId ?? undefined, {
    jobSheetId: selectedMetier?.jobSheetId,
    enabled: Boolean(selectedMetier?.jobSheetId),
  })

  const competitionCategories = useMemo(
    () => competitionCategoriesFromEdition(editionDetail),
    [editionDetail],
  )

  const [metierFromUrl, setMetierFromUrl] = useState(
    () => new URLSearchParams(window.location.search).get('metier'),
  )

  useEffect(() => {
    if (!metierFromUrl || competitionCategories.length === 0) return
    for (const category of competitionCategories) {
      const tag = category.tags.find((t) => t.id === metierFromUrl)
      if (tag) {
        setSelectedMetier({
          categoryId: category.id,
          categoryName: category.name,
          jobSheetId: tag.id,
          tagName: tag.name,
          imageUrl: tag.imageUrl,
          candidatesCount: tag.candidatesCount ?? 0,
        })
        break
      }
    }
    setMetierFromUrl(null)
    window.history.replaceState(null, '', window.location.pathname)
  }, [metierFromUrl, competitionCategories])

  const selectedMetierCandidates = candidatesQuery.data?.allCandidates ?? []
  const selectedMetierExperts = candidatesQuery.data?.experts ?? []
  const metierListLoading =
    Boolean(selectedMetier) && candidatesQuery.isLoading && !candidatesQuery.data

  const candidatesLoading =
    Boolean(selectedMetier) &&
    (candidatesQuery.isLoading || candidatesQuery.isFetching) &&
    selectedMetierCandidates.length === 0

  const apiEditionTitle =
    editionDetail?.title ??
    activeEditionQuery.nestedEdition?.title ??
    null
  const apiEditionDescription =
    editionDetail?.description?.trim() ||
    activeEditionQuery.emission?.description?.trim() ||
    null
  const apiEditionDates =
    editionDetail?.startDate && editionDetail?.endDate
      ? formatEditionDateRange(editionDetail.startDate, editionDetail.endDate)
      : activeEditionQuery.nestedEdition?.startDate &&
          activeEditionQuery.nestedEdition?.endDate
        ? formatEditionDateRange(
            activeEditionQuery.nestedEdition.startDate,
            activeEditionQuery.nestedEdition.endDate,
          )
        : null
  const apiEditionLocation =
    editionDetail?.emissionName?.trim() ||
    activeEditionQuery.emission?.title?.trim() ||
    null
  const apiEditionStage =
    editionDetail?.currentStage
      ? String(editionDetail.currentStage).replace(/_/g, ' ').trim() || null
      : activeEditionQuery.nestedEdition?.currentStage
        ? String(activeEditionQuery.nestedEdition.currentStage)
            .replace(/_/g, ' ')
            .trim() || null
        : null
  const candidatesCount =
    editionDetail?.candidatesCount ??
    activeEditionQuery.nestedEdition?.candidatesCount ??
    editionDetail?.jobSheets?.reduce(
      (sum, group) => sum + (group.candidatesCount ?? 0),
      0,
    ) ??
    0
  const editionSponsors = editionDetail?.sponsors ?? []

  const revealMetierPanel = useCallback(
    (next: typeof selectedMetier) => {
      const apply = () => {
        setSelectedMetier(next)
        setMetierView('candidates')
      }
      const doc = document as Document & {
        startViewTransition?: (callback: () => void) => void
      }
      if (typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(apply)
      } else {
        apply()
      }
    },
    [],
  )

  useEffect(() => {
    if (!selectedMetier) return
    // Attendre le rendu du panneau candidats avant de remonter en haut
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [selectedMetier])

  const totalDisciplines = competitionCategories.reduce(
    (sum, category) => sum + category.tags.length,
    0,
  )

  const pageLoading = !selectedMetier && activeEditionQuery.isBootstrapping

  if (pageLoading) {
    return (
      <main className="concours-page concours-page--loading" aria-labelledby="competition-title">
        <h1 id="competition-title" className="visually-hidden">
          Compétition
        </h1>
        <PageLoader label="Chargement de la compétition…" fullPage />
      </main>
    )
  }

  return (
    <main className="concours-page concours-page--nav-offset" aria-labelledby="competition-title">
      <section id="competition" className="concours-page__stack">
        {!selectedMetier && (
          <section className="concours-page__edition-banner" aria-labelledby="competition-title">
            <div className="concours-page__edition-banner-inner">
              <p className="concours-page__edition-banner-eyebrow concours-page__edition-banner-eyebrow--blink">
                Édition en cours
              </p>
              <h1 id="competition-title">
                {apiEditionTitle ?? 'Compétition'}
              </h1>
              {apiEditionDescription ? (
                <p className="concours-page__edition-banner-lead">{apiEditionDescription}</p>
              ) : null}

              <ul className="concours-page__edition-meta">
                {apiEditionDates ? (
                  <li>
                    <span>Dates</span>
                    <strong>{apiEditionDates}</strong>
                  </li>
                ) : null}
                {apiEditionLocation ? (
                  <li>
                    <span>Compétition</span>
                    <strong>{apiEditionLocation}</strong>
                  </li>
                ) : null}
                {apiEditionStage ? (
                  <li>
                    <span>Phase</span>
                    <strong>{apiEditionStage}</strong>
                  </li>
                ) : null}
                <li>
                  <span>Candidats</span>
                  <strong>{candidatesCount}</strong>
                </li>
                <li>
                  <span>Disciplines</span>
                  <strong>{totalDisciplines}</strong>
                </li>
              </ul>
            </div>
          </section>
        )}

        {selectedMetier ? (
          <section
            className="concours-page__edition-banner concours-page__metier-banner"
            aria-labelledby="metier-banner-title"
          >
            <div className="concours-page__edition-banner-inner concours-page__metier-banner-inner">
              <div className="concours-page__metier-banner-copy">
                <p className="concours-page__edition-banner-eyebrow">
                  Domaine · {selectedMetier.categoryName}
                </p>
                <h1 id="metier-banner-title">{selectedMetier.tagName}</h1>
                <p className="concours-page__edition-banner-lead">
                  Découvrez les candidats et les experts de ce métier pour l&apos;édition en cours.
                </p>
                <div className="concours-page__metier-banner-actions">
                  <button
                    type="button"
                    className="concours-page__metier-banner-download"
                    onClick={() =>
                      downloadMetierFiche({
                        categoryName: selectedMetier.categoryName,
                        tagName: selectedMetier.tagName,
                        imageUrl: selectedMetier.imageUrl,
                        candidatesCount: selectedMetierCandidates.length,
                        editionTitle:
                          apiEditionTitle ?? 'Côte d\u2019Ivoire Skills 2026',
                      })
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 21h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Télécharger la fiche métier
                  </button>
                </div>
                <ul className="concours-page__edition-meta">
                  <li>
                    <span>Domaine</span>
                    <strong>{selectedMetier.categoryName}</strong>
                  </li>
                  <li>
                    <span>Métier</span>
                    <strong>{selectedMetier.tagName}</strong>
                  </li>
                  <li>
                    <span>Candidats</span>
                    <strong>{selectedMetierCandidates.length}</strong>
                  </li>
                  <li>
                    <span>Experts</span>
                    <strong>{selectedMetierExperts.length}</strong>
                  </li>
                </ul>
              </div>
              <div className="concours-page__metier-banner-media">
                <CompetitionSkillImage
                  name={selectedMetier.tagName}
                  imageUrl={selectedMetier.imageUrl}
                  alt={selectedMetier.tagName}
                />
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Métiers & Candidats ── */}
        <section className="concours-page__section concours-page__hero">
          <div className="concours-page__inner">
            {selectedMetier && (
              <h1 id="competition-title" className="visually-hidden">
                {selectedMetier.tagName}
              </h1>
            )}

            <div
              id="concours-edition-candidates"
              className="concours-page__candidates"
              role="tabpanel"
              aria-label="Métiers et candidats de l'édition en cours"
            >
              {selectedMetier ? (
                <div className="concours-page__metier-detail">
                  <button
                    type="button"
                    className="concours-page__metier-back"
                    onClick={() => revealMetierPanel(null)}
                  >
                    ← Retour aux métiers
                  </button>

                  <div
                    className="concours-page__metier-switch"
                    role="tablist"
                    aria-label="Participants du métier"
                  >
                    <button
                      type="button"
                      role="tab"
                      id="metier-tab-candidates"
                      aria-selected={metierView === 'candidates'}
                      aria-controls="metier-panel"
                      className={`concours-page__metier-switch-btn${metierView === 'candidates' ? ' is-active' : ''}`}
                      onClick={() => setMetierView('candidates')}
                    >
                      Candidats
                      <span className="concours-page__metier-switch-count">
                        {metierListLoading ? '…' : selectedMetierCandidates.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="metier-tab-experts"
                      aria-selected={metierView === 'experts'}
                      aria-controls="metier-panel"
                      className={`concours-page__metier-switch-btn${metierView === 'experts' ? ' is-active' : ''}`}
                      onClick={() => setMetierView('experts')}
                    >
                      Experts
                      <span className="concours-page__metier-switch-count">
                        {metierListLoading ? '…' : selectedMetierExperts.length}
                      </span>
                    </button>
                  </div>

                  <div
                    id="metier-panel"
                    role="tabpanel"
                    aria-labelledby={`metier-tab-${metierView}`}
                  >
                    {metierView === 'candidates' ? (
                      candidatesLoading ? (
                        <PageLoader label="Chargement des candidats…" />
                      ) : selectedMetierCandidates.length === 0 ? (
                        <p className="concours-page__candidates-empty">
                          Aucun candidat validé pour ce métier pour le moment.
                        </p>
                      ) : (
                        <ul className="concours-page__candidates-grid">
                          {selectedMetierCandidates.map((candidate, index) => {
                            const name =
                              [candidate.candidatePreName, candidate.candidateName]
                                .filter(Boolean)
                                .join(' ')
                                .trim() ||
                              candidate.user?.pseudo ||
                              'Candidat'
                            const schoolName =
                              candidate.schoolName?.trim() ||
                              extractEstablishment(candidate)
                            return (
                              <li
                                key={candidate.id}
                                style={{ ['--candidate-i' as string]: index }}
                              >
                                <a
                                  className="concours-page__candidate-card"
                                  href={`/showroom/${candidate.id}`}
                                  aria-label={`Voir le showroom de ${name}`}
                                >
                                  <div className="concours-page__candidate-media">
                                    <img
                                      className="concours-page__candidate-photo"
                                      src={candidate.candidatePicture}
                                      alt=""
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="concours-page__candidate-body">
                                    <h3>{name}</h3>
                                    <p className="concours-page__candidate-school">
                                      <span>Établissement</span>
                                      <strong>{schoolName}</strong>
                                    </p>
                                    <div className="concours-page__candidate-actions">
                                      <span
                                        className="concours-page__candidate-vote concours-page__candidate-vote--disabled"
                                        aria-disabled="true"
                                      >
                                        Noter
                                      </span>
                                      <span className="concours-page__candidate-showroom">
                                        Showroom
                                      </span>
                                    </div>
                                  </div>
                                </a>
                              </li>
                            )
                          })}
                        </ul>
                      )
                    ) : metierListLoading ? (
                      <PageLoader label="Chargement des experts…" />
                    ) : selectedMetierExperts.length === 0 ? (
                      <p className="concours-page__candidates-empty">
                        Aucun expert validé pour ce métier pour le moment.
                      </p>
                    ) : (
                      <ul className="concours-page__candidates-grid">
                        {selectedMetierExperts.map((expert, index) => {
                          const name = expertDisplayName(expert)
                          const roles = expertRoles(expert)
                          return (
                            <li
                              key={expert.id}
                              style={{ ['--candidate-i' as string]: index }}
                            >
                              <article className="concours-page__candidate-card concours-page__expert-card">
                                <div className="concours-page__candidate-media">
                                  <img
                                    className="concours-page__candidate-photo"
                                    src={expert.photoUrl?.trim() || '/logo-worldskills.svg'}
                                    alt=""
                                    loading="lazy"
                                    onError={(event) => {
                                      const img = event.currentTarget
                                      if (img.dataset.fallbackApplied === '1') return
                                      img.dataset.fallbackApplied = '1'
                                      img.src = '/logo-worldskills.svg'
                                    }}
                                  />
                                  <span className="concours-page__expert-badge">Expert</span>
                                </div>
                                <div className="concours-page__candidate-body">
                                  <h3>{name}</h3>
                                  <p className="concours-page__candidate-school">
                                    <span>Expérience</span>
                                    <strong>{formatExperience(expert.yearsOfExperience)}</strong>
                                  </p>
                                  {roles.length > 0 ? (
                                    <ul
                                      className="concours-page__expert-roles"
                                      aria-label="Rôles"
                                    >
                                      {roles.map((role) => (
                                        <li key={role}>{role}</li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
                              </article>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="concours-page__metiers-list">
                  <div className="concours-page__candidates-head">
                    <h2>Métiers &amp; candidats</h2>
                    <p>{totalDisciplines} disciplines</p>
                  </div>

                  {competitionCategories.length === 0 ? (
                    <p className="concours-page__candidates-empty">
                      Les métiers de cette édition apparaîtront ici.
                    </p>
                  ) : (
                    competitionCategories.map((category, categoryIndex) => {
                      const meta =
                        CATEGORY_STYLES[categoryIndex % CATEGORY_STYLES.length]
                      return (
                        <section
                          key={category.id}
                          className="concours-page__metier-category"
                        >
                          <h3
                            className={`metiers-page__category-title ${meta.className}`}
                          >
                            <span
                              className="metiers-page__category-emoji"
                              aria-hidden="true"
                            >
                              {meta.emoji}
                            </span>{' '}
                            {category.name}
                          </h3>
                          <div className="metiers-page__cards-grid">
                            {category.tags.map((tag, tagIdx) => {
                              const count = tag.candidatesCount ?? 0
                              return (
                                <button
                                  key={tag.id}
                                  type="button"
                                  className="metiers-page__card concours-page__metier-card"
                                  style={{ '--card-i': tagIdx } as React.CSSProperties}
                                  onClick={() =>
                                    revealMetierPanel({
                                      categoryId: category.id,
                                      categoryName: category.name,
                                      jobSheetId: tag.id,
                                      tagName: tag.name,
                                      imageUrl: tag.imageUrl,
                                      candidatesCount: count,
                                    })
                                  }
                                >
                                  <div className="concours-page__metier-media">
                                    <CompetitionSkillImage
                                      name={tag.name}
                                      imageUrl={tag.imageUrl}
                                      alt={tag.name}
                                    />
                                    <span className="concours-page__metier-badge">
                                      {count}{' '}
                                      {count > 1 ? 'candidats' : 'candidat'}
                                    </span>
                                    <h4 className="concours-page__metier-title">
                                      {tag.name}
                                    </h4>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </section>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {!selectedMetier && editionSponsors.length > 0 ? (
          <section className="concours-page__section concours-page__edition-sponsors-section">
            <div className="concours-page__inner">
              <div className="concours-page__edition-sponsors">
                <h2 className="metiers-page__category-title metiers-page__category-title--industrielle concours-page__edition-sponsors-title">
                  <span className="metiers-page__category-emoji" aria-hidden="true">
                    🤝
                  </span>{' '}
                  Partenaires de l&apos;édition
                </h2>
                <ul className="concours-page__edition-sponsors-list concours-page__edition-sponsors-list--pelmel">
                  {editionSponsors.map((sponsor, index) => (
                    <li key={`${sponsor.name}-${index}`}>
                      {sponsor.websiteUrl?.trim() ? (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="concours-page__edition-sponsor concours-page__edition-sponsor--pelmel"
                        >
                          <img
                            src={sponsor.logoUrl || '/logo-worldskills.svg'}
                            alt={sponsor.name}
                            loading="lazy"
                            decoding="async"
                          />
                        </a>
                      ) : (
                        <span className="concours-page__edition-sponsor concours-page__edition-sponsor--pelmel">
                          <img
                            src={sponsor.logoUrl || '/logo-worldskills.svg'}
                            alt={sponsor.name}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  )
}
