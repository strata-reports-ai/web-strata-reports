import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // JWT is sent via httpOnly cookie; no manual header needed
      return headers
    },
  }),
  tagTypes: ['Property', 'Properties', 'Import', 'Report', 'Tenant'],
  endpoints: () => ({}),
})
