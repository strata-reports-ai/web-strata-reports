import { Link as RouterLink, Navigate } from 'react-router-dom'
import { Box, Link, Stack, Typography } from '@mui/material'
import { isDemo } from '../demo/demoMode'

export function SettingsProfilePage() {
  // This page is still a placeholder; in the demo, send visitors to the
  // populated Billing page instead of a "coming soon" screen.
  if (isDemo()) return <Navigate to="/settings/billing" replace />

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
