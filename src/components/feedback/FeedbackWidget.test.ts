import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const widgetSrc = readFileSync(resolve(__dirname, 'FeedbackWidget.tsx'), 'utf8')
const appShellSrc = readFileSync(
  resolve(__dirname, '..', 'layout', 'AppShell.tsx'),
  'utf8',
)

test('FeedbackWidget renders a Dialog with title "Send feedback"', () => {
  assert.match(widgetSrc, /<Dialog\b/)
  assert.match(widgetSrc, /<DialogTitle[^>]*>Send feedback<\/DialogTitle>/)
})

test('FeedbackWidget exposes a multiline TextField with rows=5 and maxLength=2000', () => {
  assert.match(widgetSrc, /multiline/)
  assert.match(widgetSrc, /rows=\{5\}/)
  assert.match(widgetSrc, /FEEDBACK_MAX_LENGTH = 2000/)
  assert.match(widgetSrc, /maxLength: FEEDBACK_MAX_LENGTH/)
})

test('FeedbackWidget posts JSON to /api/support/feedback with the required body fields', () => {
  assert.match(widgetSrc, /FEEDBACK_ENDPOINT = '\/api\/support\/feedback'/)
  assert.match(widgetSrc, /method: 'POST'/)
  assert.match(widgetSrc, /'Content-Type': 'application\/json'/)
  assert.match(widgetSrc, /message: trimmed/)
  assert.match(widgetSrc, /currentPath: window\.location\.pathname/)
  assert.match(widgetSrc, /userAgent: navigator\.userAgent/)
})

test('submit button is disabled when message is empty or submitting', () => {
  // trimmed empty -> disabled
  assert.match(widgetSrc, /submitDisabled = trimmed\.length === 0 \|\| state === 'submitting'/)
  assert.match(widgetSrc, /disabled=\{submitDisabled\}/)
})

test('FeedbackWidget shows a success Snackbar message after submit', () => {
  assert.match(widgetSrc, /<Snackbar\b/)
  assert.match(widgetSrc, /autoHideDuration=\{4000\}/)
  assert.match(widgetSrc, /Thanks — we'll read every message/)
  assert.match(widgetSrc, /severity="success"/)
})

test('FeedbackWidget shows the inline error message on non-2xx responses', () => {
  assert.match(
    widgetSrc,
    /Couldn't send — please try again or email/,
  )
  assert.match(widgetSrc, /support@strata-reports\.dev/)
})

test('FeedbackWidget shows the "temporarily unavailable" copy on 404', () => {
  assert.match(widgetSrc, /response\.status === 404/)
  assert.match(widgetSrc, /Feedback channel temporarily unavailable/)
})

test('FeedbackWidget fires PostHog event feedback_submitted with messageLength only', () => {
  assert.match(widgetSrc, /FEEDBACK_EVENT = 'feedback_submitted'/)
  assert.match(
    widgetSrc,
    /track\(FEEDBACK_EVENT, \{ messageLength: trimmed\.length \}\)/,
  )
  // Make sure the message text itself is NOT passed along.
  assert.ok(
    !/track\(FEEDBACK_EVENT,[^)]*message:/.test(widgetSrc),
    'feedback_submitted event must not include the message text',
  )
})

test('FeedbackWidget is mounted inside every variant of the AppShell', () => {
  assert.match(
    appShellSrc,
    /import \{ FeedbackWidget \} from '\.\.\/feedback\/FeedbackWidget'/,
  )
  const occurrences = appShellSrc.match(/<FeedbackWidget\s*\/>/g) ?? []
  assert.equal(
    occurrences.length,
    3,
    'FeedbackWidget should be rendered in mobile, tablet, and desktop AppShell branches',
  )
})

test('Dialog uses fullScreen on mobile to avoid horizontal scroll at 360px', () => {
  assert.match(widgetSrc, /fullScreen=\{isMobile\}/)
  assert.match(widgetSrc, /fullWidth/)
})
