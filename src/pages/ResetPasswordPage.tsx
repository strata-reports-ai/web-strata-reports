import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function ResetPasswordPage() {
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
          Reset password
        </Typography>
        <Stack spacing={2}>
          <TextField label="New password" type="password" autoComplete="new-password" />
          <TextField label="Confirm new password" type="password" autoComplete="new-password" />
          <Button variant="contained" fullWidth>
            Reset password
          </Button>
          <Button variant="text" onClick={() => navigate('/auth/signin')}>
            Back to sign in
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
