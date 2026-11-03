import { ApiHttpError } from '../lib/api'
import type { AuthEnvelopeDto, AuthUserDto } from '../lib/api/modules/auth'
import {
  clearAuthSession,
  getAccessToken,
  getAuthEventName,
  getAuthUser,
  getRefreshToken,
  setAuthSession,
  type AuthUser,
} from '../lib/auth-session'
import { authApi } from '../services/api-client'

export interface MoovQuizAuth {
  loginWithEmail(input: { email: string; password: string }): Promise<AuthUser>
  registerWithEmail(input: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }): Promise<AuthUser>
  logout(): Promise<void>
  getUser(): AuthUser | null
  hasSession(): boolean
  eventName: string
  errorMessage(error: unknown, fallback: string): string
}

declare global {
  interface Window {
    mqAuth?: MoovQuizAuth
  }
}

function toAuthUser(dto: AuthUserDto | null | undefined, email: string): AuthUser {
  return {
    id: dto?.id,
    email: dto?.email ?? email,
    firstName: dto?.firstName ?? undefined,
    lastName: dto?.lastName ?? undefined,
    phoneNumber: dto?.phoneNumber ?? undefined,
    profileImage: dto?.profileImage ?? undefined,
    studentProfileId: dto?.studentProfileId ?? undefined,
    city: dto?.city ?? undefined,
    country: dto?.country ?? undefined,
  }
}

function openSession(res: AuthEnvelopeDto, email: string): AuthUser {
  if (!res.data?.accessToken) throw new Error(res.message || 'Authentification impossible.')
  const user = toAuthUser(res.data.user, email)
  setAuthSession({
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
    user,
  })
  return user
}

function errorMessage(error: unknown, fallback: string): string {
  if (!ApiHttpError.isInstance(error)) return fallback
  if (error.status === 0) return 'Connexion au serveur impossible. Vérifie ta connexion internet.'
  if (error.status === 401) return 'Email ou mot de passe incorrect.'
  if (error.status === 429) return 'Trop de tentatives. Réessaie dans quelques minutes.'
  return error.message || fallback
}

export const moovQuizAuth: MoovQuizAuth = {
  async loginWithEmail({ email, password }) {
    const normalized = email.trim().toLowerCase()
    return openSession(await authApi.login({ email: normalized, password }), normalized)
  },
  async registerWithEmail({ email, password, firstName, lastName }) {
    const normalized = email.trim().toLowerCase()
    const res = await authApi.register({
      email: normalized,
      password,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
    })
    return openSession(res, normalized)
  },
  async logout() {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await authApi.logout({ refreshToken })
    } catch {
      // La session locale est fermée même si le serveur ne répond pas.
    } finally {
      clearAuthSession()
    }
  },
  getUser: getAuthUser,
  hasSession: () => Boolean(getAccessToken()),
  eventName: getAuthEventName(),
  errorMessage,
}
