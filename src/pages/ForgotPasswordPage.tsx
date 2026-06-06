import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useForgotPasswordMutation } from '../api/authApi'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await forgotPassword({ email }).unwrap()
    } catch {
      // Intentionally swallow errors to avoid leaking account existence.
    }
    setSubmitted(true)
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
        <Typography variant="h5" fontWeight={700} mb={1}>
          Forgot password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your email and we'll send you a reset link.
        </Typography>
        <Stack spacing={2}>
          {submitted ? (
            <Alert severity="success">
              If an account exists for {email}, we've sent a password reset link. Please check your inbox.
            </Alert>
          ) : (
            <>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Send reset link'}
              </Button>
            </>
          )}
          <Button variant="text" onClick={() => navigate('/auth/signin')}>
            Back to sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
