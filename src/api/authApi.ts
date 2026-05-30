import { baseApi } from './baseApi'

export interface AuthUser {
  id: string
  email: string
  displayName: string | null
  role: string
  isEmailVerified: boolean
}

export type MeResponse = AuthUser

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => 'users/me',
    }),
  }),
})

export const { useGetMeQuery } = authApi
