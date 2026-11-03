import './AcademyPromo.css'

export function AcademyPromo() {
  return (
    <section
      id="act"
      className="ws-act"
      aria-labelledby="ws-act-title"
    >
      <div className="ws-act__inner">
        <p className="ws-act__eyebrow">ACT</p>
        <h2 id="ws-act-title" className="ws-act__title">
          Académie des Talents
        </h2>
        <p className="ws-act__lead">
          Programme stratégique du ministère pour moderniser la formation
          professionnelle, améliorer l&apos;accès à l&apos;enseignement technique
          et promouvoir durablement la qualité des parcours — au cœur des
          WorldSkills Côte d&apos;Ivoire.
        </p>
        <ul className="ws-act__points">
          <li>Modernisation des filières techniques</li>
          <li>Adéquation formation–emploi</li>
          <li>Exposition aux standards internationaux</li>
        </ul>
      </div>
    </section>
  )
}
