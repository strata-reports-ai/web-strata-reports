import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useLoginMutation, authApi } from '../api/authApi'
import { propertiesApi } from '../api/propertiesApi'
import { setCredentials } from '../store/authSlice'
import { AppDispatch } from '../store/store'
import { track, ANALYTICS_EVENTS } from '../services/analytics'

export function SignInPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [login, { isLoading, error }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sessionError, setSessionError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSessionError(null)
    const result = await login({ email, password }).unwrap().catch(() => null)
    if (!result) return
    const meResult = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
    if (!meResult.data) {
      setSessionError('Sign-in succeeded but we could not load your profile. Please try again.')
      return
    }
    dispatch(setCredentials(meResult.data))
    track(ANALYTICS_EVENTS.login)
    const propsResult = await dispatch(
      propertiesApi.endpoints.getProperties.initiate({ page: 1, pageSize: 1 }, { forceRefetch: true }),
    )
    if (propsResult.data && propsResult.data.totalCount === 0) {
      navigate('/onboarding/welcome')
      return
    }
    const safePath =
      result.redirectTo?.startsWith('/') && !result.redirectTo.startsWith('//')
        ? result.redirectTo
        : '/'
    navigate(safePath)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Sign in to StrataReport AI
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
          {error && (
            <Typography color="error" variant="body2">
              Invalid email or password.
            </Typography>
          )}
          {sessionError && (
            <Typography color="error" variant="body2">
              {sessionError}
            </Typography>
          )}
          <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
            {isLoading ? <CircularProgress size={24} /> : 'Sign in'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
