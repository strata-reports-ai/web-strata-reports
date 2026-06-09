import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import type { DashboardSummary, AuditLogEvent } from '../api/dashboardApi'

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
    description: 'March revenue import completed (47 reservations)',
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

  if (method !== 'GET') {
    return { error: demoNudge() }
  }

  if (path === 'dashboard/summary') {
    return { data: demoDashboardSummary }
  }

  if (path === 'audit-log') {
    return { data: demoRecentActivity }
  }

  if (path === 'users/me') {
    return { data: demoMe }
  }

  if (path === 'billing/status' || path === 'billing') {
    return { data: demoBillingStatus }
  }

  if (path === 'properties') {
    return { data: { items: [], totalCount: 0, page: 1, pageSize: 20 } }
  }

  if (path === 'reports') {
    return { data: { items: [], totalCount: 0, page: 1, pageSize: 20 } }
  }

  if (path === 'imports') {
    return { data: { items: [], totalCount: 0, page: 1, pageSize: 20 } }
  }

  return { data: { items: [], totalCount: 0 } }
}
