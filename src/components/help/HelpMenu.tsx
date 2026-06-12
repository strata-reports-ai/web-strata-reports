import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { useNavigate } from 'react-router-dom'

interface HelpMenuProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
}

export function HelpMenu({ open, anchorEl, onClose }: HelpMenuProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const helpCenterUrl = import.meta.env.VITE_HELP_CENTER_URL ?? ''

  const content = (
    <List sx={{ minWidth: 240, py: 1 }}>
      {helpCenterUrl && (
        <ListItem disablePadding>
          <ListItemButton
            component="a"
            href={helpCenterUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            sx={{ minHeight: 44 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <OpenInNewIcon />
            </ListItemIcon>
            <ListItemText primary="Help center" />
          </ListItemButton>
        </ListItem>
      )}
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            navigate('/help/contact-support')
            onClose()
          }}
          sx={{ minHeight: 44 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <MailOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Contact support" />
        </ListItemButton>
      </ListItem>
    </List>
  )

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { borderTopLeftRadius: 12, borderTopRightRadius: 12 } }}
      >
        {content}
      </Drawer>
    )
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      {content}
    </Popover>
  )
}
