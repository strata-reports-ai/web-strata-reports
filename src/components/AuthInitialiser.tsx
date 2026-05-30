import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useGetMeQuery } from '../api/authApi'
import { setCredentials, clearCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

interface AuthInitialiserProps {
  children: React.ReactNode
}

export function AuthInitialiser({ children }: AuthInitialiserProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { data, isError, isSuccess } = useGetMeQuery()

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCredentials(data.user))
    } else if (isError) {
      dispatch(clearCredentials())
    }
  }, [isSuccess, isError, data, dispatch])

  return <>{children}</>
}
