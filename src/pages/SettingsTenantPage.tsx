import { SettingsBrandingPage } from './SettingsBrandingPage'

// Tenant settings are the organisation's branding (logo, brand colour, report
// footer), powered by brandingApi. Reuse the dedicated branding page.
export function SettingsTenantPage() {
  return <SettingsBrandingPage />
}
