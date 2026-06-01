import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function ForgotPasswordPage() {
  const navigate = useNavigate()

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
        <Typography variant="h5" fontWeight={700} mb={1}>
          Forgot password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your email and we'll send you a reset link.
        </Typography>
        <Stack spacing={2}>
          <TextField label="Email" type="email" autoComplete="email" />
          <Button variant="contained" fullWidth>
            Send reset link
          </Button>
          <Button variant="text" onClick={() => navigate('/auth/signin')}>
            Back to sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
