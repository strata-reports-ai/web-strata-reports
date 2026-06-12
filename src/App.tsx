import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppShell } from './components/layout/AppShell'
import { TrialBanner } from './components/TrialBanner'
import { DemoBanner } from './components/DemoBanner'
import { DemoTour } from './demo/DemoTour'
import { LegalFooter } from './components/layout/LegalFooter'

export function App() {
  return (
    <AppShell>
      <DemoBanner />
      <TrialBanner />
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
      <LegalFooter />
      <DemoTour />
    </AppShell>
  )
}
