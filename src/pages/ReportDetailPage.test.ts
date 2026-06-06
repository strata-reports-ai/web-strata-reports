import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pageSrc = readFileSync(resolve(__dirname, 'ReportDetailPage.tsx'), 'utf8')
const sliceSrc = readFileSync(
  resolve(__dirname, '..', 'api', 'reportSlice.ts'),
  'utf8',
)

test('reportSlice exposes useRegenerateReportMutation pointing at POST reports/:id/regenerate', () => {
  assert.match(sliceSrc, /regenerateReport: builder\.mutation/)
  assert.match(sliceSrc, /reports\/\$\{id\}\/regenerate/)
  assert.match(sliceSrc, /method: 'POST'/)
  assert.match(sliceSrc, /useRegenerateReportMutation/)
  assert.match(
    sliceSrc,
    /invalidatesTags:\s*\(_result,\s*_err,\s*id\)\s*=>\s*\[[\s\S]*?\{\s*type:\s*'Report',\s*id\s*\}/,
  )
})

test('ReportDetailPage uses the new regenerate mutation, not the legacy generate path', () => {
  assert.match(pageSrc, /useRegenerateReportMutation/)
  assert.ok(
    !/useGenerateReportMutation/.test(pageSrc),
    'should no longer call useGenerateReportMutation from the detail page',
  )
})

test('confirmation dialog uses the required title and warning copy', () => {
  assert.match(pageSrc, /Regenerate this report\?/)
  assert.match(
    pageSrc,
    /This will replace the current PDF and AI narrative\. The existing PDF will be permanently\s+overwritten\./,
  )
  assert.match(pageSrc, /color="error"\s+variant="contained"/)
})

test('Regenerate button is disabled with tooltip "Already in progress" when generating', () => {
  assert.match(pageSrc, /'Already in progress'/)
  assert.match(pageSrc, /isInProgress/)
  assert.match(pageSrc, /regenerateDisabled/)
  assert.match(pageSrc, /<Tooltip title=\{regenerateTooltip\}/)
})

test('mobile viewport renders an IconButton with aria-label="Regenerate report"', () => {
  assert.match(pageSrc, /aria-label="Regenerate report"/)
  assert.match(pageSrc, /<IconButton/)
  assert.match(pageSrc, /isMobile \?/)
})

test('touch targets meet 44x44 minimum on mobile', () => {
  assert.match(pageSrc, /minHeight:\s*44/)
  assert.match(pageSrc, /minWidth:\s*44/)
})

test('handler maps 409 / 429 / 503 responses to the required toast copy', () => {
  assert.match(pageSrc, /case 409:/)
  assert.match(
    pageSrc,
    /This report is already generating\. Try again when it finishes\./,
  )
  assert.match(pageSrc, /case 429:/)
  assert.match(
    pageSrc,
    /You've reached your daily report limit\. Upgrade your plan or wait until tomorrow\./,
  )
  assert.match(pageSrc, /case 503:/)
  assert.match(
    pageSrc,
    /Report generation is temporarily unavailable\. Please try again in a few minutes\./,
  )
})

test('falls back to Problem Details `detail` then to default error copy', () => {
  assert.match(pageSrc, /apiErr\?\.data\?\.detail/)
  assert.match(pageSrc, /Could not regenerate report\./)
})

test('on success: shows "Regeneration queued" toast and switches to polling UI', () => {
  assert.match(pageSrc, /Regeneration queued/)
  assert.match(pageSrc, /setIsPolling\(true\)/)
  assert.match(pageSrc, /<Snackbar/)
})

test('polling UI reuses the existing 3-second polling hook + stepper', () => {
  assert.match(pageSrc, /useReportPolling/)
  // STATUS_STEPS array covers the documented states.
  assert.match(pageSrc, /Queued/)
  assert.match(pageSrc, /Aggregating data/)
  assert.match(pageSrc, /Generating narrative/)
  assert.match(pageSrc, /Rendering PDF/)
  assert.match(pageSrc, /Done/)
})
