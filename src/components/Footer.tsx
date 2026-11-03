import './Footer.css'
import './PlayStoreDownloadButton.css'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from 'react-icons/fa6'
import { PlayStoreDownloadButton } from './PlayStoreDownloadButton'

const CURRENT_YEAR = new Date().getFullYear()

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/profile.php?id=61593259599194',
    label: 'Facebook',
    icon: FaFacebookF,
  },
  {
    href: 'https://www.instagram.com/worldskills_ci',
    label: 'Instagram',
    icon: FaInstagram,
  },
  {
    href: 'https://www.linkedin.com/in/worldskills-cote-d-ivoire-account-97237542b/',
    label: 'LinkedIn',
    icon: FaLinkedinIn,
  },
  {
    href: 'https://www.tiktok.com/@worldskills.cte.d',
    label: 'TikTok',
    icon: FaTiktok,
  },
  {
    href: 'https://www.youtube.com/@WorldskillsCôtedIvoire',
    label: 'YouTube',
    icon: FaYoutube,
  },
] as const

const FOOTER_COLUMNS = [
  {
    title: 'Navigation',
    links: [
      { href: '/#accueil', label: 'Accueil' },
      { href: '/competition', label: 'Compétitions' },
      { href: '/actualites', label: 'Actualités' },
      { href: '/alertes', label: 'Alertes' },
      { href: '/play', label: 'Play' },
      { href: '/reels', label: 'Reels' },
      { href: '/partenariat', label: 'Partenariat' },
    ],
  },
  {
    title: 'Partenaires',
    links: [
      { href: '/#partenaires', label: 'Nos partenaires' },
      { href: '/partenariat', label: 'Devenir partenaire' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { href: 'mailto:contact@worldskills.ci', label: 'contact@worldskills.ci' },
      {
        href: 'mailto:worldskills@ongreveletontalent.com',
        label: 'worldskills@ongreveletontalent.com',
      },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="site-footer" aria-label="Pied de page">
      <div className="site-footer__main">
        <section className="site-footer__brand" aria-label="WorldSkills Côte d'Ivoire">
          <a className="site-footer__brand-logo" href="/#accueil" aria-label="Accueil">
            <img
              className="site-footer__logo site-footer__logo--ortt"
              src="/lta.png"
              alt="Révèle Ton Talent"
              width={160}
              height={56}
            />
            <img
              className="site-footer__logo site-footer__logo--lta"
              src="/ortt.png"
              alt="LTA"
              width={160}
              height={56}
            />
          </a>
          <p className="site-footer__tagline">
            Olympiades des métiers
          </p>
          <ul className="site-footer__socials" aria-label="Réseaux sociaux">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div className="site-footer__app">
            <p className="site-footer__app-label">app android disponible</p>
            <PlayStoreDownloadButton compact className="ws-play-btn--footer" />
          </div>
        </section>

        <div className="site-footer__columns">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} className="site-footer__column" aria-label={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          <a href="/partenariat#contact">Mentions légales</a>
          <a href="/partenariat#contact">Politique de confidentialité</a>
        </div>
        <p className="site-footer__copy">
          {CURRENT_YEAR} WorldSkills Côte d&apos;Ivoire · ONG RTT. Tous droits réservés.
        </p>
      </div>

      {/* <a className="site-footer__to-top" href="/#accueil" aria-label="Retour en haut">
        ^
      </a> */}
    </footer>
  )
}
