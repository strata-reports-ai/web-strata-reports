import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { RootState } from '../../store/store'
import { LandingPage } from '../../pages/LandingPage'

/**
 * Root route ("/"): unauthenticated visitors see the public landing page;
 * authenticated users are sent straight to their dashboard.
 */
export function RootRoute() {
  const { user, initialised } = useSelector((state: RootState) => state.auth)

  if (!initialised) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (user !== null) {
    return <Navigate to="/dashboard" replace />
  }

  return <LandingPage />
}
