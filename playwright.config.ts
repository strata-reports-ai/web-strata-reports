import { defineConfig, devices } from '@playwright/test'

/**
 * Mobile-only Playwright configuration for the core flow QA checklist.
 *
 * Run with `npm run test:mobile`. The default CI pipeline does not invoke
 * this config; it is intended to be run manually against the staging
 * environment ahead of launch.
 *
 * Set `MOBILE_BASE_URL` to point at the staging deployment (defaults to
 * https://staging.stratareport.ai for convenience).
 */
export default defineConfig({
  testDir: './tests/mobile',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results/mobile',
  use: {
    baseURL: process.env.MOBILE_BASE_URL ?? 'https://staging.stratareport.ai',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-iphone',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
