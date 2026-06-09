import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import type { DashboardSummary, AuditLogEvent } from '../api/dashboardApi'
import type { PropertyListItem, PropertyListResponse, PropertyFilterOptions } from '../api/propertiesApi'
import type { Report, ListReportsResponse, PreflightResult } from '../api/reportSlice'

type DemoResult = { data: unknown } | { error: FetchBaseQueryError }

function extractUrlAndMethod(args: string | FetchArgs): { url: string; method: string } {
  if (typeof args === 'string') {
    return { url: args, method: 'GET' }
  }
  return { url: args.url, method: (args.method ?? 'GET').toUpperCase() }
}

function normalisePath(url: string): string {
  const trimmed = url.replace(/^\/+/, '').replace(/\/+$/, '')
  const noQuery = trimmed.split('?')[0]
  return noQuery
}

const DEMO_PROPERTY_ID = 'demo-prop-blue-ridge'
const DEMO_REPORT_ID = 'demo-report-q1-2026'

const demoRecentActivity: AuditLogEvent[] = [
  {
    id: 'demo-act-1',
    eventType: 'report.generated',
    description: 'Q1 2026 owner report generated for Blue Ridge Cabin',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'demo-act-2',
    eventType: 'import.completed',
    description: 'March revenue import completed (16 reservations)',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'demo-act-3',
    eventType: 'property.added',
    description: 'Blue Ridge Cabin added to portfolio',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
]

const demoDashboardSummary: DashboardSummary = {
  totalProperties: 1,
  reportsThisQuarter: 1,
  pendingImports: 0,
  mrrAtStake: 4280,
  recentActivity: demoRecentActivity,
}

const demoBillingStatus = {
  status: 'trialing' as const,
  trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
  plan: 'starter',
}

const demoMe = {
  id: 'demo-user',
  email: 'demo@stayrecap.app',
  displayName: 'Demo User',
  role: 'owner',
  isEmailVerified: true,
}

const demoProperty: PropertyListItem = {
  id: DEMO_PROPERTY_ID,
  name: 'Blue Ridge Cabin',
  address: '42 Overlook Trail',
  city: 'Asheville',
  ownerName: 'Margaret Hollis',
  units: 1,
  lastReportDate: '2026-04-02',
  lastImportDate: '2026-04-01',
}

const demoProperties: PropertyListResponse = {
  items: [demoProperty],
  totalCount: 1,
  page: 1,
  pageSize: 25,
}

const demoPropertyFilterOptions: PropertyFilterOptions = {
  cities: ['Asheville'],
  ownerNames: ['Margaret Hollis'],
}

const demoReport: Report = {
  id: DEMO_REPORT_ID,
  propertyId: DEMO_PROPERTY_ID,
  propertyName: 'Blue Ridge Cabin',
  ownerEmail: 'margaret@example.com',
  type: 'quarterly_owner',
  periodStart: '2026-01-01',
  periodEnd: '2026-03-31',
  status: 'succeeded',
  errorMessage: null,
  pdfUrl: null,
  createdAt: '2026-04-02T10:00:00.000Z',
  updatedAt: '2026-04-02T10:02:00.000Z',
  generatedBy: 'ai',
  aiModel: 'claude',
  generationTimeMs: 92000,
  aiCostUsd: 0.18,
  sentToOwnerAt: null,
}

const demoReports: ListReportsResponse = {
  items: [demoReport],
  nextCursor: null,
  prevCursor: null,
}

const demoPreflight: PreflightResult = {
  hasSomeData: true,
  missingTypes: [],
}

const demoEmptyList = { items: [], totalCount: 0, page: 1, pageSize: 25 }

function demoNudge(): FetchBaseQueryError {
  return {
    status: 'CUSTOM_ERROR',
    error: 'DEMO',
    data: 'Sign up to do this in your own account.',
  } as unknown as FetchBaseQueryError
}

export function demoResolve(args: string | FetchArgs): DemoResult {
  const { url, method } = extractUrlAndMethod(args)
  const path = normalisePath(url)

  // All writes are no-ops in demo mode — surface a friendly sign-up nudge.
  if (method !== 'GET') {
    return { error: demoNudge() }
  }

  if (path === 'dashboard/summary') return { data: demoDashboardSummary }
  if (path === 'audit-log') return { data: demoRecentActivity }
  if (path === 'users/me') return { data: demoMe }
  if (path === 'billing/status' || path === 'billing') return { data: demoBillingStatus }

  // Properties (check specific sub-routes before the generic single-item match)
  if (path === 'properties/filter-options') return { data: demoPropertyFilterOptions }
  if (path === 'properties') return { data: demoProperties }
  if (path.startsWith('properties/')) return { data: demoProperty }

  // Reports (cursor-paginated; check sub-routes before the generic single-item match)
  if (path === 'reports/preflight') return { data: demoPreflight }
  if (path === 'reports') return { data: demoReports }
  if (path.startsWith('reports/')) return { data: demoReport }

  if (path === 'imports') return { data: demoEmptyList }

  // Unknown read endpoint — return a benign empty list so screens render rather than crash.
  return { data: demoEmptyList }
}
