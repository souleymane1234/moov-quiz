export type SkillCategory =
  | 'technologie-tertiaire'
  | 'hotellerie-agroalimentaire'
  | 'technologie-industrielle'
  | 'arts-mode-esthetique'
  | 'batiment'

export type Skill = {
  id: string
  name: string
  category: SkillCategory
  icon: string
}

const SKILL_IMAGE_BY_ID: Partial<Record<string, string>> = {
  'finance-comptabilite': 'Finance-comptabilité.jpg',
  entrepreneuriat: 'entrepreneuriat.jpg',
  communication: 'Communication.jpg',

  cuisine: 'Cuisine.jpg',
  'boulangerie-patisserie': 'Boulangerie-pâtisserie.jpg',
  'bar-cocktail': 'Bar cocktail.jpg',
  'transformation-agroalimentaire': 'Transformation agroalimentaire.jpg',

  'maintenance-cnc': 'Maintenance industrielle et usinage CNC.jpg',
  mecatronique: 'Mécatronique.jpg',
  robotique: 'Robotique.jpg',
  soudage: 'Soudage.jpg',
  'mecanique-automobile': 'Mécanique automobile.jpg',
  aeronautique: 'Aéronautique.jpg',
  'numerique-technologie': 'Numérique et technologie.jpg',

  couture: 'Couture.jpg',
  coiffure: 'coiffure.jpeg',
  bijouterie: 'bijouterie.jpeg',

  maconnerie: 'maconnerie.jpeg',
  'menuiserie-bois': 'menuiserie de bois.jpeg',
  carrelage: 'carrelage.jpeg',
  peinture: 'peinture.jpeg',
  'installation-sanitaire': 'Installation sanitaire.jpeg',
  electricite: 'electricité.jpeg',
  'froid-climatisation': 'Froid-climatisation.jpeg',
  domotique: 'domotique.jpeg',
}

export function getSkillImageCandidates(id: string, _name: string): string[] {
  const strictByIdBase = `/image discipline/${id}`
  const strictCandidates = [
    encodeURI(`${strictByIdBase}.jpg`),
    encodeURI(`${strictByIdBase}.jpeg`),
    encodeURI(`${strictByIdBase}.png`),
    encodeURI(`${strictByIdBase}.webp`),
    encodeURI(`${strictByIdBase}.avif`),
  ]
  const forcedFile = SKILL_IMAGE_BY_ID[id]
  if (forcedFile) {
    return [encodeURI(`/image discipline/${forcedFile}`), ...strictCandidates]
  }
  return strictCandidates
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  'technologie-tertiaire': 'TECHNOLOGIE TERTIAIRE',
  'hotellerie-agroalimentaire': 'HOTELLERIE ET AGROALIMENTAIRE',
  'technologie-industrielle': 'TECHNOLOGIE INDUSTRIELLE',
  'arts-mode-esthetique': 'ARTS – MODE ET ESTHETIQUE',
  batiment: 'BATIMENT',
}

/** Domaines professionnels concernés — WorldSkills Côte d'Ivoire. */
export const SKILLS: Skill[] = [
  { id: 'finance-comptabilite', name: 'Finance-comptabilité', category: 'technologie-tertiaire', icon: '📊' },
  { id: 'entrepreneuriat', name: 'Entrepreneuriat', category: 'technologie-tertiaire', icon: '💼' },
  { id: 'communication', name: 'Communication', category: 'technologie-tertiaire', icon: '📣' },

  { id: 'cuisine', name: 'Cuisine', category: 'hotellerie-agroalimentaire', icon: '👨‍🍳' },
  { id: 'boulangerie-patisserie', name: 'Boulangerie-pâtisserie', category: 'hotellerie-agroalimentaire', icon: '🥖' },
  { id: 'bar-cocktail', name: 'Bar cocktail', category: 'hotellerie-agroalimentaire', icon: '🍸' },
  { id: 'transformation-agroalimentaire', name: 'Transformation agroalimentaire', category: 'hotellerie-agroalimentaire', icon: '🥗' },

  {
    id: 'maintenance-cnc',
    name: 'Maintenance industrielle et usinage CNC',
    category: 'technologie-industrielle',
    icon: '⚙️',
  },
  { id: 'mecatronique', name: 'Mécatronique', category: 'technologie-industrielle', icon: '🧠' },
  { id: 'robotique', name: 'Robotique', category: 'technologie-industrielle', icon: '🤖' },
  { id: 'soudage', name: 'Soudage', category: 'technologie-industrielle', icon: '🔥' },
  { id: 'mecanique-automobile', name: 'Mécanique automobile', category: 'technologie-industrielle', icon: '🚗' },
  { id: 'aeronautique', name: 'Aéronautique', category: 'technologie-industrielle', icon: '✈️' },
  { id: 'numerique-technologie', name: 'Numérique et technologie', category: 'technologie-industrielle', icon: '💻' },

  { id: 'couture', name: 'Couture', category: 'arts-mode-esthetique', icon: '🧵' },
  { id: 'coiffure', name: 'Coiffure', category: 'arts-mode-esthetique', icon: '✂️' },
  { id: 'bijouterie', name: 'Bijouterie', category: 'arts-mode-esthetique', icon: '💎' },

  { id: 'maconnerie', name: 'Maçonnerie', category: 'batiment', icon: '🧱' },
  { id: 'menuiserie-bois', name: 'Menuiserie bois', category: 'batiment', icon: '🪚' },
  { id: 'carrelage', name: 'Carrelage', category: 'batiment', icon: '🟫' },
  { id: 'peinture', name: 'Peinture', category: 'batiment', icon: '🎨' },
  { id: 'installation-sanitaire', name: 'Installation sanitaire', category: 'batiment', icon: '🚿' },
  { id: 'electricite', name: 'Électricité', category: 'batiment', icon: '⚡' },
  { id: 'froid-climatisation', name: 'Froid-climatisation', category: 'batiment', icon: '❄️' },
  { id: 'domotique', name: 'Domotique', category: 'batiment', icon: '🏠' },
]

export const WORLD_SKILLS_STATS = {
  disciplines: 25,
  competitors: 1500,
  finalistsAndExhibitors: 300,
  editionNumber: 6,
  editionYear: 2026,
  foundingYear: 2021,
} as const
