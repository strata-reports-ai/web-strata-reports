import posthog from 'posthog-js'

// TODO(strata-reports-ai/orchestrator-strata-reports#129):
//   `csv_processed` and `churned` are emitted server-side from the backend
//   worker / billing webhook. They are listed here only as constants so the
//   frontend code can reference them in tests and future contexts; no
//   frontend wiring should call `track()` with these events.
export const ANALYTICS_EVENTS = {
  signup: 'signup',
  property_created: 'property_created',
  csv_uploaded: 'csv_uploaded',
  csv_processed: 'csv_processed',
  report_generation_started: 'report_generation_started',
  report_generation_succeeded: 'report_generation_succeeded',
  report_downloaded: 'report_downloaded',
  plan_changed: 'plan_changed',
  churned: 'churned',
  login: 'login',
  team_invite_form_viewed: 'team_invite_form_viewed',
  team_invite_submitted: 'team_invite_submitted',
  team_invite_failed: 'team_invite_failed',
} as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

let initialised = false

export function initAnalytics(key: string | undefined, host: string | undefined): void {
  if (!key) return
  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    capture_pageview: true,
    persistence: 'localStorage',
  })
  initialised = true
}

export function isAnalyticsInitialised(): boolean {
  return initialised
}

export function identify(
  userId: string,
  props: { tenant_id?: string | null; email_domain?: string | null } = {},
): void {
  if (!initialised) return
  posthog.identify(userId, props)
}

export function resetAnalytics(): void {
  if (!initialised) return
  posthog.reset()
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (!initialised) return
  posthog.capture(event, props)
}

export function __resetForTests(): void {
  initialised = false
}
