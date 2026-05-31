import { baseApi } from './baseApi'

export interface AuditLogEvent {
  id: string
  eventType: string
  description: string
  occurredAt: string
}

export interface DashboardSummary {
  totalProperties: number
  reportsThisQuarter: number
  pendingImports: number
  mrrAtStake: number
  recentActivity: AuditLogEvent[]
}

export interface AuditLogParams {
  limit?: number
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => 'dashboard/summary',
      providesTags: ['Property', 'Import', 'Report'],
    }),
    getAuditLog: builder.query<AuditLogEvent[], AuditLogParams>({
      query: ({ limit } = {}) => ({
        url: 'audit-log',
        params: limit !== undefined ? { limit } : {},
      }),
      providesTags: ['Property', 'Import', 'Report'],
    }),
  }),
})

export const { useGetDashboardSummaryQuery, useGetAuditLogQuery } = dashboardApi
