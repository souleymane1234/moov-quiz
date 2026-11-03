import type { HttpClient } from '../../ports/http-client.port'
import { AUTH_API_PATHS, type AuthApiPaths } from './auth.paths'
import type {
  AuthEnvelopeDto,
  LoginBodyDto,
  LogoutBodyDto,
  LogoutResponseDto,
  RefreshBodyDto,
  RefreshEnvelopeDto,
  RegisterBodyDto,
} from './auth.types'

export interface AuthApi {
  login(body: LoginBodyDto): Promise<AuthEnvelopeDto>
  register(body: RegisterBodyDto): Promise<AuthEnvelopeDto>
  refresh(body: RefreshBodyDto): Promise<RefreshEnvelopeDto>
  logout(body: LogoutBodyDto): Promise<LogoutResponseDto>
}

export function createAuthApi(
  http: HttpClient,
  paths: AuthApiPaths = AUTH_API_PATHS,
): AuthApi {
  return {
    login(body) {
      return http.request<AuthEnvelopeDto>({
        method: 'POST',
        path: paths.login,
        body,
      })
    },
    register(body) {
      return http.request<AuthEnvelopeDto>({
        method: 'POST',
        path: paths.register,
        body,
      })
    },
    refresh(body) {
      return http.request<RefreshEnvelopeDto>({
        method: 'POST',
        path: paths.refresh,
        body,
      })
    },
    logout(body) {
      return http.request<LogoutResponseDto>({
        method: 'POST',
        path: paths.logout,
        body,
      })
    },
  }
}
