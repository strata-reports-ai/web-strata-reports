const DEMO_KEY = 'stayrecap_demo'

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
