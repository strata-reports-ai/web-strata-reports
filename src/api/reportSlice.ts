import { baseApi } from './baseApi'

export type ReportStatus = 'queued' | 'generating' | 'succeeded' | 'failed'

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

export interface ListReportsParams {
  propertyId?: string
  status?: ReportStatus[]
  from?: string
  to?: string
  cursor?: string
  pageSize?: number
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

    listReports: builder.query<ListReportsResponse, ListReportsParams>({
      query: (params) => ({
        url: 'reports',
        params: {
          ...(params.propertyId ? { propertyId: params.propertyId } : {}),
          ...(params.status && params.status.length > 0 ? { status: params.status.join(',') } : {}),
          ...(params.from ? { from: params.from } : {}),
          ...(params.to ? { to: params.to } : {}),
          ...(params.cursor ? { cursor: params.cursor } : {}),
          pageSize: params.pageSize ?? 25,
        },
      }),
      providesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    deleteReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Report', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPreflightQuery,
  useLazyGetPreflightQuery,
  useGenerateReportMutation,
  useGetReportQuery,
  useLazyGetReportQuery,
  useListReportsQuery,
  useDeleteReportMutation,
} = reportApi
