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
  generatedBy: string | null
  aiModel: string | null
  generationTimeMs: number | null
  aiCostUsd: number | null
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
      query: (params) => {
        const p: Record<string, string> = {}
        if (params.propertyId) p.propertyId = params.propertyId
        if (params.status && params.status.length > 0) p.status = params.status.join(',')
        if (params.from) p.from = params.from
        if (params.to) p.to = params.to
        if (params.cursor) p.cursor = params.cursor
        p.pageSize = String(params.pageSize ?? 25)
        return { url: 'reports', params: p }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Report' as const, id })),
              { type: 'Report', id: 'LIST' },
            ]
          : [{ type: 'Report', id: 'LIST' }],
    }),

    deleteReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
      ],
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
