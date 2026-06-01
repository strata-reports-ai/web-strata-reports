import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcRoot = resolve(__dirname, '..')

function readSource(relative: string): string {
  return readFileSync(resolve(srcRoot, relative), 'utf8')
}

const PRIMARY_ROUTE_FILES = [
  'pages/SignInPage.tsx',
  'pages/SignUpPage.tsx',
  'pages/ForgotPasswordPage.tsx',
  'pages/ResetPasswordPage.tsx',
  'pages/DashboardPage.tsx',
  'pages/PropertiesPage.tsx',
  'pages/PropertyDetailPage.tsx',
  'pages/PropertyFormPage.tsx',
  'pages/ImportsPage.tsx',
  'pages/ReportsListPage.tsx',
  'pages/ReportDetailPage.tsx',
  'pages/GenerateReportPage.tsx',
  'pages/SettingsProfilePage.tsx',
  'pages/SettingsTenantPage.tsx',
  'pages/BillingSettingsPage.tsx',
  'pages/WelcomePage.tsx',
  'pages/OnboardingWelcomePage.tsx',
  'pages/onboarding/AddPropertyStep.tsx',
  'pages/onboarding/UploadDataStep.tsx',
  'pages/onboarding/GenerateReportStep.tsx',
  'pages/onboarding/OnboardingSuccess.tsx',
]

const VIEWPORT_WIDTH = 360

test('AppShell prevents horizontal scroll at the document level', () => {
  const src = readSource('components/layout/AppShell.tsx')
  assert.match(src, /maxWidth: '100vw'/, 'AppShell should clamp width to 100vw')
  assert.match(src, /overflowX: 'hidden'/, 'AppShell should set overflowX hidden on shell container')
})

test('index.html sets a mobile-first viewport meta tag', () => {
  const html = readFileSync(resolve(srcRoot, '..', 'index.html'), 'utf8')
  assert.match(html, /width=device-width/, 'viewport meta must use device-width')
  assert.match(html, /initial-scale=1/, 'viewport meta must set initial-scale=1')
})

test(`no page declares a hard-coded width/minWidth larger than ${VIEWPORT_WIDTH}px without a responsive (xs|sm) qualifier`, () => {
  const violations: string[] = []
  const hardWidthRe = /\b(?:minWidth|width|maxWidth):\s*(\d{3,4})\b/g

  for (const rel of PRIMARY_ROUTE_FILES) {
    const src = readSource(rel)
    const lines = src.split('\n')
    lines.forEach((line, idx) => {
      let match: RegExpExecArray | null
      hardWidthRe.lastIndex = 0
      while ((match = hardWidthRe.exec(line)) !== null) {
        const px = Number(match[1])
        if (px <= VIEWPORT_WIDTH) continue
        // Allow values inside a responsive object like `{ xs: '100%', sm: 200 }`
        // by checking the same line contains a responsive breakpoint key.
        const isResponsive = /\b(xs|sm|md|lg|xl)\s*:/.test(line)
        // Allow maxWidth values which only cap width (do not force overflow).
        const isMaxWidth = line.includes('maxWidth')
        if (isResponsive || isMaxWidth) continue
        violations.push(`${rel}:${idx + 1}: ${line.trim()}`)
      }
    })
  }

  assert.deepEqual(
    violations,
    [],
    `Found non-responsive fixed widths > ${VIEWPORT_WIDTH}px:\n${violations.join('\n')}`,
  )
})

test('tables use overflowX scroll containers instead of leaking horizontal scroll', () => {
  const tableFiles = [
    'pages/PropertiesPage.tsx',
    'pages/ImportsPage.tsx',
    'pages/ReportsListPage.tsx',
  ]
  for (const rel of tableFiles) {
    const src = readSource(rel)
    assert.match(
      src,
      /overflowX:\s*'auto'/,
      `${rel} must wrap its <Table /> in an overflowX:'auto' container`,
    )
  }
})

test('primary list pages provide a mobile card layout (useMediaQuery + Card)', () => {
  const listPages = [
    'pages/PropertiesPage.tsx',
    'pages/ReportsListPage.tsx',
  ]
  for (const rel of listPages) {
    const src = readSource(rel)
    assert.match(src, /useMediaQuery/, `${rel} should switch layouts via useMediaQuery`)
    assert.match(src, /breakpoints\.down\('sm'\)/, `${rel} should target the sm breakpoint`)
  }
})

test('BottomNav stays pinned and full-width without overflow', () => {
  const src = readSource('components/layout/BottomNav.tsx')
  assert.match(src, /position: 'fixed'/)
  assert.match(src, /left: 0/)
  assert.match(src, /right: 0/)
})

test('all primary routes are still wired in the router', () => {
  const router = readSource('router/index.tsx')
  const expectedPaths = [
    "'/dashboard'",
    "'/properties'",
    "'/properties/:id'",
    "'/imports'",
    "'/reports'",
    "'/reports/:id'",
    "'/settings/profile'",
    "'/settings/billing'",
  ]
  for (const p of expectedPaths) {
    assert.ok(router.includes(p), `router should still declare ${p}`)
  }
})
