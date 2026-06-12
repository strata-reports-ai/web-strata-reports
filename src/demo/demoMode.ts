import type { AuthUser } from '../api/authApi'

const DEMO_KEY = 'stayrecap_demo'

/** The fake user used throughout demo mode. Shared by DemoEntryPage (initial
 * entry) and AuthInitialiser (restored on refresh/deep-link). */
export const DEMO_USER: AuthUser = {
  id: 'demo-user',
  email: 'demo@stayrecap.app',
  displayName: 'Demo User',
  role: 'owner',
  isEmailVerified: true,
}

export function enterDemo(): void {
  try {
    sessionStorage.setItem(DEMO_KEY, '1')
  } catch {
    // ignore storage errors
  }
}

export function exitDemo(): void {
  try {
    sessionStorage.removeItem(DEMO_KEY)
  } catch {
    // ignore storage errors
  }
}

export function isDemo(): boolean {
  try {
    return sessionStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}
