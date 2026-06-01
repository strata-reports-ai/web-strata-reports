import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { track, ANALYTICS_EVENTS } from '../services/analytics'

export function SignUpPage() {
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
        <Typography variant="h5" fontWeight={700} mb={3}>
          Create an account
        </Typography>
        <Stack spacing={2}>
          <TextField label="Full name" type="text" autoComplete="name" />
          <TextField label="Email" type="email" autoComplete="email" />
          <TextField label="Password" type="password" autoComplete="new-password" />
          <Button variant="contained" fullWidth onClick={() => track(ANALYTICS_EVENTS.signup)}>
            Sign up
          </Button>
          <Button variant="text" onClick={() => navigate('/auth/signin')}>
            Already have an account? Sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
