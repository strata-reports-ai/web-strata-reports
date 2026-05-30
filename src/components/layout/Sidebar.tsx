import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AssessmentIcon from '@mui/icons-material/Assessment'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import SettingsIcon from '@mui/icons-material/Settings'

export const SIDEBAR_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Properties', icon: <HomeWorkIcon />, path: '/properties' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { label: 'Imports', icon: <UploadFileIcon />, path: '/imports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings/profile' },
]

interface SidebarProps {
  variant: 'permanent' | 'temporary'
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ variant, open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          StrataReport AI
        </Typography>
      </Toolbar>
      <List sx={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const selected =
            item.path === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/'
              : pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path)
                onClose?.()
              }}
              sx={{ minHeight: 48 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' ? true : open}
      onClose={onClose}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {content}
    </Drawer>
  )
}
