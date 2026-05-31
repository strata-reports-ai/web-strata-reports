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

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  organisationName: string
}

export interface RegisterResponse {
  message: string
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
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: 'auth/register',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation, useRegisterMutation } = authApi
