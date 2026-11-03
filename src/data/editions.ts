export type Competitor = {
  id: string
  name: string
  username: string
  age: number
  region: string
  city: string
  establishment?: string
  photoSrc: string
  bio: string
  /** Discipline / métier en compétition */
  tradition: string
  votes: number
  points: number
  quizPoints: number
  mentorName: string
  mentorSubtitle: string
  videoSrc?: string
}

/** @deprecated Alias pour compatibilité EditionPage */
export type Candidate = Competitor

type CompetitorInput = Omit<
  Competitor,
  'username' | 'votes' | 'points' | 'quizPoints' | 'mentorName' | 'mentorSubtitle'
> &
  Partial<Pick<Competitor, 'username' | 'votes' | 'points' | 'quizPoints' | 'mentorName' | 'mentorSubtitle'>>

function enrichCompetitors(list: CompetitorInput[]): Competitor[] {
  const pointPresets = [4520, 4180, 3860, 3520, 3280, 3010, 2760, 2540]

  return list.map((item, index) => {
    const slug = item.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')

    return {
      username: item.username ?? `${slug}_${String(index + 1).padStart(2, '0')}`,
      votes: item.votes ?? 0,
      points: item.points ?? pointPresets[index] ?? 1500,
      quizPoints: item.quizPoints ?? 0,
      mentorName: item.mentorName ?? 'Encadrement',
      mentorSubtitle: item.mentorSubtitle ?? "WorldSkills Côte d'Ivoire",
      videoSrc: item.videoSrc ?? '/worldskills.mp4',
      ...item,
    }
  })
}

export type EditionPrize = {
  title: string
  description: string
}

export type EditionSponsor = {
  name: string
  logoSrc: string
  tier: 'principal' | 'or' | 'argent' | 'bronze'
}

export type GalleryPhoto = {
  id: string
  src: string
  alt: string
  caption?: string
}

export type Edition = {
  year: number
  status: 'current' | 'past'
  title: string
  theme: string
  tagline: string
  description: string
  coverImageSrc: string
  videoSrc: string
  videoPosterSrc: string
  dates: string
  location: string
  candidateCount: number
  candidates: Competitor[]
  winnerId?: string
  prizes: EditionPrize[]
  rulesSummary: string[]
  rulesDocumentHref: string
  sponsors: EditionSponsor[]
  highlights: string[]
  galleryPhotos: GalleryPhoto[]
}

const PHOTO = (seed: string) => `https://picsum.photos/seed/wsci-${seed}/480/640`

const EDITION_GALLERY_FILES = [
  '/edition/1.jpg',
  '/edition/2.jpg',
  '/edition/3.jpg',
  '/edition/4.jpg',
  '/edition/5.jpg',
  '/edition/6.jpg',
  '/edition/7.jpg',
] as const

function buildGalleryFromEditionFolder(year: number): GalleryPhoto[] {
  return EDITION_GALLERY_FILES.map((src, index) => ({
    id: `${year}-photo-${index + 1}`,
    src,
    alt: `Edition ${year} - photo ${index + 1}`,
    caption: `Edition ${year} - photo ${index + 1}`,
  }))
}

// 2026 n’a pas encore commencé : pas de galerie pour le moment.
const GALLERY_2026: GalleryPhoto[] = []

const GALLERY_2025 = buildGalleryFromEditionFolder(2025)

const GALLERY_2024 = buildGalleryFromEditionFolder(2024)

const GALLERY_2023 = buildGalleryFromEditionFolder(2023)

export const EDITION_NAV_YEARS = [2026, 2025, 2024, 2023] as const

export const CURRENT_EDITION_YEAR = 2026

export function editionPath(year: number): string {
  return year === CURRENT_EDITION_YEAR ? '/edition' : `/edition/${year}`
}

export function parseEditionYearFromPath(pathname = window.location.pathname): number {
  const match = pathname.match(/^\/edition\/(\d{4})\/?$/)
  if (match) return Number(match[1])
  if (pathname === '/edition' || pathname === '/edition/') return CURRENT_EDITION_YEAR
  return CURRENT_EDITION_YEAR
}

export const EDITIONS: Edition[] = [
  {
    year: 2026,
    status: 'current',
    title: 'WorldSkills Côte d’Ivoire 2026',
    theme: 'FORMATION – INNOVATION – EMPLOYABILITE DES JEUNES',
    tagline: '6ᵉ édition des Olympiades des métiers — Abidjan.',
    description:
      'Édition en cours : candidatures en ligne, formation, compétition nationale et sélection de 300 finalistes et exposants.',
    coverImageSrc: '/miss.jpg',
    videoSrc: '/worldskills.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: '02 — 04 octobre 2026',
    location: 'Parc des Expositions d’Abidjan',
    candidateCount: 1500,
    candidates: [],
    prizes: [],
    rulesSummary: ['Édition en cours.'],
    rulesDocumentHref: '#contact',
    sponsors: [
      { name: 'Ministère', logoSrc: '/trustCaroussel/port-1.png', tier: 'principal' },
      { name: 'CIE', logoSrc: '/trustCaroussel/port-2.png', tier: 'or' },
    ],
    highlights: ['25 disciplines', '1500+ compétiteurs', '300 finalistes'],
    galleryPhotos: GALLERY_2026,
  },
  {
    year: 2025,
    status: 'past',
    title: 'WorldSkills Côte d’Ivoire 2025',
    theme: 'FORMATION – INNOVATION – EMPLOYABILITE DES JEUNES',
    tagline: '5ᵉ édition des Olympiades des métiers — finale nationale au Parc des Expositions d’Abidjan.',
    description:
      'Organisées via la Direction de la Vie scolaire, les Olympiades des métiers réunissent les meilleurs apprenants des établissements de formation professionnelle. Présélections régionales à Abidjan, Bouaké, Gagnoa et Korhogo, puis finale nationale au Parc des Expositions d’Abidjan.',
    coverImageSrc: '/miss.jpg',
    videoSrc: '/worldskills.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: '26 — 29 novembre 2025',
    location: 'Parc des Expositions d’Abidjan',
    candidateCount: 325,
    candidates: enrichCompetitors([
      {
        id: '2025-kouame',
        name: 'Kouamé Amani',
        age: 20,
        region: 'Gôh',
        city: 'Gagnoa',
        establishment: 'LPIG Gagnoa',
        photoSrc: PHOTO('2025-kouame'),
        tradition: 'Menuiserie',
        bio: 'Médaillé or menuiserie — présélection Gagnoa. Projet : atelier mobile de formation.',
      },
      {
        id: '2025-traore',
        name: 'Aminata Traoré',
        age: 19,
        region: 'Lagunes',
        city: 'Abidjan',
        establishment: 'Parc des Expositions d’Abidjan',
        photoSrc: PHOTO('2025-traore'),
        tradition: 'Cuisine',
        bio: 'Finaliste nationale — excellence en service et créativité culinaire.',
      },
      {
        id: '2025-diallo',
        name: 'Mamadou Diallo',
        age: 21,
        region: 'Savanes',
        city: 'Korhogo',
        establishment: 'Lycée professionnel Korhogo',
        photoSrc: PHOTO('2025-diallo'),
        tradition: 'Électricité automobile',
        bio: 'Repéré lors des phases régionales pour la rigueur technique et la sécurité.',
      },
      {
        id: '2025-kone',
        name: 'Fatou Koné',
        age: 22,
        region: 'Vallée du Bandama',
        city: 'Bouaké',
        establishment: 'CFP Bouaké',
        photoSrc: PHOTO('2025-kone'),
        tradition: 'CAO / DAO',
        bio: 'Compétitrice en conception assistée par ordinateur — profil innovation.',
      },
    ]),
    winnerId: '2025-kouame',
    prizes: [
      {
        title: 'Médaille nationale',
        description: 'Reconnaissance officielle et sélection pour les phases internationales.',
      },
      {
        title: 'Accompagnement Académie des Talents (ACT)',
        description: 'Orientation vers les filières d’excellence et le mentorat professionnel.',
      },
      {
        title: 'Visibilité partenaires',
        description: 'Mise en avant auprès des entreprises engagées (CIE, secteur privé, ONG).',
      },
    ],
    rulesSummary: [
      'Être apprenant d’un établissement de formation professionnelle agréé.',
      'Avoir entre 15 et 23 ans (règlement WorldSkills International).',
      'Être sélectionné via les présélections régionales officielles.',
      'Respecter le règlement technique de chaque discipline.',
    ],
    rulesDocumentHref: '#contact',
    sponsors: [
      { name: 'Ministère', logoSrc: '/trustCaroussel/port-1.png', tier: 'principal' },
      { name: 'CIE', logoSrc: '/trustCaroussel/port-2.png', tier: 'or' },
      { name: 'Partenaire Or', logoSrc: '/trustCaroussel/port-3.png', tier: 'or' },
      { name: 'Partenaire Argent', logoSrc: '/trustCaroussel/port-4.png', tier: 'argent' },
      { name: 'Partenaire Bronze', logoSrc: '/trustCaroussel/port-5.png', tier: 'bronze' },
    ],
    highlights: [
      '25 disciplines',
      '15 établissements finalistes',
      '325+ compétiteurs',
      '4 villes de présélection',
    ],
    galleryPhotos: GALLERY_2025,
  },
  {
    year: 2024,
    status: 'past',
    title: 'WorldSkills Côte d’Ivoire 2024',
    theme: 'Assurer l’adéquation compétences–employabilité pour un développement durable',
    tagline: '4ᵉ édition — 271 compétiteurs, 46 établissements.',
    description:
      'Phases finales sur cinq corps de métiers après un mois de présélections. Village partenaires et stands d’exposition au Parc des Expositions d’Abidjan.',
    coverImageSrc: '/miss.jpg',
    videoSrc: '/worldskills.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: 'Novembre 2024',
    location: 'Parc des Expositions d’Abidjan',
    candidateCount: 271,
    winnerId: '2024-yao',
    candidates: enrichCompetitors([
      {
        id: '2024-yao',
        name: 'Jean Yao',
        age: 20,
        region: 'Lagunes',
        city: 'Abidjan',
        establishment: 'Parc des Expositions d’Abidjan',
        photoSrc: PHOTO('2024-yao'),
        tradition: 'Domotique',
        bio: 'Lauréat édition 2024 — domotique et systèmes intelligents.',
      },
      {
        id: '2024-bamba',
        name: 'Salimata Bamba',
        age: 19,
        region: 'Comoé',
        city: 'Aboisso',
        establishment: 'Lycée pro Aboisso',
        photoSrc: PHOTO('2024-bamba'),
        tradition: 'Esthétique',
        bio: 'Finaliste — excellence en soins et image professionnelle.',
      },
    ]),
    prizes: [
      { title: 'Médailles par discipline', description: "Or, argent et bronze selon les standards WorldSkills Côte d'Ivoire." },
    ],
    rulesSummary: ['Édition clôturée — règlement 2024 archivé.'],
    rulesDocumentHref: '#contact',
    sponsors: [
      { name: 'Ministère', logoSrc: '/trustCaroussel/port-6.png', tier: 'principal' },
      { name: 'CIE', logoSrc: '/trustCaroussel/port-7.png', tier: 'or' },
    ],
    highlights: ['271 compétiteurs', '68 équipes', '46 établissements'],
    galleryPhotos: GALLERY_2024,
  },
  {
    year: 2023,
    status: 'past',
    title: 'WorldSkills Côte d’Ivoire 2023',
    theme: 'Valoriser les talents techniques ivoiriens',
    tagline: '3ᵉ édition — consolidation du dispositif national.',
    description:
      'Édition marquée par l’élargissement des disciplines et la mobilisation des établissements de formation professionnelle.',
    coverImageSrc: '/miss.jpg',
    videoSrc: '/worldskills.mp4',
    videoPosterSrc: '/miss.jpg',
    dates: 'Octobre 2023',
    location: 'Abidjan',
    candidateCount: 180,
    candidates: [],
    prizes: [{ title: 'Lauréats 2023', description: 'Médailles nationales par discipline.' }],
    rulesSummary: ['Édition clôturée.'],
    rulesDocumentHref: '#contact',
    sponsors: [{ name: 'Ministère', logoSrc: '/trustCaroussel/port-8.png', tier: 'principal' }],
    highlights: ['Phases régionales', 'Finale nationale'],
    galleryPhotos: GALLERY_2023,
  },
]

export function getEditionByYear(year: number): Edition | undefined {
  return EDITIONS.find((e) => e.year === year)
}

export function getCurrentEdition(): Edition {
  return getEditionByYear(CURRENT_EDITION_YEAR) ?? EDITIONS[0]
}

export function getCandidateRank(edition: Edition, candidateId: string): number {
  const sorted = [...edition.candidates].sort((a, b) => b.points - a.points)
  const index = sorted.findIndex((c) => c.id === candidateId)
  return index === -1 ? 0 : index + 1
}

export function resolveVoteContext(candidateId: string | null): {
  edition: Edition
  candidate: Competitor
  rank: number
} | null {
  if (!candidateId) return null

  for (const edition of EDITIONS) {
    const candidate = edition.candidates.find((c) => c.id === candidateId)
    if (candidate) {
      return {
        edition,
        candidate,
        rank: getCandidateRank(edition, candidateId),
      }
    }
  }

  return null
}

export function parseVoteCandidateIdFromPath(): string | null {
  const match = window.location.pathname.match(/^\/vote\/([^/]+)\/?$/)
  return match?.[1] ?? null
}
