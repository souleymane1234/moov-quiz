import { USE_MOCK_NEWS } from '../config/app-config'
import { ACTUALITES } from '../data/actualites'
import { useNewsArticle } from '../hooks/use-news-queries'
import { youtubeEmbedUrl } from '../lib/media-embed'
import { getMediaHubFromPath, parseMediaDetailSlug } from '../lib/media-hubs'
import { formatNewsDate } from '../lib/map-news'
import { PageLoader } from './PageLoader'
import './ActualiteDetailPage.css'

export function ActualiteDetailPage() {
  const pathname = window.location.pathname
  const hub = getMediaHubFromPath(pathname)
  const slug = parseMediaDetailSlug(pathname)
  const articleQuery = useNewsArticle(USE_MOCK_NEWS ? null : slug, hub.module)

  const mockArticle = slug ? ACTUALITES.find((item) => item.slug === slug) ?? null : null
  const apiArticle = articleQuery.data
  const videoSrc = apiArticle?.videoUrl?.trim() || apiArticle?.mainVideo?.trim() || apiArticle?.video?.url?.trim()
  const youtube = videoSrc ? youtubeEmbedUrl(videoSrc) : null
  const backLabel = hub.id === 'news' ? '← Retour aux actualites' : `← Retour à ${hub.label}`

  if (!USE_MOCK_NEWS && articleQuery.isLoading) {
    return (
      <main className="actu-detail">
        <div className="actu-detail__inner">
          <PageLoader label={hub.loadingLabel} fullPage />
        </div>
      </main>
    )
  }

  if (USE_MOCK_NEWS ? !mockArticle : !apiArticle) {
    return (
      <main className="actu-detail">
        <div className="actu-detail__inner">
          <a href={hub.path} className="actu-detail__back">
            {backLabel}
          </a>
          <h1>Contenu introuvable</h1>
          <p>Ce contenu n&apos;existe plus ou le lien est incorrect.</p>
        </div>
      </main>
    )
  }

  const title = USE_MOCK_NEWS ? mockArticle?.title : apiArticle?.title
  const imageSrc = USE_MOCK_NEWS ? mockArticle?.image : apiArticle?.mainImage

  return (
    <main className="actu-detail">
      <div className="actu-detail__inner">
        <a href={hub.path} className="actu-detail__back">
          {backLabel}
        </a>

        <article className="actu-detail__article">
          {youtube || videoSrc ? (
            <div className="actu-detail__hero actu-detail__hero--video">
              {youtube ? (
                <iframe
                  src={youtube}
                  title={title ?? hub.label}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video src={videoSrc} poster={imageSrc ?? undefined} controls playsInline />
              )}
            </div>
          ) : imageSrc ? (
            <div className="actu-detail__hero">
              <img src={imageSrc} alt={title ?? ''} />
            </div>
          ) : null}

          <div className="actu-detail__body">
            <p className="actu-detail__category">
              {USE_MOCK_NEWS
                ? mockArticle?.category
                : apiArticle?.category?.name || hub.label}
            </p>
            <h1>{title}</h1>

            <ul className="actu-detail__meta">
              <li>
                {formatNewsDate(
                  USE_MOCK_NEWS ? mockArticle?.publishedAt : apiArticle?.publishedAt,
                )}
              </li>
              <li>
                {USE_MOCK_NEWS
                  ? mockArticle?.source
                  : apiArticle?.author?.trim() || 'WorldSkills Côte d\'Ivoire'}
              </li>
            </ul>

            <div className="actu-detail__content">
              {USE_MOCK_NEWS ? (
                <>
                  {mockArticle?.content ? <p>{mockArticle.content}</p> : null}
                  {mockArticle?.link ? (
                    <p>
                      Source :
                      {' '}
                      <a href={mockArticle.link} target="_blank" rel="noreferrer">
                        Voir le lien original
                      </a>
                    </p>
                  ) : null}
                </>
              ) : apiArticle?.content?.trim() ? (
                /<\/?[a-z][\s\S]*>/i.test(apiArticle.content) ? (
                  <div
                    className="actu-detail__html"
                    dangerouslySetInnerHTML={{ __html: apiArticle.content }}
                  />
                ) : (
                  <p>{apiArticle.content.trim()}</p>
                )
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
