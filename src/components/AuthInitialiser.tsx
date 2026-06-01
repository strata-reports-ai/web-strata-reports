import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useGetMeQuery } from '../api/authApi'
import { setCredentials, clearCredentials } from '../store/authSlice'
import { AppDispatch } from '../store/store'
import { identify, resetAnalytics } from '../services/analytics'

export function AuthInitialiser() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, isError } = useGetMeQuery()
  const identifiedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
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
