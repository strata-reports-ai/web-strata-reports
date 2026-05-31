import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppShell } from './components/layout/AppShell'

export function App() {
  return (
    <AppShell>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </AppShell>
  )
}
