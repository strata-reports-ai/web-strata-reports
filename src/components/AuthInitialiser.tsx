import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { CircularProgress, Box } from '@mui/material'
import { useGetMeQuery } from '../api/authApi'
import { setCredentials, clearCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

interface AuthInitialiserProps {
  children: React.ReactNode
}

export function AuthInitialiser({ children }: AuthInitialiserProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { data, isLoading, isError, isSuccess } = useGetMeQuery()

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCredentials({ user: data.user }))
    } else if (isError) {
      dispatch(clearCredentials())
    }
  }, [isSuccess, isError, data, dispatch])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}
