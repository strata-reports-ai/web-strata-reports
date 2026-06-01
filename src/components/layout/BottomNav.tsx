import { useNavigate, useLocation } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AssessmentIcon from '@mui/icons-material/Assessment'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import SettingsIcon from '@mui/icons-material/Settings'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Properties', icon: <HomeWorkIcon />, path: '/properties' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { label: 'Imports', icon: <UploadFileIcon />, path: '/imports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings/profile' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeIndex = NAV_ITEMS.findIndex((item) =>
    pathname === item.path || pathname.startsWith(item.path + '/') ||
    (item.path === '/settings/profile' && pathname.startsWith('/settings')),
  )

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
      elevation={3}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_event, index: number) => navigate(NAV_ITEMS[index].path)}
        sx={{ width: '100%' }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            sx={{ minWidth: 0, px: 0.5, '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' } }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
