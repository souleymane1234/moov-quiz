import { useState } from 'react'
import './ContactSection.css'
import { CaptchaField } from './CaptchaField'

type ContactSectionProps = {
  /** Sur la page partenariat : éviter le lien « Devenir partenaire » redondant. */
  embedded?: boolean
}

export function ContactSection({ embedded = false }: ContactSectionProps) {
  const [captchaChecked, setCaptchaChecked] = useState(false)

  return (
    <section
      id="contact"
      className={`ws-contact${embedded ? ' ws-contact--embedded' : ''}`}
      aria-labelledby="ws-contact-title"
    >
      <div className="ws-contact__inner">
        <div className="ws-contact__intro">
          <p className="ws-contact__eyebrow">Contact</p>
          <h2 id="ws-contact-title">Comité National WorldSkills Côte d&apos;Ivoire — ONG Révèle Ton Talent</h2>
          <p className="ws-contact__lead">
            Pour les inscriptions, le partenariat, la presse ou toute question sur
            les Olympiades des métiers — WorldSkills Côte d&apos;Ivoire.
          </p>
        </div>

        <div className="ws-contact__grid">
          <article className="ws-contact__card">
            <h3>Coordonnées</h3>
            <div className="ws-contact__badges" aria-hidden="true">
              <span>Révèle Ton Talent</span>
              <span>WorldSkills Côte d&apos;Ivoire</span>
            </div>
            <ul className="ws-contact__channels">
              <li>
                <strong>E-mail</strong>
                <a href="mailto:contact@worldskills.ci">contact@worldskills.ci</a>
                <a href="mailto:worldskills@ongreveletontalent.com">
                  worldskills@ongreveletontalent.com
                </a>
              </li>
              <li>
                <strong>Lieu de la finale</strong>
                <span>Parc des Expositions d&apos;Abidjan</span>
              </li>
              <li>
                <strong>ONG</strong>
                <span>Révèle Ton Talent</span>
              </li>
              <li>
                <strong>Ministère</strong>
                <span>Enseignement technique &amp; formation professionnelle</span>
              </li>
            </ul>
            <div className="ws-contact__actions">
              {!embedded ? (
                <a href="/partenariat" className="ws-contact__btn ws-contact__btn--primary">
                  Devenir partenaire
                </a>
              ) : null}
              <a
                href="/competition"
                className={`ws-contact__btn${embedded ? ' ws-contact__btn--primary' : ' ws-contact__btn--ghost'}`}
              >
                Voir la compétition
              </a>
            </div>
          </article>

          <article className="ws-contact__card">
            <h3>Écrire au comité</h3>
            <p className="ws-contact__form-intro">
              Décrivez votre besoin (sponsoring, challenge, appui technique ou média), notre équipe vous répond rapidement.
            </p>
            <form
              className="ws-contact__form"
              onSubmit={(event) => {
                event.preventDefault()
                if (!captchaChecked) {
                  window.alert('Veuillez confirmer que vous n\'êtes pas un robot.')
                  return
                }
                window.alert('Merci, votre message a été envoyé.')
              }}
            >
              <div className="ws-contact__form-row">
                <label>
                  Nom complet
                  <input name="name" required autoComplete="name" placeholder="Ex: Awa Koné" />
                </label>
                <label>
                  Entreprise / organisation
                  <input name="company" autoComplete="organization" placeholder="Ex: Nom de votre structure" />
                </label>
              </div>

              <div className="ws-contact__form-row">
                <label>
                  E-mail
                  <input name="email" type="email" required autoComplete="email" placeholder="exemple@entreprise.ci" />
                </label>
                <label>
                  Téléphone
                  <input name="phone" type="tel" autoComplete="tel" placeholder="+225 XX XX XX XX XX" />
                </label>
              </div>

              <label>
                Sujet
                <select name="subject" required defaultValue="">
                  <option value="" disabled>
                    Choisir un sujet
                  </option>
                  <option value="partenariat-strategique">Partenariat stratégique</option>
                  <option value="partenariat-challenge">Partenariat challenge</option>
                  <option value="partenariat-metier">Partenariat métier / innovation</option>
                  <option value="partenariat-impact">Partenariat impact / institutionnel</option>
                  <option value="presse">Presse / média</option>
                  <option value="autre">Autre demande</option>
                </select>
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  rows={5}
                  required
                  placeholder="Présentez votre besoin, votre objectif et le type de collaboration envisagé."
                />
              </label>

              <label className="ws-contact__consent">
                <input type="checkbox" name="consent" required />
                <span>J&apos;accepte d&apos;être recontacté par l&apos;équipe WorldSkills Côte d&apos;Ivoire.</span>
              </label>

              <CaptchaField checked={captchaChecked} onChange={setCaptchaChecked} />

              <button
                type="submit"
                className="ws-contact__btn ws-contact__btn--primary"
                disabled={!captchaChecked}
              >
                Envoyer le message
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  )
}
