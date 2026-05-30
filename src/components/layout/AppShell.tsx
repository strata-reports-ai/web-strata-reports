import { useState } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Box component="main" sx={{ flex: 1, pb: '56px' }}>
          {children}
        </Box>
        <BottomNav />
      </Box>
    )
  }

  if (isTablet) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <Sidebar variant="temporary" open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    )
  }

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Sidebar variant="permanent" />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            ml: `${SIDEBAR_WIDTH}px`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
