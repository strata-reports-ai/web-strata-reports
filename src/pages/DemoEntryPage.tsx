import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, CircularProgress } from '@mui/material'
import { enterDemo, DEMO_USER } from '../demo/demoMode'
import { setCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

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
