import { baseApi } from './baseApi'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    displayName: string
    organisationId: string
  }
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  organisationName: string
}

export interface RegisterResponse {
  message: string
  redirectTo: string
}

export interface MeResponse {
  user: {
    id: string
    email: string
    displayName: string
    organisationId: string
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => '/auth/me',
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi
