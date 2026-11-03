import { USE_MOCK_NEWS } from '../config/app-config'
import { ACTUALITES } from '../data/actualites'
import { useNewsApercu } from '../hooks/use-news-queries'
import { mapNewsItemToApercu } from '../lib/map-news'
import { useRevealOnView } from '../hooks/useRevealOnView'
import { PageLoader } from './PageLoader'
import './ActualitesAccess.css'

const ACTUALITES_VOIR_PLUS_HREF = '/actualites'

export function ActualitesAccess() {
  const { ref, isVisible } = useRevealOnView<HTMLElement>()
  const apercuQuery = useNewsApercu(4)
  const mockItems = [...ACTUALITES]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 4)
    .map((item) =>
      mapNewsItemToApercu({
        id: String(item.id),
        contentType: 'news',
        title: item.title,
        summary: item.description,
        mainImage: item.image,
        author: item.source,
        publishedAt: item.publishedAt,
        slug: item.slug,
        category: { id: item.category, name: item.category },
      }),
    )

  const items = USE_MOCK_NEWS ? mockItems : apercuQuery.items

  return (
    <section
      ref={ref}
      id="actualites"
      className={`act-access${isVisible ? ' act-access--visible' : ''}`}
      aria-labelledby="act-access-title"
    >
      <div className="act-access__inner">
        <header className="act-access__header">
          <div className="act-access__headline">
            <p className="act-access__eyebrow">Restez informés</p>
            <h2 id="act-access-title" className="act-access__title">
              Actualités WorldSkills Côte d&apos;Ivoire
            </h2>
          </div>
          {/* <p className="act-access__intro">
            Annonces officielles, résultats des présélections et coulisses des
            Olympiades des métiers.
          </p> */}
        </header>

        {!USE_MOCK_NEWS && apercuQuery.isLoading ? (
          <PageLoader label="Chargement des actualités…" />
        ) : null}

        {!USE_MOCK_NEWS && apercuQuery.isError ? (
          <p className="act-access__error">Impossible de charger les actualités.</p>
        ) : null}

        <ul className="act-access__grid" id="actualites-apercu">
          {items.map((item) => (
            <li key={item.id} className="act-access__card-item">
              <article className="act-access__news-card">
                <a
                  className="act-access__news-media"
                  href={item.href}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    className="act-access__news-img"
                    src={item.imageSrc}
                    alt={item.imageAlt || ''}
                    width={640}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="act-access__news-cat">{item.category}</span>
                </a>
                <div className="act-access__news-body">
                  <time dateTime={item.isoDate}>{item.date}</time>
                  <h3 className="act-access__news-title">
                    <a href={item.href}>{item.title}</a>
                  </h3>
                  <p className="act-access__news-excerpt">{item.excerpt}</p>
                  <a className="act-access__news-link" href={item.href}>
                    Lire la suite
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="act-access__actions">
          <a
            className="act-access__cta"
            href={ACTUALITES_VOIR_PLUS_HREF}
            id="actualites-voir-plus"
          >
            Voir plus d&apos;actualités
          </a>
        </div>
      </div>
    </section>
  )
}
