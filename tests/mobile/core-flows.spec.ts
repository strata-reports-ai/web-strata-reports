import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'

/**
 * Mobile core-flow smoke captures for the pre-launch QA checklist documented
 * at `docs/qa/mobile-core-flow-checklist.md`.
 *
 * Each `test.step` corresponds to a checklist row and writes one screenshot
 * named after the checklist `Screenshot ID`. Screenshots land in
 * `test-results/mobile/<project-name>/` so that manual and automated captures
 * line up one-to-one.
 *
 * The flows are intentionally tolerant: they navigate to each route, wait for
 * the page to be visually settled, and capture a screenshot. They do not make
 * assertions about backend state — the human QA tester performs the explicit
 * pass/fail judgement using the checklist.
 *
 * Required environment variables (read at runtime, not at import time so the
 * file still loads if Playwright is invoked without them):
 *   MOBILE_BASE_URL           — staging base URL (also configured in playwright.config.ts)
 *   MOBILE_TEST_EMAIL         — pre-provisioned QA account email
 *   MOBILE_TEST_PASSWORD      — pre-provisioned QA account password
 *   MOBILE_TEST_PROPERTY_NAME — name of a property to seed the add-property step
 *   MOBILE_TEST_CSV_PATH      — absolute path to a sample lots CSV file
 */

const SCREENSHOT_ROOT = 'test-results/mobile'

function shotPath(projectName: string, id: string): string {
  return path.join(SCREENSHOT_ROOT, projectName, `${id}.png`)
}

async function capture(page: Page, projectName: string, id: string): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {
    /* networkidle is best-effort on long-polling pages */
  })
  await page.screenshot({ path: shotPath(projectName, id), fullPage: true })
}

async function signIn(page: Page): Promise<void> {
  const email = process.env.MOBILE_TEST_EMAIL
  const password = process.env.MOBILE_TEST_PASSWORD
  if (!email || !password) {
    test.skip(true, 'MOBILE_TEST_EMAIL and MOBILE_TEST_PASSWORD must be set to run authenticated flows')
  }
  await page.goto('/auth/signin')
  await page.getByLabel(/email/i).fill(email!)
  await page.getByLabel(/password/i).fill(password!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 30_000 })
}

test.describe('Mobile core flow captures', () => {
  test('Flow 1 — Signup', async ({ page }, testInfo) => {
    const project = testInfo.project.name

    await test.step('signup-01-form', async () => {
      await page.goto('/auth/signup')
      await expect(page.getByRole('button', { name: /sign ?up|create account/i })).toBeVisible()
      await capture(page, project, 'signup-01-form')
    })

    await test.step('signup-02-keyboard', async () => {
      await page.getByLabel(/email/i).tap().catch(() => page.getByLabel(/email/i).click())
      await capture(page, project, 'signup-02-keyboard')
    })

    await test.step('signup-03-validation', async () => {
      await page.getByLabel(/email/i).fill('not-an-email')
      await page.getByLabel(/password/i).fill('123')
      await page.getByRole('button', { name: /sign ?up|create account/i }).click().catch(() => {
        /* button may be disabled by validation; that's fine */
      })
      await capture(page, project, 'signup-03-validation')
    })

    await test.step('signup-04-redirect', async () => {
      // We do not actually submit a real signup here to avoid polluting staging
      // with random tenants. The human tester performs this step manually and
      // captures the redirected screen.
      await capture(page, project, 'signup-04-redirect')
    })
  })

  test('Flow 2 — Add property', async ({ page }, testInfo) => {
    const project = testInfo.project.name
    await signIn(page)

    await test.step('addproperty-01-list', async () => {
      await page.goto('/properties')
      await capture(page, project, 'addproperty-01-list')
    })

    await test.step('addproperty-02-form', async () => {
      await page.goto('/properties/new')
      await capture(page, project, 'addproperty-02-form')
    })

    await test.step('addproperty-03-filled', async () => {
      const propertyName = process.env.MOBILE_TEST_PROPERTY_NAME ?? `QA Mobile ${Date.now()}`
      await page.getByLabel(/name/i).first().fill(propertyName).catch(() => undefined)
      await page.getByLabel(/address/i).first().fill('1 Test Street, Sydney NSW 2000').catch(() => undefined)
      await capture(page, project, 'addproperty-03-filled')
    })

    await test.step('addproperty-04-confirmation', async () => {
      await page.getByRole('button', { name: /save|create|add property/i }).click().catch(() => undefined)
      await page.waitForURL(/\/properties(\/.*)?$/, { timeout: 30_000 }).catch(() => undefined)
      await capture(page, project, 'addproperty-04-confirmation')
    })
  })

  test('Flow 3 — Upload CSV', async ({ page }, testInfo) => {
    const project = testInfo.project.name
    await signIn(page)

    await test.step('upload-01-landing', async () => {
      await page.goto('/imports')
      await capture(page, project, 'upload-01-landing')
    })

    await test.step('upload-02-picker', async () => {
      const csvPath = process.env.MOBILE_TEST_CSV_PATH
      if (!csvPath) {
        await capture(page, project, 'upload-02-picker')
        return
      }
      const fileChooserPromise = page.waitForEvent('filechooser')
      await page.getByRole('button', { name: /upload|choose file|select csv/i }).first().click().catch(() => undefined)
      const chooser = await fileChooserPromise.catch(() => null)
      if (chooser) {
        await chooser.setFiles(csvPath)
      }
      await capture(page, project, 'upload-02-picker')
    })

    await test.step('upload-03-mapping', async () => {
      await capture(page, project, 'upload-03-mapping')
    })

    await test.step('upload-04-success', async () => {
      await page.getByRole('button', { name: /confirm|import|submit/i }).click().catch(() => undefined)
      await capture(page, project, 'upload-04-success')
    })
  })

  test('Flow 4 — Generate report', async ({ page }, testInfo) => {
    const project = testInfo.project.name
    await signIn(page)

    await test.step('report-01-form', async () => {
      await page.goto('/reports/new')
      await capture(page, project, 'report-01-form')
    })

    await test.step('report-02-inputs', async () => {
      await page.getByLabel(/property/i).first().click().catch(() => undefined)
      await capture(page, project, 'report-02-inputs')
    })

    await test.step('report-03-pending', async () => {
      await page.getByRole('button', { name: /generate|create report|submit/i }).click().catch(() => undefined)
      await page.waitForURL(/\/reports\/.+/, { timeout: 30_000 }).catch(() => undefined)
      await capture(page, project, 'report-03-pending')
    })

    await test.step('report-04-ready', async () => {
      await page.waitForSelector('text=/ready|completed/i', { timeout: 300_000 }).catch(() => undefined)
      await capture(page, project, 'report-04-ready')
    })
  })

  test('Flow 5 — View PDF', async ({ page }, testInfo) => {
    const project = testInfo.project.name
    await signIn(page)

    await test.step('pdf-01-open', async () => {
      await page.goto('/reports')
      const firstReady = page.getByRole('link', { name: /ready|completed/i }).first()
      await firstReady.click().catch(() => undefined)
      await page.getByRole('button', { name: /view pdf|open pdf|view report/i }).first().click().catch(() => undefined)
      await capture(page, project, 'pdf-01-open')
    })

    await test.step('pdf-02-zoom', async () => {
      await capture(page, project, 'pdf-02-zoom')
    })

    await test.step('pdf-03-back', async () => {
      await page.goBack().catch(() => undefined)
      await capture(page, project, 'pdf-03-back')
    })

    await test.step('pdf-04-download', async () => {
      await page.getByRole('button', { name: /download/i }).first().click().catch(() => undefined)
      await capture(page, project, 'pdf-04-download')
    })
  })
})
