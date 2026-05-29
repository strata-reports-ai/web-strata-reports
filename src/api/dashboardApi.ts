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

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => 'dashboard/summary',
      providesTags: ['Property', 'Import', 'Report'],
    }),
  }),
})

export const { useGetDashboardSummaryQuery } = dashboardApi
