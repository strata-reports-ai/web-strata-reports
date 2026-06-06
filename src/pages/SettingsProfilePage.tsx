import { Link as RouterLink } from 'react-router-dom'
import { Box, Link, Stack, Typography } from '@mui/material'

export function SettingsProfilePage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5">Profile Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Profile settings coming soon.
      </Typography>
      <Stack spacing={1} sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/settings/team" underline="hover">
          Manage team members
        </Link>
        <Link component={RouterLink} to="/settings/billing" underline="hover">
          Billing
        </Link>
      </Stack>
    </Box>
  )
}
