import { Navigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import { isDemo } from '../demo/demoMode'

export function SettingsTenantPage() {
  // Placeholder page — in the demo, route to the populated Billing page
  // rather than showing a "coming soon" screen.
  if (isDemo()) return <Navigate to="/settings/billing" replace />

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5">Tenant Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Tenant settings coming soon.
      </Typography>
    </Box>
  )
}
