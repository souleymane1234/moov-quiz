import type { StudentProfileResponseDto } from './api/modules/profile'
import { getAuthUser } from './auth-session'

type CountryOption = { id: string; name: string }
type LevelOption = { id: string; label: string }

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match?.[1] ?? ''
}

export function mapGenderForCandidature(value: string | null | undefined): string {
  if (!value) return ''
  const v = value.trim().toUpperCase()
  if (v === 'M' || v === 'HOMME' || v === 'MASCULIN') return 'M'
  if (v === 'F' || v === 'FEMME' || v === 'FEMININ' || v === 'FÉMININ') return 'F'
  return value
}

function findCountryIdByName(
  countries: CountryOption[],
  countryName: string | null | undefined,
): string {
  if (!countryName?.trim() || countries.length === 0) return ''
  const normalized = countryName.trim().toLowerCase()
  const match = countries.find((c) => c.name.trim().toLowerCase() === normalized)
  return match?.id ?? ''
}

function resolveNationalityOption(
  countries: CountryOption[],
  nationality: string | null | undefined,
): string {
  if (!nationality?.trim()) return ''
  const n = nationality.trim().toLowerCase()
  const exact = countries.find((c) => c.name.trim().toLowerCase() === n)
  if (exact) return exact.name
  if (n.includes('ivoiri')) {
    const ci = countries.find(
      (c) =>
        c.name.toLowerCase().includes('ivoire') ||
        c.name.toLowerCase().includes('côte'),
    )
    if (ci) return ci.name
  }
  return nationality.trim()
}

function findLevelIdByLabel(
  levels: LevelOption[],
  academicLevel: string | null | undefined,
): string {
  if (!academicLevel?.trim() || levels.length === 0) return ''
  const normalized = academicLevel.trim().toLowerCase()
  const match = levels.find((l) => l.label.trim().toLowerCase() === normalized)
  return match?.id ?? ''
}

function suggestPseudo(firstName: string, lastName: string, email: string): string {
  const fromName = `${firstName}${lastName}`.replace(/\s+/g, '').replace(/[^\w]/gi, '')
  if (fromName.length >= 3) return fromName.slice(0, 24)
  const fromEmail = email.split('@')[0]?.replace(/[^\w]/gi, '') ?? ''
  return fromEmail.slice(0, 24)
}

function readProfileFields(profile: StudentProfileResponseDto | null | undefined) {
  const user = getAuthUser()
  return {
    email: user?.email ?? '',
    firstName: profile?.firstName ?? user?.firstName ?? '',
    lastName: profile?.lastName ?? user?.lastName ?? '',
    phoneNumber: profile?.phoneNumber ?? user?.phoneNumber ?? '',
    city: profile?.city ?? user?.city ?? '',
    countryName: profile?.country ?? user?.country ?? '',
    nationality: profile?.nationality ?? user?.nationality ?? '',
    address: profile?.address ?? user?.address ?? '',
    dateOfBirth: profile?.dateOfBirth ?? user?.dateOfBirth ?? '',
    gender: profile?.gender ?? user?.gender ?? '',
    academicLevel: profile?.academicLevel ?? user?.academicLevel ?? '',
    bio: profile?.bio ?? user?.bio ?? '',
    interests: profile?.interests ?? [],
  }
}

export type CompetitorProfileSeed = {
  pseudo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  residence: string
  contactEmail: string
  contactPhone: string
  countryId: string
  schoolCity: string
  levelId: string
  motivation: string
  complementarySkills: string
}

export type ExpertProfileSeed = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  residence: string
  contactEmail: string
  contactPhone: string
  levelId: string
  motivation: string
}

export function buildCompetitorSeedFromProfile(
  profile: StudentProfileResponseDto | null | undefined,
  options?: { countries?: CountryOption[]; levels?: LevelOption[] },
): CompetitorProfileSeed {
  const fields = readProfileFields(profile)
  const countries = options?.countries ?? []
  const levels = options?.levels ?? []
  const nationality = resolveNationalityOption(countries, fields.nationality)

  return {
    pseudo: suggestPseudo(fields.firstName, fields.lastName, fields.email),
    firstName: fields.firstName,
    lastName: fields.lastName,
    dateOfBirth: toDateInputValue(fields.dateOfBirth),
    gender: mapGenderForCandidature(fields.gender),
    nationality,
    residence: fields.address || fields.city,
    contactEmail: fields.email,
    contactPhone: fields.phoneNumber,
    countryId: findCountryIdByName(countries, fields.countryName),
    schoolCity: fields.city,
    levelId: findLevelIdByLabel(levels, fields.academicLevel),
    motivation: fields.bio,
    complementarySkills: fields.interests.join(', '),
  }
}

export function buildExpertSeedFromProfile(
  profile: StudentProfileResponseDto | null | undefined,
  options?: { countries?: CountryOption[]; levels?: LevelOption[] },
): ExpertProfileSeed {
  const fields = readProfileFields(profile)
  const countries = options?.countries ?? []
  const levels = options?.levels ?? []

  return {
    firstName: fields.firstName,
    lastName: fields.lastName,
    dateOfBirth: toDateInputValue(fields.dateOfBirth),
    gender: mapGenderForCandidature(fields.gender),
    nationality: resolveNationalityOption(countries, fields.nationality),
    residence: fields.address || fields.city,
    contactEmail: fields.email,
    contactPhone: fields.phoneNumber,
    levelId: findLevelIdByLabel(levels, fields.academicLevel),
    motivation: fields.bio,
  }
}

/** Remplit uniquement les champs texte encore vides. */
export function applyProfileSeed<T extends Record<string, unknown>>(
  current: T,
  seed: Partial<T>,
): T {
  const next = { ...current }
  for (const key of Object.keys(seed) as Array<keyof T>) {
    const value = seed[key]
    if (value === undefined || value === null || value === '') continue
    const cur = next[key]
    if (typeof cur === 'string' && cur === '') {
      next[key] = value
    }
  }
  return next
}
