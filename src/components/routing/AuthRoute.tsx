import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { RootState } from '../../store/store'
import { Box, CircularProgress } from '@mui/material'

export function AuthRoute() {
  const { isAuthenticated, initialised } = useSelector((state: RootState) => state.auth)

  if (!initialised) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
