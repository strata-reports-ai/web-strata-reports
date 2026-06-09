import { useState } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { FeedbackWidget } from '../feedback/FeedbackWidget'

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery('(min-width:600px) and (max-width:1023px)')
  const isDesktop = useMediaQuery('(min-width:1024px)')
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
        <TopBar />
        <Box component="main" sx={{ flex: 1, pb: '56px', minWidth: 0 }}>
          {children}
        </Box>
        <BottomNav />
        <FeedbackWidget />
      </Box>
    )
  }

  if (isTablet) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Sidebar variant="temporary" open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar showMenuButton onMenuClick={() => setDrawerOpen(true)} />
          <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
            {children}
          </Box>
        </Box>
        <FeedbackWidget />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
      {isDesktop && <Sidebar variant="permanent" open onClose={() => {}} />}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          {children}
        </Box>
      </Box>
      <FeedbackWidget />
    </Box>
  )
}
