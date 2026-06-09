import { useState } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Link, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { track, ANALYTICS_EVENTS } from '../services/analytics'
import { LegalFooter } from '../components/layout/LegalFooter'
import { exitDemo } from '../demo/demoMode'
import { clearCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

export function SignUpPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [agreed, setAgreed] = useState(false)

  const handleSignUp = () => {
    exitDemo()
    dispatch(clearCredentials())
    track(ANALYTICS_EVENTS.signup)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Create an account
          </Typography>
          <Stack spacing={2}>
            <TextField label="Full name" type="text" autoComplete="name" />
            <TextField label="Email" type="email" autoComplete="email" />
            <TextField label="Password" type="password" autoComplete="new-password" />
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onChange={(_event, checked) => setAgreed(checked)}
                  inputProps={{ 'aria-label': 'Agree to Terms of Service and Privacy Policy' }}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link component={RouterLink} to="/legal/terms" underline="hover">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/legal/privacy" underline="hover">
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
            <Button
              variant="contained"
              fullWidth
              disabled={!agreed}
              onClick={handleSignUp}
            >
              Sign up
            </Button>
            <Button variant="text" onClick={() => navigate('/auth/signin')}>
              Already have an account? Sign in
            </Button>
          </Stack>
        </Box>
      </Box>
      <LegalFooter />
    </Box>
  )
}
