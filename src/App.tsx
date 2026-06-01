import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppShell } from './components/layout/AppShell'
import { TrialBanner } from './components/TrialBanner'

export function App() {
  return (
    <AppShell>
      <TrialBanner />
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </AppShell>
  )
}
