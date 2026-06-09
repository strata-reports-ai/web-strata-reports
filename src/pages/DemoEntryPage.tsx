import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, CircularProgress } from '@mui/material'
import { enterDemo } from '../demo/demoMode'
import { setCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@stayrecap.app',
  displayName: 'Demo User',
  role: 'owner',
  isEmailVerified: true,
}

export function DemoEntryPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    enterDemo()
    dispatch(setCredentials(DEMO_USER))
    navigate('/dashboard', { replace: true })
  }, [dispatch, navigate])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  )
}
