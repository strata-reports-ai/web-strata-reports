import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useGetMeQuery } from '../api/authApi'
import { setCredentials, clearCredentials } from '../store/authSlice'
import { AppDispatch } from '../store/store'

export function AuthInitialiser() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, isError } = useGetMeQuery()

  useEffect(() => {
    if (data) {
      dispatch(setCredentials(data))
    } else if (isError) {
      dispatch(clearCredentials())
    }
  }, [data, isError, dispatch])

  return null
}
