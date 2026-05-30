import { baseApi } from './baseApi'

interface AuthUser {
  id: string
  email: string
  displayName: string
  organisationId: string
}

export interface MeResponse {
  user: AuthUser
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => '/users/me',
    }),
  }),
})

export const { useGetMeQuery } = authApi
