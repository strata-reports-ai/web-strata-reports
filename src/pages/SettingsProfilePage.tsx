import { useState, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import LockResetIcon from '@mui/icons-material/LockReset'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import type { RootState } from '../store/store'
import { useForgotPasswordMutation } from '../api/authApi'

function roleLabel(role?: string): string {
  if (!role) return '—'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 2 }} sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div">
        {value}
      </Typography>
    </Stack>
  )
}

const SECTIONS = [
  {
    label: 'Branding',
    description: 'Logo, brand color, and report footer',
    to: '/settings/tenant',
    icon: <PaletteOutlinedIcon />,
  },
  {
    label: 'Team',
    description: 'Invite and manage teammates',
    to: '/settings/users',
    icon: <GroupOutlinedIcon />,
  },
  {
    label: 'Billing',
    description: 'Plan, usage, and payment',
    to: '/settings/billing',
    icon: <CreditCardOutlinedIcon />,
  },
]

export function SettingsProfilePage() {
  const user = useSelector((s: RootState) => s.auth.user)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [toast, setToast] = useState<{ severity: 'success' | 'error'; message: string } | null>(null)

  const handleReset = async () => {
    if (!user?.email) return
    try {
      await forgotPassword({ email: user.email }).unwrap()
      setToast({
        severity: 'success',
        message: `We've sent a password reset link to ${user.email}.`,
      })
    } catch (err) {
      const e = err as { data?: unknown }
      setToast({
        severity: 'error',
        message:
          typeof e?.data === 'string' ? e.data : 'Could not send a reset link. Please try again.',
      })
    }
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Profile
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account
          </Typography>
          <Stack spacing={1.5}>
            <Row label="Name" value={user?.displayName || '—'} />
            <Divider />
            <Row
              label="Email"
              value={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <span>{user?.email ?? '—'}</span>
                  {user?.isEmailVerified ? (
                    <Chip size="small" color="success" icon={<VerifiedIcon />} label="Verified" />
                  ) : (
                    <Chip
                      size="small"
                      color="warning"
                      icon={<ErrorOutlineIcon />}
                      label="Unverified"
                    />
                  )}
                </Stack>
              }
            />
            <Divider />
            <Row label="Role" value={roleLabel(user?.role)} />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We'll email you a secure link to set a new password.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LockResetIcon />}
            onClick={handleReset}
            disabled={isLoading || !user?.email}
            sx={{ minHeight: 44 }}
          >
            {isLoading ? 'Sending…' : 'Send password reset email'}
          </Button>
        </CardContent>
      </Card>

      <Typography
        variant="overline"
        sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
      >
        More settings
      </Typography>
      <Card variant="outlined" sx={{ mt: 1 }}>
        <List disablePadding>
          {SECTIONS.map((s, i) => (
            <Box key={s.to}>
              {i > 0 && <Divider />}
              <ListItemButton component={RouterLink} to={s.to} sx={{ py: 1.5 }}>
                <Box sx={{ color: 'text.secondary', mr: 2, display: 'flex' }}>{s.icon}</Box>
                <ListItemText primary={s.label} secondary={s.description} />
                <NavigateNextIcon sx={{ color: 'text.disabled' }} />
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Card>

      <Snackbar
        open={toast !== null}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}
