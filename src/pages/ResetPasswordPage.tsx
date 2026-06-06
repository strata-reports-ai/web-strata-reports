import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPasswordMutation } from '../api/authApi'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!token) {
      setErrorMessage('Missing or invalid reset token. Please request a new password reset link.')
      return
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      await resetPassword({ token, newPassword }).unwrap()
      setSuccess(true)
      setTimeout(() => navigate('/auth/signin'), 2000)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 400) {
        setErrorMessage('Your reset link is invalid or has expired. Please request a new one.')
      } else {
        setErrorMessage('Something went wrong. Please try again.')
      }
    }
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
          Reset password
        </Typography>
        <Stack spacing={2}>
          {success ? (
            <Alert severity="success">
              Your password has been reset. Redirecting to sign in…
            </Alert>
          ) : (
            <>
              <TextField
                label="New password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Reset password'}
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
