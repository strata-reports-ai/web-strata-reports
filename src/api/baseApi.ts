import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      return headers
    },
  }),
  tagTypes: ['Me', 'Property', 'Properties', 'Import', 'Report', 'Tenant', 'Invitation', 'User'],
  endpoints: () => ({}),
})
