import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useGetMeQuery } from '../api/authApi'
import { setCredentials, clearCredentials } from '../store/authSlice'
import { AppDispatch } from '../store/store'
import { identify, resetAnalytics } from '../services/analytics'
import { isDemo, DEMO_USER } from '../demo/demoMode'

export function AuthInitialiser() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, isError } = useGetMeQuery(undefined, { skip: isDemo() })
  const identifiedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    // In demo mode, (re)establish the fake demo user on every load. DemoEntryPage
    // sets it on initial entry, but a refresh or deep-link to a protected route
    // remounts with empty auth state — without this, `initialised` never flips true
    // and ProtectedRoute renders nothing, leaving a blank page.
    if (isDemo()) {
      dispatch(setCredentials(DEMO_USER))
      return
    }
    if (data) {
      dispatch(setCredentials(data))
      if (identifiedUserIdRef.current !== data.id) {
        const tenantId = (data as { tenantId?: string | null }).tenantId ?? null
        const emailDomain = data.email?.includes('@')
          ? data.email.split('@')[1] ?? null
          : null
        identify(data.id, { tenant_id: tenantId, email_domain: emailDomain })
        identifiedUserIdRef.current = data.id
      }
    } else if (isError) {
      dispatch(clearCredentials())
      if (identifiedUserIdRef.current !== null) {
        resetAnalytics()
        identifiedUserIdRef.current = null
      }
    }
  }, [data, isError, dispatch])

  return null
}
