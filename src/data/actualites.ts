export type ActualiteItem = {
  id: number
  title: string
  slug: string
  image: string
  source: string
  publishedAt: string
  link: string
  category: string
  description: string
  content: string
}

export const ACTUALITES: ActualiteItem[] = [
  {
    id: 1,
    title: 'Olympiades des métiers 5e édition',
    slug: 'olympiades-des-metiers-5e-edition',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT7gNGjEq0bD-MCwHmyhNPMNnynD-89SU9c2I3ho9eu_uJr3KaKmsQUCai&s=10',
    source: "WorldSkills Côte d'Ivoire",
    publishedAt: '2025-11-12',
    link: '',
    category: "WorldSkills Côte d'Ivoire",
    description: "Lancement de la 5e édition des Olympiades des Métiers Côte d'Ivoire 2025.",
    content:
      'Le Ministère de l’Enseignement Technique, de la Formation Professionnelle et de l’Apprentissage organise l’édition 2025 des Olympiades des Métiers.',
  },
  {
    id: 2,
    title: "Candidat MGH WorldSkills Côte d'Ivoire 2025",
    slug: 'candidat-mgh-worldskills-2025',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5gLpuPkhH088f-iXdKZRLNti_EC9YvJ0LzDaswrwgnfvLp17j0cqTDK8C&s=10',
    source: 'LMGH',
    publishedAt: '2025-11-26',
    link: '',
    category: 'Portrait',
    description: "Présentation des candidats du Lycée Moderne d'Hôtellerie.",
    content:
      'Le Lycée Moderne d’Hôtellerie de Grand-Bassam présente ses candidats engagés dans les Olympiades des Métiers 2025.',
  },
  {
    id: 3,
    title: '68 équipes qualifiées pour les phases finales',
    slug: '68-equipes-qualifiees-phases-finales',
    image: 'https://www.fratmat.info/uploads/images/2024/11/09/217944.jpg',
    source: 'Fraternité Matin',
    publishedAt: '2024-11-09',
    link: 'https://www.fratmat.info/uploads/images/2024/11/09/217944.jpg',
    category: 'Qualification',
    description: '68 équipes accèdent aux phases finales des Olympiades.',
    content:
      'Les présélections régionales ont permis de retenir 68 équipes pour les phases finales.',
  },
  {
    id: 4,
    title: 'Olympiades arts et métiers Man',
    slug: 'olympiades-arts-et-metiers-man',
    image:
      'https://man-info.net/wp-content/uploads/2025/03/IMG-20250320-WA0157-1536x1152.jpg',
    source: 'Man Info',
    publishedAt: '2025-03-14',
    link: 'https://man-info.net/wp-content/uploads/2025/03/IMG-20250320-WA0157-1536x1152.jpg',
    category: 'Arts et Métiers',
    description: 'Compétition organisée au Lycée Technique de Man.',
    content:
      'Les épreuves ont réuni plusieurs établissements techniques et professionnels autour de différentes disciplines.',
  },
  {
    id: 5,
    title: 'Les Olympiades des métiers valorisent les talents des jeunes',
    slug: 'olympiades-des-metiers-valorisent-les-talents-des-jeunes',
    image: 'https://ivoire.ci/uploads/images/202511/image_870x_6929f98dd7d4f.jpg',
    source: 'Ivoire.ci',
    publishedAt: '2025-11-08',
    link: 'https://ivoire.ci/uploads/images/202511/image_870x_6929f98dd7d4f.jpg',
    category: 'Actualité',
    description: 'Les Olympiades révèlent les talents et savoir-faire des jeunes.',
    content:
      'Les Olympiades des métiers ont pour objectif de révéler les talents et de valoriser les compétences professionnelles.',
  },
  {
    id: 6,
    title: "WorldSkills Côte d'Ivoire 2024 : la DVS mobilise les entreprises",
    slug: 'worldskills-cote-divoire-2024-la-dvs-mobilise-les-entreprises',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRupc_56oSqVkCGIoVdgOR0fXjfFBBLffIZGA4Ifusep4tFJV0nbubqRzI&s=10',
    source: 'JD Éditions Magazine',
    publishedAt: '2024-10-24',
    link:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRupc_56oSqVkCGIoVdgOR0fXjfFBBLffIZGA4Ifusep4tFJV0nbubqRzI&s=10',
    category: 'Partenariat',
    description: 'Mobilisation des entreprises pour accompagner les compétiteurs.',
    content:
      'La Direction de la Vie Scolaire et plusieurs partenaires privés se sont engagés pour soutenir les Olympiades des Métiers Côte d’Ivoire 2024.',
  },
]
