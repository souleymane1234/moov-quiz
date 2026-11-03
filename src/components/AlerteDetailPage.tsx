import {
  FaArrowUpRightFromSquare,
  FaCalendarDays,
  FaFilePdf,
  FaFilm,
  FaImages,
  FaLocationDot,
} from 'react-icons/fa6'
import { useAnnonceDetail } from '../hooks/use-annonces-queries'
import {
  formatAlerteDate,
  formatAnnonceTypeLabel,
  getAnnonceTypeTone,
  getDeadlineStatus,
} from '../lib/alertes'
import { PageLoader } from './PageLoader'
import './AlertesPage.css'

function parseIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/alertes\/([^/]+)\/?$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function documentLabel(url: string, index: number): string {
  try {
    const path = new URL(url).pathname
    const file = path.split('/').filter(Boolean).pop()
    if (file) return decodeURIComponent(file)
  } catch {
    /* ignore */
  }
  return `Document ${index + 1}`
}

export function AlerteDetailPage() {
  const id = parseIdFromPath()
  const detailQuery = useAnnonceDetail(id)
  const item = detailQuery.data ?? null

  if (detailQuery.isLoading) {
    return (
      <main className="alertes-detail">
        <div className="alertes-detail__inner">
          <PageLoader label="Chargement de l’alerte…" fullPage />
        </div>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="alertes-detail">
        <div className="alertes-detail__inner">
          <a className="alertes-detail__back" href="/alertes">
            ← Retour aux alertes
          </a>
          <h1>Alerte introuvable</h1>
          <p>Cette alerte n’existe plus ou le lien est incorrect.</p>
        </div>
      </main>
    )
  }

  const tone = getAnnonceTypeTone(item.type?.name ?? '')
  const label = formatAnnonceTypeLabel(item.type?.name ?? 'Autre')
  const status = getDeadlineStatus(item.endDate)
  const images = item.imageUrls?.filter(Boolean) ?? []
  const videos = item.videoUrls?.filter(Boolean) ?? []
  const documents = item.documentUrls?.filter(Boolean) ?? []

  return (
    <main className="alertes-detail">
      <div className="alertes-detail__inner">
        <a className="alertes-detail__back" href="/alertes">
          ← Retour aux alertes
        </a>
        <article className={`alertes-detail__article alertes-card--${tone}`}>
          <div className="alertes-card__meta">
            <span className={`alertes-badge alertes-badge--${tone}`}>{label}</span>
            <span className={`alertes-deadline alertes-deadline--${status}`}>
              {status === 'closed' ? 'Clôturé' : status === 'soon' ? 'Bientôt clôturé' : 'Ouvert'}
            </span>
          </div>
          <h1>{item.title}</h1>
          <ul className="alertes-detail__facts">
            {item.place ? (
              <li>
                <FaLocationDot aria-hidden="true" />
                {item.place}
              </li>
            ) : null}
            <li>
              <FaCalendarDays aria-hidden="true" />
              {item.endDate
                ? `Date limite : ${formatAlerteDate(item.endDate)}`
                : 'Sans date limite'}
            </li>
            <li>Publiée le {formatAlerteDate(item.createdAt)}</li>
          </ul>

          <div className="alertes-detail__content">
            {item.description
              .split(/\n+/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={`${item.id}-p-${index}`}>{paragraph}</p>
              ))}
          </div>

          {images.length > 0 ? (
            <section className="alertes-detail__section" aria-labelledby="alerte-images-title">
              <h2 id="alerte-images-title">
                <FaImages aria-hidden="true" />
                Images
                <span>{images.length}</span>
              </h2>
              <div className="alertes-detail__gallery">
                {images.map((url, index) => (
                  <a
                    key={url}
                    className="alertes-detail__media-item"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Ouvrir l’image ${index + 1}`}
                  >
                    <img src={url} alt="" loading="lazy" decoding="async" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {videos.length > 0 ? (
            <section className="alertes-detail__section" aria-labelledby="alerte-videos-title">
              <h2 id="alerte-videos-title">
                <FaFilm aria-hidden="true" />
                Vidéos
                <span>{videos.length}</span>
              </h2>
              <div className="alertes-detail__videos">
                {videos.map((url, index) => (
                  <div key={url} className="alertes-detail__media-item alertes-detail__media-item--video">
                    <video
                      src={url}
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={`Vidéo ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {documents.length > 0 ? (
            <section className="alertes-detail__section" aria-labelledby="alerte-docs-title">
              <h2 id="alerte-docs-title">
                <FaFilePdf aria-hidden="true" />
                Documents
                <span>{documents.length}</span>
              </h2>
              <ul className="alertes-detail__docs">
                {documents.map((url, index) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      <span className="alertes-detail__doc-icon" aria-hidden="true">
                        <FaFilePdf />
                      </span>
                      <span className="alertes-detail__doc-body">
                        <strong>{documentLabel(url, index)}</strong>
                        <em>PDF · Ouvrir dans un nouvel onglet</em>
                      </span>
                      <FaArrowUpRightFromSquare aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  )
}
