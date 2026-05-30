import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsInitialised } from '../../store/authSlice'
import { CircularProgress, Box } from '@mui/material'

export function ProtectedRoute() {
  const isInitialised = useSelector(selectIsInitialised)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isInitialised) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/signin" replace />
}
