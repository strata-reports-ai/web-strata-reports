import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

interface TopBarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function TopBar({ onMenuClick, showMenuButton }: TopBarProps) {
  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant="dense">
        {showMenuButton && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open navigation"
            onClick={onMenuClick}
            sx={{ mr: 1, minWidth: 48, minHeight: 48 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1 }}>
          StayRecap
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
