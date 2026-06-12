import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseDateOnly } from './dates.ts'

test('parseDateOnly keeps the calendar date (no UTC roll-back)', () => {
  const d = parseDateOnly('2026-01-01')
  assert.equal(d.getFullYear(), 2026)
  // January (0) — would be December (11) of 2025 with `new Date('2026-01-01')`
  // in a negative-offset timezone.
  assert.equal(d.getMonth(), 0)
  assert.equal(d.getDate(), 1)
})

test('parseDateOnly yields the correct quarter for a Q1 start date', () => {
  const d = parseDateOnly('2026-01-01')
  assert.equal(Math.floor(d.getMonth() / 3) + 1, 1)
})

test('parseDateOnly accepts the date portion of an ISO timestamp', () => {
  const d = parseDateOnly('2026-04-02T10:00:00.000Z')
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 3) // April
  assert.equal(d.getDate(), 2)
})
