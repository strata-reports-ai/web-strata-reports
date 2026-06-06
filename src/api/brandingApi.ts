import { baseApi } from './baseApi'

export interface TenantBranding {
  primaryColorHex: string | null
  reportFooterText: string | null
  logoBlobPath: string | null
  logoUrl: string | null
}

export interface UpdateBrandingRequest {
  primaryColorHex?: string | null
  reportFooterText?: string | null
  logoBlobPath?: string | null
}

export interface LogoUploadUrlRequest {
  contentType: string
  fileName: string
}

export interface LogoUploadUrlResponse {
  uploadUrl: string
  blobPath: string
}

export const brandingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranding: builder.query<TenantBranding, void>({
      query: () => 'tenant/branding',
      providesTags: ['Tenant'],
    }),
    updateBranding: builder.mutation<TenantBranding, UpdateBrandingRequest>({
      query: (body) => ({
        url: 'tenant/branding',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Tenant'],
    }),
    getLogoUploadUrl: builder.mutation<LogoUploadUrlResponse, LogoUploadUrlRequest>({
      query: (body) => ({
        url: 'tenant/branding/logo-upload-url',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useGetLogoUploadUrlMutation,
} = brandingApi
