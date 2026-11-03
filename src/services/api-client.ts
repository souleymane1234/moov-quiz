import { createAppHttpClient } from '../lib/api/create-app-http-client'
import { createAnnoncesApi } from '../lib/api/modules/annonces'
import { createAuthApi } from '../lib/api/modules/auth'
import { createCountriesApi } from '../lib/api/modules/countries'
import { createEmissionApi } from '../lib/api/modules/emission'
import { createNewsApi } from '../lib/api/modules/news'
import { createPartenairesApi } from '../lib/api/modules/partenaires'
import { createPlayApi } from '../lib/api/modules/play'
import { createProfileApi } from '../lib/api/modules/profile'
import { createSearchApi } from '../lib/api/modules/search'
import { createUploadsApi } from '../lib/api/modules/uploads'
import { createVideoApi } from '../lib/api/modules/video'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
} from '../lib/auth-session'

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    // Client sans refresh récursif pour éviter une boucle 401.
    const bare = createAppHttpClient({ skipAuth: true })
    const auth = createAuthApi(bare)
    const res = await auth.refresh({ refreshToken })
    const tokens = 'data' in res ? res.data : res
    const accessToken = tokens?.accessToken
    if (!accessToken) return null
    setAuthSession({
      accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
    })
    return accessToken
  } catch {
    clearAuthSession()
    return null
  }
}

const httpClient = createAppHttpClient({
  getToken: getAccessToken,
  refreshAccessToken,
})

export const emissionApi = createEmissionApi(httpClient)
export const newsApi = createNewsApi(httpClient)
export const authApi = createAuthApi(httpClient)
export const uploadsApi = createUploadsApi(httpClient)
export const countriesApi = createCountriesApi(httpClient)
export const partenairesApi = createPartenairesApi(httpClient)
export const profileApi = createProfileApi(httpClient)
export const annoncesApi = createAnnoncesApi(httpClient)
export const playApi = createPlayApi(httpClient)
export const videoApi = createVideoApi(httpClient)
export const searchApi = createSearchApi(httpClient)
