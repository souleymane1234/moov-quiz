export type CandidateProfile = {
  title: string
  fullName: string
  email: string
  phone: string
  city: string
  country: string
  gender: string
  preferredLanguage: string
  address: string
  birthDate: string
  school: string
  bio: string
  realizations: string[]
}

type CandidateAccount = {
  email: string
  password: string
  createdAt: string
  profile: CandidateProfile
}

const ACCOUNT_KEY = 'wsci-candidate-account'
const SESSION_KEY = 'wsci-candidate-session'
const AUTH_EVENT = 'wsci-auth-changed'

function readAccount(): CandidateAccount | null {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CandidateAccount
  } catch {
    return null
  }
}

function writeAccount(account: CandidateAccount): void {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
}

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function getAuthEventName(): string {
  return AUTH_EVENT
}

export function isCandidateLoggedIn(): boolean {
  return (
    window.localStorage.getItem(SESSION_KEY) === '1' ||
    Boolean(window.localStorage.getItem('wsci-access-token'))
  )
}

export function getCandidateAccount(): CandidateAccount | null {
  return readAccount()
}

export function registerCandidate(input: {
  fullName: string
  email: string
  password: string
}): { ok: true } | { ok: false; message: string } {
  const existing = readAccount()
  const email = input.email.trim().toLowerCase()
  if (!email) return { ok: false, message: 'Email invalide.' }
  if (existing?.email.toLowerCase() === email) {
    return { ok: false, message: 'Un compte existe déjà avec cet email.' }
  }

  const account: CandidateAccount = {
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
    profile: {
      title: '',
      fullName: input.fullName.trim(),
      email,
      phone: '',
      city: '',
      country: "Cote d'Ivoire",
      gender: '',
      preferredLanguage: 'Francais',
      address: '',
      birthDate: '',
      school: '',
      bio: '',
      realizations: [],
    },
  }
  writeAccount(account)
  window.localStorage.setItem(SESSION_KEY, '1')
  notifyAuthChanged()
  return { ok: true }
}

export function loginCandidate(email: string, password: string): boolean {
  const account = readAccount()
  if (!account) return false
  const ok =
    account.email.toLowerCase() === email.trim().toLowerCase() &&
    account.password === password
  if (!ok) return false
  window.localStorage.setItem(SESSION_KEY, '1')
  notifyAuthChanged()
  return true
}

export function logoutCandidate(): void {
  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem('wsci-access-token')
  window.localStorage.removeItem('wsci-refresh-token')
  window.localStorage.removeItem('wsci-auth-user')
  // Aligné avec clearAuthSession (JWT)
  notifyAuthChanged()
}

export function updateCandidateProfile(next: CandidateProfile): boolean {
  const account = readAccount()
  if (!account) return false
  writeAccount({ ...account, profile: next })
  notifyAuthChanged()
  return true
}
