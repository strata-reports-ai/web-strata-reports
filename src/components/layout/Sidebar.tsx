import { useState, useRef } from 'react'
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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { HelpMenu } from '../help/HelpMenu'

const SIDEBAR_WIDTH = 220

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Properties', icon: <HomeWorkIcon />, path: '/properties' },
  { label: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { label: 'Imports', icon: <UploadFileIcon />, path: '/imports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings/profile' },
]

interface SidebarProps {
  variant: 'permanent' | 'temporary'
  open: boolean
  onClose: () => void
}

export function Sidebar({ variant, open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const helpButtonRef = useRef<HTMLDivElement | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  const isSelected = (path: string) => {
    if (path === '/settings/profile') return pathname.startsWith('/settings')
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
              <Box ref={helpButtonRef}>
                <ListItemButton
                  onClick={() => setHelpOpen(true)}
                  sx={{ minHeight: 44 }}
                  aria-label="Open help menu"
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <HelpOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Help" />
                </ListItemButton>
              </Box>
            )}
          </Box>
        ))}
      </List>
      <HelpMenu
        open={helpOpen}
        anchorEl={helpButtonRef.current}
        onClose={() => setHelpOpen(false)}
      />
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
