import { test } from 'node:test'
import assert from 'node:assert/strict'

// Stub the `posthog-js` module so this test does not depend on a browser
// environment. The module-level singleton recorded here is the same instance
// `analytics.ts` will import via Node's module cache.
import posthog from 'posthog-js'

import {
  ANALYTICS_EVENTS,
  identify,
  isAnalyticsInitialised,
  resetAnalytics,
  track,
  __resetForTests,
} from './analytics.ts'

function withSpies<T>(fn: () => T): {
  result: T
  captures: unknown[][]
  identifies: unknown[][]
  resets: number
} {
  const captures: unknown[][] = []
  const identifies: unknown[][] = []
  let resets = 0
  const originalCapture = posthog.capture
  const originalIdentify = posthog.identify
  const originalReset = posthog.reset
  posthog.capture = ((...args: unknown[]) => {
    captures.push(args)
  }) as typeof posthog.capture
  posthog.identify = ((...args: unknown[]) => {
    identifies.push(args)
  }) as typeof posthog.identify
  posthog.reset = ((..._args: unknown[]) => {
    resets += 1
  }) as typeof posthog.reset
  try {
    const result = fn()
    return { result, captures, identifies, resets }
  } finally {
    posthog.capture = originalCapture
    posthog.identify = originalIdentify
    posthog.reset = originalReset
  }
}

test('track() is a no-op when PostHog key is empty (not initialised)', () => {
  __resetForTests()
  assert.equal(isAnalyticsInitialised(), false)

  const { captures, identifies, resets } = withSpies(() => {
    track(ANALYTICS_EVENTS.login)
    track(ANALYTICS_EVENTS.signup, { foo: 'bar' })
    identify('user-1', { tenant_id: 't-1', email_domain: 'example.com' })
    resetAnalytics()
  })

  assert.deepEqual(captures, [], 'capture should not be called when uninitialised')
  assert.deepEqual(identifies, [], 'identify should not be called when uninitialised')
  assert.equal(resets, 0, 'reset should not be called when uninitialised')
})

test('ANALYTICS_EVENTS exposes the ten product event names', () => {
  const names = Object.values(ANALYTICS_EVENTS).sort()
  assert.deepEqual(names, [
    'churned',
    'csv_processed',
    'csv_uploaded',
    'login',
    'plan_changed',
    'property_created',
    'report_downloaded',
    'report_generation_started',
    'report_generation_succeeded',
    'signup',
  ])
})
