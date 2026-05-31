import { Box, Typography } from '@mui/material'

export function SettingsProfilePage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5">Profile Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Profile settings coming soon.
      </Typography>
    </Box>
  )
}
