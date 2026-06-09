import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { isDemo } from '../demo/demoMode'
import { demoResolve } from '../demo/demoFixtures'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    return headers
  },
})

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  if (isDemo()) {
    return demoResolve(args) as { data: unknown } | { error: FetchBaseQueryError }
  }
  return rawBaseQuery(args, api, extraOptions)
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Me', 'Property', 'Properties', 'Import', 'Report', 'Tenant', 'Invitation', 'User'],
  endpoints: () => ({}),
})
