import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
import GroupIcon from '@mui/icons-material/Group'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import type { RootState } from '../../store/store'

const SIDEBAR_WIDTH = 220

const SUPPORT_EMAIL = 'support@stratareport.ai'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Properties', icon: <HomeWorkIcon />, path: '/properties' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { label: 'Imports', icon: <UploadFileIcon />, path: '/imports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings/profile' },
  { label: 'Team', icon: <GroupIcon />, path: '/settings/users' },
]

interface SidebarProps {
  variant: 'permanent' | 'temporary'
  open: boolean
  onClose: () => void
}

function buildMailto(tenantId: string | null): string {
  if (tenantId) {
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `Support request [tenant:${tenantId}]`,
    )}`
  }
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Support request')}`
}

export function Sidebar({ variant, open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useSelector((state: RootState) => state.auth.user)
  const tenantId = user?.id ?? null
  const mailtoHref = buildMailto(tenantId)

  const isSelected = (path: string) => {
    if (path === '/settings/users') {
      return pathname === '/settings/users' || pathname.startsWith('/settings/users/')
    }
    if (path === '/settings/profile') {
      return (
        pathname.startsWith('/settings') &&
        !(pathname === '/settings/users' || pathname.startsWith('/settings/users/'))
      )
    }
    if (path === '/help') return pathname === '/help' || pathname.startsWith('/help/')
    return pathname === path || pathname.startsWith(path + '/')
  }

  const reportsIndex = NAV_ITEMS.findIndex((item) => item.path === '/reports')

  const drawerContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, overflowX: 'hidden' }}>
      <Toolbar>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          StrataReport AI
        </Typography>
      </Toolbar>
      <List>
        {NAV_ITEMS.map((item, index) => (
          <Box key={item.path}>
            <ListItemButton
              selected={isSelected(item.path)}
              onClick={() => {
                navigate(item.path)
                if (variant === 'temporary') onClose()
              }}
              sx={{ minHeight: 44 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
            {index === reportsIndex && (
              <>
                <ListItemButton
                  selected={isSelected('/help')}
                  onClick={() => {
                    navigate('/help')
                    if (variant === 'temporary') onClose()
                  }}
                  sx={{ minHeight: 44 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <HelpOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Help" />
                </ListItemButton>
                <ListItemButton
                  component="a"
                  href={mailtoHref}
                  sx={{ minHeight: 44 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <MailOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Contact support" />
                </ListItemButton>
              </>
            )}
          </Box>
        ))}
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
      {drawerContent}
    </Drawer>
  )
}
