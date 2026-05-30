import { Box, Typography } from '@mui/material'

export function ResetPasswordPage() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>Reset password</Typography>
        <Typography variant="body2" color="text.secondary">Reset password coming soon.</Typography>
      </Box>
    </Box>
  )
}
