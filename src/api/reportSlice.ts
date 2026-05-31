import { baseApi } from './baseApi'

export type ReportStatus = 'queued' | 'generating' | 'processing' | 'succeeded' | 'failed'

export interface Report {
  id: string
  propertyId: string
  propertyName: string
  type: string
  periodStart: string
  periodEnd: string
  status: ReportStatus
  errorMessage: string | null
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface GenerateReportRequest {
  propertyId: string
  type: string
  periodStart: string
  periodEnd: string
  customNote?: string
}

export interface GenerateReportResponse {
  reportId: string
}

export interface PreflightResult {
  hasSomeData: boolean
  missingTypes: string[]
}

export interface PreflightParams {
  propertyId: string
  periodStart: string
  periodEnd: string
}

export interface ListReportsResponse {
  items: Report[]
  nextCursor: string | null
  prevCursor: string | null
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPreflight: builder.query<PreflightResult, PreflightParams>({
      query: ({ propertyId, periodStart, periodEnd }) => ({
        url: 'reports/preflight',
        params: { propertyId, periodStart, periodEnd },
      }),
    }),

    generateReport: builder.mutation<GenerateReportResponse, GenerateReportRequest>({
      query: (body) => ({
        url: 'reports/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    getReport: builder.query<Report, string>({
      query: (id) => `reports/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Report', id }],
    }),

    listReports: builder.query<ListReportsResponse, void>({
      query: () => 'reports',
      providesTags: [{ type: 'Report', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPreflightQuery,
  useLazyGetPreflightQuery,
  useGenerateReportMutation,
  useGetReportQuery,
  useListReportsQuery,
} = reportApi
