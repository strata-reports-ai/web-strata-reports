import { baseApi } from './baseApi'

export interface AuthUser {
  id: string
  email: string
  displayName: string | null
  organisationId: string
  role: string
  isEmailVerified: boolean
}

export interface MeResponse {
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  redirectTo: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => 'users/me',
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation } = authApi
