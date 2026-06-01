import { baseApi } from './baseApi'

export type BillingStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'

export interface BillingStatusResponse {
  plan: string
  status: BillingStatus
  trialEndsAt: string | null
  propertiesUsed: number
  propertiesLimit: number
  reportsThisQuarter: number
  reportsQuota: number
}

export interface CheckoutSessionResponse {
  url: string
}

export interface PortalSessionResponse {
  url: string
}

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingStatus: builder.query<BillingStatusResponse, void>({
      query: () => 'billing/status',
      keepUnusedDataFor: 300,
      providesTags: ['Tenant'],
    }),
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, void>({
      query: () => ({
        url: 'billing/checkout-session',
        method: 'POST',
      }),
    }),
    createPortalSession: builder.mutation<PortalSessionResponse, void>({
      query: () => ({
        url: 'billing/portal-session',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useGetBillingStatusQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
} = billingApi
