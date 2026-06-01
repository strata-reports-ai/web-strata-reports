import { test } from 'node:test'
import assert from 'node:assert/strict'

import { PLANS, OVERAGE_RATE_PER_REPORT, getPlanById, type Plan } from './plans.ts'

interface BillingStatusFixture {
  plan: string
  propertiesLimit: number
  reportsQuota: number
}

const BILLING_STATUS_FIXTURES: readonly BillingStatusFixture[] = [
  { plan: 'starter', propertiesLimit: 5, reportsQuota: 4 },
  { plan: 'pro', propertiesLimit: 20, reportsQuota: 20 },
  { plan: 'scale', propertiesLimit: 50, reportsQuota: -1 },
]

test('PLANS exposes the three MVP plans in canonical order', () => {
  const ids = PLANS.map((p) => p.id)
  assert.deepEqual(ids, ['starter', 'pro', 'scale'])
})

test('PLANS monthly prices match the published Stripe price points', () => {
  const prices: Record<string, number> = {}
  for (const plan of PLANS) prices[plan.id] = plan.priceMonthly
  assert.deepEqual(prices, { starter: 29, pro: 79, scale: 199 })
})

test('overage rate is $2/report', () => {
  assert.equal(OVERAGE_RATE_PER_REPORT, 2)
})

test('PLANS values exactly match GET /api/billing/status plan metadata', () => {
  for (const expected of BILLING_STATUS_FIXTURES) {
    const plan = getPlanById(expected.plan) as Plan
    assert.ok(plan, `getPlanById should return a plan for ${expected.plan}`)
    assert.equal(
      plan.propertiesLimit,
      expected.propertiesLimit,
      `propertiesLimit for ${expected.plan} must match billing/status`,
    )
    assert.equal(
      plan.reportsQuota,
      expected.reportsQuota,
      `reportsQuota for ${expected.plan} must match billing/status (use -1 for unlimited)`,
    )
  }
})

test('only the scale plan is flagged as unlimited reports', () => {
  for (const plan of PLANS) {
    if (plan.id === 'scale') {
      assert.equal(plan.unlimitedReports, true)
      assert.equal(plan.reportsQuota, -1)
    } else {
      assert.equal(plan.unlimitedReports, false)
      assert.ok(plan.reportsQuota > 0)
    }
  }
})
