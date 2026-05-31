import { baseApi } from './baseApi'

export interface AuthUser {
  id: string
  email: string
  displayName: string | null
  role: string
  isEmailVerified: boolean
}

export type MeResponse = AuthUser

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
      providesTags: ['Me'],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation } = authApi
