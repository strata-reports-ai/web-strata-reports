import { baseApi } from './baseApi'

export type ImportStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'partial'

export type ImportType = 'Revenue' | 'Expenses' | 'Tasks' | 'Reviews' | 'Inspections'

export interface ImportRow {
  id: string
  fileName: string
  importType: ImportType
  propertyId: string
  propertyName: string
  uploadedAt: string
  status: ImportStatus
  recordsImported: number
  totalRecords: number
  blobPath: string
}

export interface ImportDetail extends ImportRow {
  errorSummary: string | null
  columnMapping: Record<string, string> | null
  skippedRows: number
  failedRowMessages: string[]
}

export interface ImportsListParams {
  propertyId?: string
  type?: ImportType
}

export const importApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listImports: builder.query<ImportRow[], ImportsListParams>({
      query: ({ propertyId, type } = {}) => {
        const params = new URLSearchParams()
        if (propertyId) params.set('propertyId', propertyId)
        if (type) params.set('type', type)
        const qs = params.toString()
        return `/imports${qs ? `?${qs}` : ''}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Import' as const, id })),
              { type: 'Import', id: 'LIST' },
            ]
          : [{ type: 'Import', id: 'LIST' }],
    }),

    getImport: builder.query<ImportDetail, string>({
      query: (id) => `/imports/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Import', id }],
    }),

    reprocessImport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/imports/${id}/reprocess`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Import', id },
        { type: 'Import', id: 'LIST' },
      ],
    }),

    getDownloadUrl: builder.query<{ url: string }, string>({
      query: (id) => `/imports/${id}/download-url`,
    }),

    getUploadUrl: builder.mutation<
      { uploadUrl: string; blobPath: string },
      { fileName: string; importType: ImportType; propertyId: string }
    >({
      query: (body) => ({
        url: '/imports/upload-url',
        method: 'POST',
        body,
      }),
    }),

    createImport: builder.mutation<
      { id: string },
      { fileName: string; importType: ImportType; propertyId: string; blobPath: string }
    >({
      query: (body) => ({
        url: '/imports',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Import', id: 'LIST' }],
    }),
  }),
})

export const {
  useListImportsQuery,
  useGetImportQuery,
  useReprocessImportMutation,
  useLazyGetDownloadUrlQuery,
  useGetUploadUrlMutation,
  useCreateImportMutation,
} = importApi
