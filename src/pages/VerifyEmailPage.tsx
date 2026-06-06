import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVerifyEmailMutation } from '../api/authApi'

type Status = 'pending' | 'success' | 'error'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [verifyEmail] = useVerifyEmailMutation()
  const [status, setStatus] = useState<Status>('pending')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Missing verification token. Please use the link from your verification email.')
      return
    }
    let cancelled = false
    verifyEmail({ token })
      .unwrap()
      .then(() => {
        if (!cancelled) setStatus('success')
      })
      .catch((err: { status?: number }) => {
        if (cancelled) return
        setStatus('error')
        if (err.status === 400) {
          setErrorMessage('Your verification link is invalid or has expired.')
        } else {
          setErrorMessage('Something went wrong verifying your email. Please try again.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, verifyEmail])

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
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Verify email
        </Typography>
        <Stack spacing={2}>
          {status === 'pending' && (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Verifying your email…
              </Typography>
            </Stack>
          )}
          {status === 'success' && (
            <>
              <Alert severity="success">
                Your email has been verified. You can now sign in to your account.
              </Alert>
              <Button variant="contained" fullWidth onClick={() => navigate('/auth/signin')}>
                Go to sign in
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <Alert severity="error">{errorMessage}</Alert>
              <Button variant="contained" fullWidth onClick={() => navigate('/auth/signin')}>
                Back to sign in
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
