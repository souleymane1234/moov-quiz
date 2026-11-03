import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FaCalendarDays,
  FaDownload,
  FaFileLines,
  FaIdCard,
  FaPhotoFilm,
} from 'react-icons/fa6'
import { emissionQueryKeys } from '../hooks/use-emission-queries'
import { emissionRequest } from '../lib/emission-request'
import { ApiHttpError } from '../lib/api'
import type { EmissionSocialLinkDto } from '../lib/api/modules/emission/emission.types'
import { PageLoader } from './PageLoader'
import { ProfileBanner } from './ProfileBanner'
import './CandidateShowroomPage.css'

type ShowroomTab = 'personnel' | 'edition' | 'medias'

const TABS: {
  id: ShowroomTab
  label: string
  icon: typeof FaIdCard
}[] = [
  { id: 'personnel', label: 'Données personnelles', icon: FaIdCard },
  { id: 'edition', label: 'Informations de candidature', icon: FaCalendarDays },
  { id: 'medias', label: 'Médias', icon: FaPhotoFilm },
]

function parseShowroomCandidateIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/showroom\/([^/]+)\/?$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function youtubeEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl?.trim()) return null
  try {
    const url = new URL(rawUrl.trim())
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (host.includes('youtube.com')) {
      const id = url.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`
      }
      if (parts[0] === 'shorts' && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`
      }
    }
  } catch {
    return null
  }
  return null
}

function extractEstablishment(candidate: {
  schoolName?: string | null
  residenceCountry?: string | null
  description?: string | null
}): string {
  const fromSchool = candidate.schoolName?.trim()
  if (fromSchool) return fromSchool
  const match = candidate.description?.match(
    /Établissement d['']origine\s*:\s*(.+)/i,
  )
  const fromDescription = match?.[1]?.trim().split('\n')[0]?.trim()
  if (fromDescription) return fromDescription
  return candidate.residenceCountry?.trim() || '—'
}

function cleanDescription(description: string | null | undefined): string {
  if (!description?.trim()) return ''
  return description
    .replace(/\n\nÉtablissement d['']origine\s*:\s*.+$/im, '')
    .trim()
}

async function downloadQrImage(src: string, filename: string): Promise<void> {
  try {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    const anchor = document.createElement('a')
    anchor.href = src
    anchor.download = filename
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.click()
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatGender(gender: string | null | undefined): string {
  if (!gender) return '—'
  const g = gender.trim().toUpperCase()
  if (g === 'M' || g === 'MASCULIN') return 'Masculin'
  if (g === 'F' || g === 'FEMININ' || g === 'FÉMININ') return 'Féminin'
  return gender
}

function displayOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const text = String(value).trim()
  return text || '—'
}

function isLikelyImageUrl(url: string): boolean {
  const path = url.split('?')[0]?.split('#')[0]?.toLowerCase() ?? ''
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(path)
}

type GalleryItem =
  | {
      id: string
      kind: 'video'
      label: string
      url: string
      embedUrl: string | null
      title?: string | null
    }
  | {
      id: string
      kind: 'image' | 'document'
      label: string
      url: string
    }

function MetaGrid({
  items,
}: {
  items: Array<{ label: string; value: string; wide?: boolean; highlight?: boolean }>
}) {
  return (
    <dl className="showroom-page__meta">
      {items.map((item) => (
        <div
          key={item.label}
          className={[
            'showroom-page__meta-item',
            item.wide ? 'showroom-page__meta-item--wide' : '',
            item.highlight ? 'showroom-page__meta-item--highlight' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CandidateShowroomPage() {
  const candidateId = parseShowroomCandidateIdFromPath()
  const [activeTab, setActiveTab] = useState<ShowroomTab>('personnel')

  const candidateQuery = useQuery({
    queryKey: candidateId
      ? emissionQueryKeys.candidate(candidateId)
      : ['candidate', 'none'],
    queryFn: () => emissionRequest.getCandidateById(candidateId as string),
    enabled: Boolean(candidateId),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (ApiHttpError.isInstance(error) && (error.status === 404 || error.status === 429)) {
        return false
      }
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
  })

  const candidate = candidateQuery.data?.data
  const userId = candidate?.userId || candidate?.user?.id || candidate?.user?.userId || null

  const participationQuery = useQuery({
    queryKey: userId
      ? emissionQueryKeys.userParticipation(userId)
      : ['emission', 'user', 'participation', 'none'],
    queryFn: () => emissionRequest.getUserParticipation(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (ApiHttpError.isInstance(error) && (error.status === 404 || error.status === 429)) {
        return false
      }
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
  })

  const participationUser = participationQuery.data?.data?.user ?? null
  const participationEdition = participationQuery.data?.data?.edition ?? null
  const participationCandidate = participationQuery.data?.data?.candidate ?? null

  const displayName = useMemo(() => {
    if (!candidate) return ''
    const fromParticipation = [participationUser?.firstName, participationUser?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()
    const fromCandidate = [
      participationCandidate?.candidatePreName,
      participationCandidate?.candidateName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim()
    return (
      fromParticipation ||
      fromCandidate ||
      [candidate.candidatePreName, candidate.candidateName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      [candidate.user?.firstName, candidate.user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      candidate.user?.pseudo ||
      'Candidat'
    )
  }, [candidate, participationCandidate, participationUser])

  const coverSrc = useMemo(() => {
    if (!candidate) return '/logo-worldskills.svg'
    return (
      participationCandidate?.candidatePicture?.trim() ||
      candidate.candidatePicture?.trim() ||
      '/logo-worldskills.svg'
    )
  }, [candidate, participationCandidate])

  const avatarSrc = useMemo(() => {
    if (!candidate) return '/logo-worldskills.svg'
    const identity =
      participationCandidate?.identityDocumentUrl?.trim() ||
      candidate.identityDocumentUrl?.trim() ||
      ''
    const identityAsImage =
      identity && isLikelyImageUrl(identity) ? identity : ''

    return (
      participationCandidate?.candidatePicture?.trim() ||
      candidate.candidatePicture?.trim() ||
      participationUser?.profileImage?.trim() ||
      identityAsImage ||
      '/logo-worldskills.svg'
    )
  }, [candidate, participationCandidate, participationUser])

  const socialLinksRaw: EmissionSocialLinkDto[] =
    participationUser?.socialLinks ?? candidate?.user?.socialLinks ?? []

  const showroomUrl = useMemo(() => {
    if (!candidate) return ''
    const path = `/showroom/${candidate.id}`
    if (typeof window === 'undefined') return path
    return `${window.location.origin}${path}`
  }, [candidate])

  const qrCodeSrc = useMemo(() => {
    if (!showroomUrl) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(showroomUrl)}`
  }, [showroomUrl])

  const candidatureVideo =
    participationCandidate?.video ?? candidate?.video ?? null
  const videoPresentationUrl =
    candidatureVideo?.url?.trim() ||
    participationUser?.videoPresentationUrl?.trim() ||
    null
  const embedUrl = youtubeEmbedUrl(videoPresentationUrl)

  const galleryItems = useMemo((): GalleryItem[] => {
    if (!candidate) return []
    const items: GalleryItem[] = []

    if (videoPresentationUrl) {
      items.push({
        id: 'video',
        kind: 'video',
        label: 'Vidéo de présentation',
        url: videoPresentationUrl,
        embedUrl,
        title: candidatureVideo?.title,
      })
    }

    const picture =
      participationCandidate?.candidatePicture?.trim() ||
      candidate.candidatePicture?.trim() ||
      null
    if (picture) {
      items.push({
        id: 'picture',
        kind: 'image',
        label: 'Photo candidat',
        url: picture,
      })
    }

    const identity =
      participationCandidate?.identityDocumentUrl?.trim() ||
      candidate.identityDocumentUrl?.trim() ||
      null
    if (identity) {
      items.push({
        id: 'identity',
        kind: isLikelyImageUrl(identity) ? 'image' : 'document',
        label: 'Pièce d’identité',
        url: identity,
      })
    }

    return items
  }, [
    candidate,
    candidatureVideo?.title,
    embedUrl,
    participationCandidate,
    videoPresentationUrl,
  ])

  const bio =
    participationCandidate?.motivation?.trim() ||
    participationCandidate?.description?.trim() ||
    participationUser?.bio?.trim() ||
    cleanDescription(candidate?.description)
  const school =
    participationCandidate?.schoolName?.trim() ||
    participationCandidate?.school?.name?.trim() ||
    (candidate ? extractEstablishment(candidate) : '—')

  const chosenJobSheet =
    participationCandidate?.jobSheet ||
    participationEdition?.jobSheets?.[0] ||
    null
  const chosenCategory =
    (chosenJobSheet &&
    typeof chosenJobSheet === 'object' &&
    chosenJobSheet.category?.name) ||
    participationCandidate?.category?.name ||
    candidate?.category?.name
  const chosenTag =
    (chosenJobSheet && typeof chosenJobSheet === 'object' && chosenJobSheet.title) ||
    participationCandidate?.specializationJobTag?.name ||
    participationCandidate?.tag?.name ||
    candidate?.tag?.name
  const specializationName =
    participationCandidate?.specializationJobTag &&
    typeof participationCandidate.specializationJobTag === 'object'
      ? participationCandidate.specializationJobTag.name
      : null
  const secondaryJobTitles =
    participationCandidate?.secondaryJobSheets
      ?.map((sheet) => sheet.title)
      .filter(Boolean)
      .join(', ') || null
  const candidatureStatus =
    participationCandidate?.status || candidate?.status || null
  const candidatureAge =
    participationCandidate?.age ?? candidate?.age ?? null

  const candidatureRewards =
    participationCandidate?.lots ??
    participationCandidate?.rewards ??
    candidate?.lots ??
    candidate?.rewards ??
    []
  const candidaturePicture =
    participationCandidate?.candidatePicture?.trim() ||
    candidate?.candidatePicture?.trim() ||
    null
  const candidatureIdentityRaw =
    participationCandidate?.identityDocumentUrl?.trim() ||
    candidate?.identityDocumentUrl?.trim() ||
    null
  const candidatureIdentity =
    candidatureIdentityRaw && isLikelyImageUrl(candidatureIdentityRaw)
      ? candidatureIdentityRaw
      : null
  const candidatureVideoUrl = candidatureVideo?.url?.trim() || null
  const candidatureVideoEmbedUrl = youtubeEmbedUrl(candidatureVideoUrl)
  const hasCandidatureMedia = Boolean(
    candidatureVideoUrl || candidaturePicture || candidatureIdentity,
  )

  if (!candidateId) {
    return (
      <main className="showroom-page showroom-page--empty">
        <div className="showroom-page__shell">
          <h1>Showroom</h1>
          <p>Lien candidat invalide.</p>
          <a href="/competition" className="showroom-page__text-link">
            ← Retour à la compétition
          </a>
        </div>
      </main>
    )
  }

  if (candidateQuery.isLoading) {
    return (
      <main className="showroom-page showroom-page--empty">
        <div className="showroom-page__shell">
          <PageLoader label="Chargement du profil…" fullPage />
        </div>
      </main>
    )
  }

  if (candidateQuery.isError || !candidate) {
    return (
      <main className="showroom-page showroom-page--empty">
        <div className="showroom-page__shell">
          <h1>Candidat introuvable</h1>
          <p>Ce profil n&apos;existe pas ou n&apos;est plus disponible.</p>
          <a href="/competition" className="showroom-page__text-link">
            ← Retour à la compétition
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="showroom-page" aria-labelledby="showroom-title">
      <ProfileBanner
        titleId="showroom-title"
        eyebrow="Showroom"
        name={displayName}
        coverSrc={coverSrc}
        avatarSrc={avatarSrc}
        socialLinks={socialLinksRaw}
        back={{
          href: '/competition',
          label: 'Compétition',
          ariaLabel: 'Retour à la compétition',
        }}
        aside={
          qrCodeSrc ? (
            <div className="showroom-page__qr-block">
              <figure className="showroom-page__qr" aria-label="QR code du showroom">
                <img
                  src={qrCodeSrc}
                  alt={`QR code vers le showroom de ${displayName}`}
                  width={112}
                  height={112}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <button
                type="button"
                className="showroom-page__qr-download"
                aria-label="Télécharger le QR code"
                onClick={() => {
                  const safeName =
                    displayName
                      .replace(/[^\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-') || candidate.id
                  downloadQrImage(qrCodeSrc, `showroom-${safeName}-qr.png`)
                }}
              >
                <FaDownload className="showroom-page__qr-download-icon" aria-hidden="true" />
                <span className="showroom-page__qr-download-label">
                  Télécharger le QR code
                </span>
              </button>
            </div>
          ) : null
        }
      >
        <p className="showroom-page__edition">
          {participationEdition?.title ||
            candidate.edition?.title ||
            'Édition en cours'}
        </p>
        <div className="showroom-page__chips">
          {chosenCategory ? (
            <span className="showroom-page__chip">{chosenCategory}</span>
          ) : null}
          {chosenTag ? (
            <span className="showroom-page__chip showroom-page__chip--accent">
              {chosenTag}
            </span>
          ) : null}
          {(participationCandidate?.isFinalist ?? candidate.isFinalist) ? (
            <span className="showroom-page__chip showroom-page__chip--finalist">
              Finaliste
            </span>
          ) : null}
        </div>
      </ProfileBanner>

      <div className="showroom-page__shell">
        <div
          className="showroom-page__tabs"
          role="tablist"
          aria-label="Sections du profil"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`showroom-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`showroom-panel-${tab.id}`}
                aria-label={tab.label}
                title={tab.label}
                className={`showroom-page__tab${
                  activeTab === tab.id ? ' showroom-page__tab--active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="showroom-page__tab-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="showroom-page__tab-label">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div
          className="showroom-page__tab-panel"
          role="tabpanel"
          id={`showroom-panel-${activeTab}`}
          aria-labelledby={`showroom-tab-${activeTab}`}
        >
          {activeTab === 'personnel' ? (
            <section className="showroom-page__section" aria-labelledby="showroom-personal">
              <h2 id="showroom-personal">Données personnelles</h2>
              {participationQuery.isLoading ? (
                <PageLoader label="Chargement du profil…" />
              ) : participationQuery.isError && !participationUser ? (
                <p className="showroom-page__empty-note">
                  Impossible de charger les données personnelles pour le moment.
                </p>
              ) : (
                <>
                  {bio ? <p className="showroom-page__bio">{bio}</p> : null}
                  <MetaGrid
                    items={[
                      {
                        label: 'Prénom',
                        value: displayOrDash(
                          participationUser?.firstName || candidate.candidatePreName,
                        ),
                      },
                      {
                        label: 'Nom',
                        value: displayOrDash(
                          participationUser?.lastName || candidate.candidateName,
                        ),
                      },
                      {
                        label: 'Genre',
                        value: formatGender(participationUser?.gender),
                      },
                      {
                        label: 'Date de naissance',
                        value: formatDate(
                          participationUser?.dateOfBirth || candidate.user?.dateOfBirth,
                        ),
                      },
                      {
                        label: 'Nationalité',
                        value: displayOrDash(
                          participationUser?.nationality || candidate.countryName,
                        ),
                      },
                      {
                        label: 'Ville',
                        value: displayOrDash(participationUser?.city),
                      },
                      {
                        label: 'Pays',
                        value: displayOrDash(participationUser?.country),
                      },
                      {
                        label: 'Adresse',
                        value: displayOrDash(participationUser?.address),
                        wide: true,
                      },
                      {
                        label: 'Niveau académique',
                        value: displayOrDash(participationUser?.academicLevel),
                      },
                      {
                        label: 'Centres d’intérêt',
                        value:
                          participationUser?.interests &&
                          participationUser.interests.length > 0
                            ? participationUser.interests.join(', ')
                            : '—',
                        wide: true,
                      },
                    ]}
                  />
                </>
              )}
            </section>
          ) : null}

          {activeTab === 'edition' ? (
            <section className="showroom-page__section" aria-labelledby="showroom-edition">
              <h2 id="showroom-edition">Informations de candidature</h2>
              {participationQuery.isLoading ? (
                <PageLoader label="Chargement de la candidature…" />
              ) : !participationCandidate && !candidate ? (
                <p className="showroom-page__empty-note">
                  Aucune candidature associée à ce profil.
                </p>
              ) : (
                <>
                  <p className="showroom-page__bio">
                    {participationCandidate?.motivation?.trim() ||
                      participationCandidate?.description?.trim() ||
                      cleanDescription(candidate.description) ||
                      'Dossier de candidature WorldSkills Côte d’Ivoire.'}
                  </p>
                  <MetaGrid
                    items={[
                      {
                        label: 'Domaine choisi',
                        value: displayOrDash(chosenCategory),
                        highlight: true,
                      },
                      {
                        label: 'Métier choisi',
                        value: displayOrDash(
                          typeof chosenJobSheet === 'object'
                            ? chosenJobSheet?.title
                            : chosenTag,
                        ),
                        highlight: true,
                      },
                      {
                        label: 'Spécialisation',
                        value: displayOrDash(specializationName),
                      },
                      {
                        label: 'Métiers secondaires',
                        value: displayOrDash(secondaryJobTitles),
                        wide: true,
                      },
                      {
                        label: 'Établissement',
                        value: displayOrDash(school),
                      },
                      {
                        label: 'Type d’institution',
                        value: displayOrDash(
                          participationCandidate?.institutionType?.name,
                        ),
                      },
                      {
                        label: 'Niveau',
                        value: displayOrDash(participationCandidate?.level?.label),
                      },
                      {
                        label: 'Classe',
                        value: displayOrDash(
                          participationCandidate?.classe?.replace(/_/g, ' '),
                        ),
                      },
                      {
                        label: 'Statut candidature',
                        value: displayOrDash(
                          candidatureStatus?.replace(/_/g, ' '),
                        ),
                      },
                      {
                        label: 'Âge',
                        value: displayOrDash(candidatureAge),
                      },
                      {
                        label: 'Pays de nationalité',
                        value: displayOrDash(
                          participationCandidate?.nationality ||
                            participationUser?.nationality,
                        ),
                      },
                      {
                        label: 'Pays de résidence',
                        value: displayOrDash(
                          participationCandidate?.residenceCountry ||
                            participationUser?.country,
                        ),
                      },
                      {
                        label: 'Email',
                        value: displayOrDash(
                          participationCandidate?.contactEmail ||
                            participationUser?.email,
                        ),
                      },
                      {
                        label: 'Téléphone',
                        value: displayOrDash(
                          participationCandidate?.contactPhone ||
                            participationUser?.phoneNumber,
                        ),
                      },
                      {
                        label: 'Contact d’urgence',
                        value: displayOrDash(
                          [
                            participationCandidate?.emergencyContactName,
                            participationCandidate?.emergencyContactRelation,
                            participationCandidate?.emergencyContactPhone,
                          ]
                            .filter(Boolean)
                            .join(' · '),
                        ),
                        wide: true,
                      },
                    ]}
                  />

                  <div className="showroom-page__block">
                    <h3>Médias</h3>
                    {hasCandidatureMedia ? (
                      <ul className="showroom-page__edition-media">
                        {candidaturePicture ? (
                          <li className="showroom-page__edition-media-item">
                            <span className="showroom-page__edition-media-label">
                              Photo candidat
                            </span>
                            <a
                              href={candidaturePicture}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="showroom-page__gallery-media"
                              aria-label="Voir la photo candidat"
                            >
                              <img
                                src={candidaturePicture}
                                alt="Photo candidat"
                                loading="lazy"
                              />
                            </a>
                          </li>
                        ) : null}
                        {candidatureIdentity ? (
                          <li className="showroom-page__edition-media-item">
                            <span className="showroom-page__edition-media-label">
                              Pièce d’identité
                            </span>
                            <a
                              href={candidatureIdentity}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="showroom-page__gallery-media"
                              aria-label="Voir la pièce d’identité"
                            >
                              <img
                                src={candidatureIdentity}
                                alt="Pièce d’identité"
                                loading="lazy"
                              />
                            </a>
                          </li>
                        ) : null}
                        {candidatureVideoUrl ? (
                          <li className="showroom-page__edition-media-item showroom-page__edition-media-item--video">
                            <span className="showroom-page__edition-media-label">
                              Vidéo de présentation
                              {candidatureVideo?.title
                                ? ` · ${candidatureVideo.title}`
                                : ''}
                            </span>
                            <div className="showroom-page__video-frame showroom-page__video-frame--compact">
                              {candidatureVideoEmbedUrl ? (
                                <iframe
                                  title={
                                    candidatureVideo?.title ||
                                    `Vidéo de ${displayName}`
                                  }
                                  src={candidatureVideoEmbedUrl}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={candidatureVideoUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  title={
                                    candidatureVideo?.title ||
                                    `Vidéo de ${displayName}`
                                  }
                                />
                              )}
                            </div>
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      <p className="showroom-page__empty-note">
                        Aucun média de candidature disponible.
                      </p>
                    )}
                  </div>

                  <div className="showroom-page__block">
                    <h3>Récompenses</h3>
                    {candidatureRewards.length > 0 ? (
                      <ul className="showroom-page__lots">
                        {candidatureRewards.map((lot, index) => (
                          <li key={`${lot.title}-${index}`}>
                            {lot.imageUrl?.trim() ? (
                              <img
                                className="showroom-page__lots-image"
                                src={lot.imageUrl}
                                alt=""
                                loading="lazy"
                              />
                            ) : null}
                            <div className="showroom-page__lots-body">
                              <strong>{lot.title}</strong>
                              {lot.description?.trim() ? (
                                <span>{lot.description}</span>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="showroom-page__empty-note">
                        Il n&apos;a pas encore de récompense.
                      </p>
                    )}
                  </div>

                  {participationCandidate?.experiences?.trim() ? (
                    <div className="showroom-page__block">
                      <h3>Expériences</h3>
                      <p className="showroom-page__preline">
                        {participationCandidate.experiences}
                      </p>
                    </div>
                  ) : null}

                  {participationCandidate?.complementarySkills?.trim() ? (
                    <div className="showroom-page__block">
                      <h3>Compétences complémentaires</h3>
                      <p className="showroom-page__preline">
                        {participationCandidate.complementarySkills}
                      </p>
                    </div>
                  ) : null}

                  {participationCandidate?.motivation?.trim() ? (
                    <div className="showroom-page__block">
                      <h3>Motivation</h3>
                      <p className="showroom-page__preline">
                        {participationCandidate.motivation}
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          ) : null}

          {activeTab === 'medias' ? (
            <section className="showroom-page__section" aria-labelledby="showroom-video">
              <h2 id="showroom-video">Médias</h2>
              {galleryItems.length === 0 ? (
                <p className="showroom-page__empty-note">
                  Aucun média disponible pour ce candidat.
                </p>
              ) : (
                <ul className="showroom-page__gallery">
                  {galleryItems.map((item) => (
                    <li
                      key={item.id}
                      className={[
                        'showroom-page__gallery-item',
                        item.kind === 'video'
                          ? 'showroom-page__gallery-item--video'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className="showroom-page__gallery-label">
                        <span>{item.label}</span>
                        {item.kind === 'video' && item.title ? (
                          <span className="showroom-page__gallery-sublabel">
                            {item.title}
                          </span>
                        ) : null}
                      </div>

                      {item.kind === 'video' ? (
                        <div className="showroom-page__video-frame">
                          {item.embedUrl ? (
                            <iframe
                              title={item.title || `Vidéo de ${displayName}`}
                              src={item.embedUrl}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={item.url}
                              controls
                              playsInline
                              preload="metadata"
                              title={item.title || `Vidéo de ${displayName}`}
                            >
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ouvrir la vidéo
                              </a>
                            </video>
                          )}
                        </div>
                      ) : null}

                      {item.kind === 'image' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="showroom-page__gallery-media"
                          aria-label={`Voir ${item.label}`}
                        >
                          <img src={item.url} alt={item.label} loading="lazy" />
                        </a>
                      ) : null}

                      {item.kind === 'document' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="showroom-page__gallery-doc"
                        >
                          <FaFileLines aria-hidden="true" />
                          <span>Ouvrir le document</span>
                          <FaDownload aria-hidden="true" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  )
}
