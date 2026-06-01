import { baseApi } from './baseApi'

export interface SeedSampleDataResponse {
  propertyId: string
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    seedSampleData: builder.mutation<SeedSampleDataResponse, void>({
      query: () => ({
        url: 'onboarding/sample-data',
        method: 'POST',
      }),
      invalidatesTags: ['Properties', 'Import', 'Report'],
    }),
  }),
})

export const { useSeedSampleDataMutation } = onboardingApi
