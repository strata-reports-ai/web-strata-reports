import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CreditCardIcon from '@mui/icons-material/CreditCard'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Properties', icon: <HomeWorkIcon />, path: '/properties' },
  { label: 'Imports', icon: <UploadFileIcon />, path: '/imports' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
]

const DESKTOP_NAV_ITEMS = [
  ...NAV_ITEMS,
  { label: 'Billing', icon: <CreditCardIcon />, path: '/settings/billing' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path),
  )

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky">
          <Toolbar variant="dense">
            <Typography variant="h6" component="div">
              StrataReport AI
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, pb: '56px' }}>{children}</Box>
        <BottomNavigation
          value={activeIndex}
          onChange={(_, index) => navigate(NAV_ITEMS[index].path)}
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{ width: 220, flexShrink: 0, '& .MuiDrawer-paper': { width: 220, boxSizing: 'border-box' } }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Toolbar>
          <Typography variant="subtitle1" fontWeight={700}>
            StrataReport AI
          </Typography>
        </Toolbar>
        <List>
          {DESKTOP_NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.path}
              selected={pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Box>
  )
}
