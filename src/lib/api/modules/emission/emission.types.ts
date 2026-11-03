/**
 * Enveloppes JSON renvoyées par l’API Missplayce (liste paginée vs ressource unique).
 */
export interface ApiPaginationDto {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_items: number;
}

export interface EmissionListEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionListItemDto[];
  pagination: ApiPaginationDto;
}

export interface EmissionDetailEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionDetailDto;
}

export interface EditionListEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionEditionListItemDto[];
  pagination: ApiPaginationDto;
}

export interface ActiveEditionEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionActiveEditionDto | null;
}

export interface PeopleGroupEthnieDto {
  id: string;
  peopleGroupId: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
}

export interface PeopleGroupDto {
  id: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
  ethnies: PeopleGroupEthnieDto[];
}

export interface PeopleGroupsEnvelopeDto {
  success: boolean;
  message: string;
  data: PeopleGroupDto[];
  pagination: ApiPaginationDto;
}

export interface EmissionCategoryTagDto {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface EmissionCategoryDto {
  id: string;
  name: string;
  code: string;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
  tags: EmissionCategoryTagDto[];
}

export interface EmissionCategoriesEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionCategoryDto[];
  pagination: ApiPaginationDto;
}

export interface EmissionTagsEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionCategoryTagDto[];
  pagination: ApiPaginationDto;
}

export interface VideoDto {
  id: string;
  title: string;
  url: string;
  sourceType: string;
  categoryId: string | null;
  premiumRequired: boolean;
  status: string;
  duration: number;
  description: string | null;
  tags: string[];
  views: number;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EditionLotDto {
  title: string;
  imageUrl: string;
  description: string;
}

export interface EditionSponsorDto {
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
}

export interface EmissionSocialLinkDto {
  platform: string;
  url: string;
  logoUrl?: string | null;
}

export interface EditionPreviewCandidateDto {
  pseudo: string;
  candidateName: string;
  candidatePreName: string;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  candidatePicture?: string;
  previewImageUrl?: string;
}

export interface EditionQuizSummaryDto {
  id: string;
  editionId: string;
  title: string;
  description: string;
  active: boolean;
  difficulty: string;
  totalQuestions: number;
}

export interface QuizAnswerDto {
  id: string;
  label: string;
  order: number;
}

export interface QuizQuestionDto {
  id: string;
  quizId: string;
  title: string;
  question: string;
  type: string;
  contentType: string;
  contentUrl: string | null;
  points: number;
  order: number;
  answers: QuizAnswerDto[];
}

export interface EditionQuizPlayableDto extends EditionQuizSummaryDto {
  hasUnusedPaidAttempt: boolean;
  questions: QuizQuestionDto[];
}

/** Édition imbriquée dans GET /emission (liste). */
export interface EmissionNestedEditionDto {
  id: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  maxCandidates?: number | null;
  quizPrice?: number | null;
  /** Montant FCFA d’un vote (édition). */
  voteAmountPerVote?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  status: string;
  isPublic?: boolean;
  currentStage: string;
  startDate: string;
  endDate: string;
  stageStartDate?: string | null;
  stageEndDate?: string | null;
  createdAt: string;
  lots?: EditionLotDto[] | null;
  gameRules?: string | null;
  principles?: string | null;
  sponsors?: EditionSponsorDto[] | null;
  video?: VideoDto | null;
  previewCandidateImageUrls?: string[];
  previewCandidates?: EditionPreviewCandidateDto[];
  candidatesCount?: number;
  hasApplied?: boolean;
  applicationStatus?: "EN_ATTENTE" | "VALIDE" | "REFUSEE" | null;
  isAccepted?: boolean;
  /** UUID candidature de l’utilisateur connecté (JWT), sinon null. */
  myCandidateId?: string | null;
}

export interface EmissionListItemDto {
  id: string;
  title: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  socialLinks?: EmissionSocialLinkDto[] | null;
  status?: string;
  description: string;
  pointsPerVote: number;
  isActive: boolean;
  isPublic: boolean;
  adminApprovedAt?: string | null;
  awaitingAdminApproval?: boolean;
  canPublishEditions?: boolean;
  isCatalogVisible?: boolean;
  allowedCountries?: string[];
  createdAt: string;
  updatedAt: string;
  video: VideoDto | null;
  editions: EmissionNestedEditionDto[];
}

/** Détail émission : videoId à la racine ; pas d’objet video complet dans l’exemple. */
export interface EmissionDetailDto {
  id: string;
  title: string;
  description: string;
  videoId: string | null;
  pointsPerVote: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  activeEdition: EmissionActiveEditionDto | null;
}

/** Édition « active » (détail émission ou endpoint active-edition). */
export interface EmissionActiveEditionDto {
  id: string;
  title: string;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  status: string;
  currentStage?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  lots: EditionLotDto[];
  gameRules: string;
  principles: string;
  sponsors: EditionSponsorDto[];
  video: VideoDto | null;
}

/** Item de GET /emission/:id/editions (champs candidature + pagination). */
export interface EmissionEditionListItemDto {
  id: string;
  emissionId: string;
  emissionName: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  description: string | null;
  lots: EditionLotDto[] | null;
  gameRules: string | null;
  principles: string | null;
  sponsors: EditionSponsorDto[] | null;
  status: string;
  currentStage: string;
  finalistsCount: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  video?: VideoDto | null;
  hasApplied: boolean;
  applicationStatus?: "EN_ATTENTE" | "VALIDE" | "REFUSEE" | null;
  isAccepted: boolean;
}

export interface ListEmissionsQuery {
  isActive?: boolean;
  /** Statut métier de l'émission (ex. APPROUVEE, EN_ATTENTE). */
  status?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

export interface ListEmissionEditionsQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListPeopleGroupsQuery {
  page?: number;
  limit?: number;
}

export interface ListEmissionCategoriesQuery {
  /** Obligatoire — seules les catégories autorisées pour cette édition sont renvoyées. */
  editionId: string;
  page?: number;
  limit?: number;
}

export interface ListEmissionTagsQuery {
  categoryId?: string;
  page?: number;
  limit?: number;
}

/** POST /emission/editions/:editionId/apply */
export interface ApplyToEditionBodyDto {
  pseudo: string
  candidateName: string
  candidatePreName: string
  /** API field name (ISO date, ex: 2002-05-18). */
  age: string
  candidatePicture: string
  description: string
  videoId: string
  countryId: string
  residenceCountryId: string
  categoryId: string
  tagId: string
  /** Documents justificatifs (CNI, autorisation, etc.) quand l'édition les exige. */
  documentUrls?: string[]
  /** Paiement — uniquement si édition payante (candidaturePrice > 0). */
  provider?: 'ORANGE' | 'MOOV' | 'MTN' | 'WAVE'
  phoneNumber?: string
  otp?: string
  invitationCode?: string
}

export interface ApplyPaymentDto {
  id: string
  transactionType?: string
  provider?: string
  amount?: number
  status?: string
  reference?: string | null
  phoneNumber?: string | null
  paymentUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ApplyToEditionResponseDto {
  id: string
  editionId: string
  video?: VideoDto | null
  candidatePicture: string
  description: string
  candidateName?: string
  candidatePreName?: string
  countryId?: string
  countryName?: string
  residenceCountryId?: string
  residenceCountry?: string
  status: string
  isFinalist?: boolean
  totalVotes?: number
  finalistVotes?: number
  createdAt: string
  updatedAt: string
}

export interface ApplyToEditionEnvelopeDto {
  success: boolean
  message: string
  data: ApplyToEditionResponseDto
  payment?: ApplyPaymentDto | null
  paymentRequired?: boolean
  paymentConfirmed?: boolean
  nextAction?: string | null
}

/** POST /emission/editions/:editionId/apply-expert */
export interface ApplyAsExpertBodyDto {
  categoryId?: string
  tagId?: string
  invitationCode?: string
}

export type EditionStaffRole = 'EXPERT' | 'JURY' | string
export type EditionStaffStatus =
  | 'EN_ATTENTE'
  | 'ACCEPTE'
  | 'REFUSE'
  | string

export interface EditionStaffDto {
  id: string
  editionId: string
  userId: string
  staffRole: EditionStaffRole
  categoryId?: string | null
  tagId?: string | null
  category?: unknown
  tag?: unknown
  status: EditionStaffStatus
  rejectionReason?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
  user?: unknown
}

export interface ApplyAsExpertEnvelopeDto {
  success: boolean
  message: string
  data: EditionStaffDto
}

export interface EditionCandidateUserDto {
  id?: string;
  userId?: string;
  lastName: string;
  firstName: string;
  pseudo: string;
  /** Âge en années si fourni par l’API. */
  age?: number | null;
  /** ISO date — utilisé pour calculer l’âge si `age` est absent. */
  dateOfBirth?: string | null;
  socialLinks?: EmissionSocialLinkDto[] | null;
}

/** Fiche métier individuelle (dans un groupe catégorie). */
export interface EditionJobSheetSummaryDto {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
  };
  imageUrl?: string | null;
  candidatesCount?: number;
}

/**
 * Groupe catalogue métiers (GET /emission/editions/:id → jobSheets).
 * Structure actuelle : domaines avec fiches imbriquées.
 */
export interface EditionJobSheetCategoryGroupDto {
  category: {
    id: string;
    name: string;
  };
  candidatesCount?: number;
  jobSheets: EditionJobSheetSummaryDto[];
}

/** Catégorie + tags autorisés sur une édition (GET /editions/:id). */
export interface EditionCandidateCategoryDto {
  category: Omit<EmissionCategoryDto, 'tags'>
  tags: EmissionCategoryTagDto[]
}

/** Candidature rattachée à une édition (GET /emission/editions/:id). */
export interface EditionCandidateDto {
  id: string;
  editionId: string;
  userId?: string;
  video?: VideoDto | null;
  candidatePicture: string;
  description: string;
  candidateName?: string;
  candidatePreName?: string;
  documentUrls?: string[] | null;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  schoolName?: string | null;
  schoolCity?: string | null;
  /** Fiche métier soumise (peut exister même si tag référentiel est absent). */
  jobSheet?:
    | {
        id?: string;
        title?: string;
        category?: { id: string; name: string } | null;
      }
    | string
    | null;
  specializationJobTag?: { id?: string; name?: string } | string | null;
  secondaryJobSheetIds?: string[] | null;
  age?: number | null;
  status: string;
  isFinalist: boolean;
  totalVotes: number;
  finalistVotes: number;
  quizPoints?: number;
  totalPoints?: number;
  createdAt: string;
  updatedAt: string;
  user: EditionCandidateUserDto;
  /** Référentiel candidature (si inclus par l’API). */
  category?: (Omit<EmissionCategoryDto, 'tags'> & { tags?: EmissionCategoryTagDto[] }) | null;
  tag?: EmissionCategoryTagDto | null;
}

/** GET /emission/candidates/:id — candidat + édition imbriquée. */
export interface EmissionCandidateDetailDto {
  id: string;
  editionId: string;
  userId?: string;
  video?: VideoDto | null;
  videoId?: string | null;
  candidatePicture: string;
  description: string;
  candidateName?: string;
  candidatePreName?: string;
  documentUrls?: string[] | null;
  identityDocumentUrl?: string | null;
  cvUrl?: string | null;
  diplomaUrl?: string | null;
  /** Récompenses attribuées au candidat (si fournies par l’API). */
  lots?: EditionLotDto[] | null;
  rewards?: EditionLotDto[] | null;
  countryId?: string;
  countryName?: string;
  residenceCountryId?: string;
  residenceCountry?: string;
  schoolName?: string | null;
  schoolCity?: string | null;
  jobSheet?: { id?: string; title?: string } | string | null;
  specializationJobTag?: { id?: string; name?: string } | string | null;
  age?: number | null;
  status: string;
  isFinalist: boolean;
  totalVotes: number;
  finalistVotes?: number;
  quizPoints?: number;
  totalPoints?: number;
  createdAt: string;
  updatedAt: string;
  user: EditionCandidateUserDto;
  edition: EditionRankingEditionMetaDto;
  /** Référentiel candidature (si inclus par l’API). */
  category?: (Omit<EmissionCategoryDto, 'tags'> & { tags?: EmissionCategoryTagDto[] }) | null;
  tag?: EmissionCategoryTagDto | null;
}

export interface EmissionCandidateDetailEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionCandidateDetailDto;
}

/** Détail complet d’une édition (candidates + finalists + méta). */
export interface EditionFullDetailDto {
  id: string;
  emissionId: string;
  emissionName: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  maxCandidates?: number | null;
  quizPrice?: number | null;
  voteAmountPerVote?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  isPaidEdition?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  description: string;
  lots: EditionLotDto[];
  gameRules: string;
  principles: string;
  sponsors: EditionSponsorDto[];
  video?: VideoDto | null;
  status: string;
  isPublic?: boolean;
  currentStage: string;
  finalistsCount?: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  stageStartDate?: string | null;
  stageEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
  hasApplied?: boolean;
  applicationStatus?: "EN_ATTENTE" | "VALIDE" | "REFUSEE" | null;
  isAccepted: boolean;
  myCandidateId?: string | null;
  myStaffId?: string | null;
  /** Total candidatures VALIDE de l’édition (catalogue). */
  candidatesCount?: number;
  candidateCategories?: EditionCandidateCategoryDto[];
  /** Domaines + fiches métiers (structure groupée). */
  jobSheets?: EditionJobSheetCategoryGroupDto[];
  candidates: EditionCandidateDto[];
  finalists: EditionCandidateDto[];
}

export interface EditionFullDetailEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionFullDetailDto;
}

/** Métadonnées d’édition renvoyées avec le classement / détail candidat. */
export interface EditionRankingEditionMetaDto {
  id: string;
  title: string;
  imageUrl?: string | null;
  candidaturePrice?: number | null;
  maxCandidates?: number | null;
  quizPrice?: number | null;
  voteAmountPerVote?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  isPaidEdition?: boolean;
  isPublic?: boolean;
  status: string;
  currentStage: string;
  startDate: string;
  endDate: string;
  stageStartDate?: string | null;
  stageEndDate?: string | null;
  createdAt: string;
  lots: EditionLotDto[];
  gameRules: string;
  principles: string;
  sponsors: EditionSponsorDto[];
  video?: VideoDto | null;
  hasApplied?: boolean;
  applicationStatus?: "EN_ATTENTE" | "VALIDE" | "REFUSEE" | null;
  isAccepted?: boolean;
  myCandidateId?: string | null;
}

/** Entrée de classement : même schéma candidat + rang officiel. */
export interface EditionRankingCandidateDto extends EditionCandidateDto {
  rank: number;
}

export interface EditionQuizzesEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionQuizPlayableDto[];
}

export interface EditionFreeDailyQuizEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionQuizPlayableDto;
}

export interface EditionQuizPaidAttemptEnvelopeDto {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface EditionQuizSubmitAnswerDto {
  questionId: string;
  answerId?: string;
  answerIds?: string[];
  textAnswer?: string;
}

export interface EditionQuizSubmitBodyDto {
  candidateId: string;
  answers: EditionQuizSubmitAnswerDto[];
}

export interface EditionQuizSubmitEnvelopeDto {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface EditionRankingEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionRankingCandidateDto[];
  pagination: ApiPaginationDto;
  edition: EditionRankingEditionMetaDto;
}

export interface ListEditionRankingQuery {
  page?: number;
  limit?: number;
}

/** Étape de filtrage des candidats (défaut API = currentStage de l'édition). */
export type EditionCandidatesStage =
  | 'INSCRIPTION'
  | 'PRESELECTION'
  | 'FINALISTS';

export interface ListEditionCandidatesQuery {
  page?: number;
  limit?: number;
  status?: string;
  /** Filtre optionnel par fiche métier (UUID) */
  jobSheetId?: string;
  /** Étape : INSCRIPTION | PRESELECTION | FINALISTS */
  stage?: EditionCandidatesStage;
}

export interface EditionCandidateJobSheetRef {
  id: string;
  title: string;
  category?: { id: string; name: string } | null;
}

export interface EditionCandidateActivitySectorRef {
  id: string;
  name: string;
}

/** Classement / regroupement par fiche métier. */
export interface EditionCandidatesByJobSheetDto {
  jobSheet: EditionCandidateJobSheetRef;
  activitySector?: EditionCandidateActivitySectorRef | null;
  candidates: EditionCandidateDto[];
  rank?: number;
  totalVotes?: number;
}

/** Classement / regroupement par secteur d'activité. */
export interface EditionCandidatesByActivitySectorDto {
  activitySector: EditionCandidateActivitySectorRef;
  candidates: EditionCandidateDto[];
  totalVotes?: number;
  rank?: number;
}

/** EditionStaff EXPERT validé, renvoyé dans data.experts. */
export interface EditionExpertDto {
  id: string;
  editionId: string;
  userId?: string | null;
  staffRole?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  nationality?: string | null;
  residence?: string | null;
  photoUrl?: string | null;
  professionJobSheetId?: string | null;
  activitySectorId?: string | null;
  levelId?: string | null;
  yearsOfExperience?: number | null;
  expertiseTagIds?: string[] | null;
  interventionJobSheetIds?: string[] | null;
  desiredRoles?: string[] | null;
  otherRoleDetail?: string | null;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  motivation?: string | null;
  category?: { id: string; name: string } | null;
  tag?: { id: string; name: string } | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id?: string;
    studentProfile?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
}

export interface EditionCandidatesDataDto {
  requireDocuments?: boolean;
  myCandidateId?: string | null;
  myStaffId?: string | null;
  hasApplied?: boolean;
  applicationStatus?: string | null;
  isAccepted?: boolean;
  candidates: EditionCandidateDto[];
  /** EditionStaff EXPERT validés */
  experts?: EditionExpertDto[];
  /** Fourni si pas de filtre jobSheetId */
  activitySectorRanking?: EditionCandidatesByActivitySectorDto[];
  jobSheetRanking?: EditionCandidatesByJobSheetDto[];
  candidatesByJobSheet?: EditionCandidatesByJobSheetDto[];
}

export interface EditionCandidatesEnvelopeDto {
  success: boolean;
  message: string;
  data: EditionCandidatesDataDto;
  pagination: ApiPaginationDto;
}

/** POST …/candidates/:id/vote/initiate */
export type VotePaymentProvider = "MTN" | "MOOV" | "WAVE" | "ORANGE";

export interface VoteInitiateBodyDto {
  voteCount: number;
  provider: VotePaymentProvider;
  amountPerVote: number;
  phoneNumber: string;
}

export interface VoteInitiateTransactionDto {
  id: string;
  transactionType: string;
  provider: string;
  amount: number;
  status: string;
  reference: string;
  phoneNumber: string;
  paymentUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VoteInitiateEnvelopeDto {
  success: boolean;
  message: string;
  data: VoteInitiateTransactionDto;
}

/** POST …/candidates/:id/vote */
export interface VoteConfirmBodyDto {
  transactionId: string;
  voteCount: number;
}

export interface VoteRecordDto {
  id: string;
  editionId: string;
  candidateId: string;
  userId: string;
  transactionId: string;
  createdAt: string;
}

export interface VoteConfirmEnvelopeDto {
  success: boolean;
  message: string;
  data: VoteRecordDto[];
}

/** Profil user renvoyé par GET /emission/users/:userId/participation. */
export interface EmissionParticipationUserDto {
  id: string;
  email?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
  emailVerified?: boolean;
  premiumActive?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  interests?: string[] | null;
  academicLevel?: string | null;
  videoPresentationUrl?: string | null;
  socialLinks?: EmissionSocialLinkDto[] | null;
}

/** Édition active de participation (peut être null). */
export interface EmissionParticipationEditionDto {
  id: string;
  emissionId?: string;
  emissionName?: string | null;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  lots?: EditionLotDto[] | null;
  gameRules?: string | null;
  principles?: string | null;
  sponsors?: EditionSponsorDto[] | null;
  status?: string;
  isPublic?: boolean;
  currentStage?: string | null;
  maxCandidates?: number | null;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  stageStartDate?: string | null;
  stageEndDate?: string | null;
  candidaturePrice?: number | null;
  quizPrice?: number | null;
  voteAmountPerVote?: number | null;
  quizEnabled?: boolean;
  dailyFreeQuizAttempts?: number;
  requireDocuments?: boolean;
  hasQuizzes?: boolean;
  quizzes?: EditionQuizSummaryDto[] | null;
  isPaidEdition?: boolean;
  video?: VideoDto | null;
  createdAt?: string;
  updatedAt?: string;
  /** Uniquement la fiche métier choisie par ce user. */
  jobSheets?: EditionJobSheetSummaryDto[] | null;
  /** @deprecated Prefer jobSheets — conservé pour compat. */
  candidateCategories?: EditionCandidateCategoryDto[] | null;
}

/** Dossier candidature complet (GET /emission/users/:userId/participation → candidate). */
export interface EmissionParticipationCandidateDto {
  id: string;
  editionId: string;
  userId?: string;
  video?: VideoDto | null;
  candidatePicture?: string | null;
  description?: string | null;
  candidateName?: string | null;
  candidatePreName?: string | null;
  documentUrls?: string[] | null;
  countryId?: string | null;
  countryName?: string | null;
  residenceCountryId?: string | null;
  residenceCountry?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  nationalityCountryId?: string | null;
  identityNumber?: string | null;
  residence?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  institutionType?: { id: string; name: string } | null;
  school?: { id: string; name: string; city?: string | null } | null;
  schoolName?: string | null;
  schoolCity?: string | null;
  level?: { id: string; label: string } | null;
  classe?: string | null;
  jobSheet?: {
    id: string;
    title: string;
    category?: { id: string; name: string } | null;
    imageUrl?: string | null;
  } | null;
  specializationJobTag?: { id: string; name: string } | null;
  secondaryJobSheetIds?: string[] | null;
  secondaryJobSheets?: Array<{
    id: string;
    title: string;
    category?: { id: string; name: string } | null;
    imageUrl?: string | null;
  }> | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  experiences?: string | null;
  complementarySkills?: string | null;
  motivation?: string | null;
  identityDocumentUrl?: string | null;
  cvUrl?: string | null;
  diplomaUrl?: string | null;
  /** Récompenses attribuées au candidat (si fournies par l’API). */
  lots?: EditionLotDto[] | null;
  rewards?: EditionLotDto[] | null;
  age?: number | null;
  status?: string | null;
  isFinalist?: boolean;
  totalVotes?: number;
  finalistVotes?: number;
  quizPoints?: number;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
  user?: EditionCandidateUserDto | null;
  category?: (Omit<EmissionCategoryDto, 'tags'> & { tags?: EmissionCategoryTagDto[] }) | null;
  tag?: EmissionCategoryTagDto | null;
  rejectionReason?: string | null;
}

export interface EmissionUserParticipationDataDto {
  user: EmissionParticipationUserDto;
  edition: EmissionParticipationEditionDto | null;
  candidate?: EmissionParticipationCandidateDto | null;
}

export interface EmissionUserParticipationEnvelopeDto {
  success: boolean;
  message: string;
  data: EmissionUserParticipationDataDto;
}
