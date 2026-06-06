import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import type { RootState } from '../store/store'
import {
  useInviteUserMutation,
  useGetPendingInvitationsQuery,
  type InvitationRole,
  type PendingInvitation,
} from '../api/usersApi'
import { track, ANALYTICS_EVENTS } from '../services/analytics'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

function roleLabel(role: InvitationRole): string {
  return role === 'admin' ? 'Admin' : 'Member'
}

interface InvitationCardProps {
  invitation: PendingInvitation
}

function InvitationCard({ invitation }: InvitationCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
          {invitation.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Role: {roleLabel(invitation.role)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Invited: {formatDateTime(invitation.invitedAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Expires: {formatDateTime(invitation.expiresAt)}
        </Typography>
      </CardContent>
    </Card>
  )
}

interface ErrorShape {
  status?: number
  data?: {
    detail?: string
    title?: string
    code?: string
  }
}

function extractErrorCode(err: ErrorShape): string {
  return err.data?.code ?? (err.status ? `http_${err.status}` : 'unknown')
}

export function TeamSettingsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const user = useSelector((state: RootState) => state.auth.user)
  const isOwner = user?.role === 'owner'

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitationRole>('member')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

  const [inviteUser, { isLoading: isInviting }] = useInviteUserMutation()
  const {
    data: pendingData,
    isLoading: isLoadingPending,
    isError: isPendingError,
    refetch: refetchPending,
  } = useGetPendingInvitationsQuery(undefined, { skip: !isOwner })

  useEffect(() => {
    if (isOwner) {
      track(ANALYTICS_EVENTS.team_invite_form_viewed)
    }
  }, [isOwner])

  if (!isOwner) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', overflowX: 'hidden' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Team
        </Typography>
        <Alert severity="info">
          Only the tenant owner can manage team members
        </Alert>
      </Box>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setFormError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setEmailError('Email is required')
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    try {
      await inviteUser({ email: trimmedEmail, role }).unwrap()
      track(ANALYTICS_EVENTS.team_invite_submitted, { role })
      setSnackbarMessage(`Invitation sent to ${trimmedEmail}`)
      setEmail('')
      setRole('member')
      refetchPending()
    } catch (err) {
      const error = err as ErrorShape
      track(ANALYTICS_EVENTS.team_invite_failed, { error_code: extractErrorCode(error) })
      if (error.status === 409 && error.data?.code === 'user_already_member') {
        setEmailError('This person is already on your team')
        return
      }
      if (error.status && error.status >= 400 && error.status < 500) {
        setFormError(error.data?.detail ?? 'Unable to send invitation. Please try again.')
        return
      }
      setFormError('Something went wrong. Please try again.')
    }
  }

  const pendingItems = pendingData?.items ?? []

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', overflowX: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Team
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Invite a user
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                error={Boolean(emailError)}
                helperText={emailError ?? ' '}
                autoComplete="email"
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                <InputLabel id="invite-role-label">Role</InputLabel>
                <Select
                  labelId="invite-role-label"
                  label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as InvitationRole)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" justifyContent={{ xs: 'stretch', sm: 'flex-end' }} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isInviting}
                startIcon={
                  isInviting ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />
                }
                sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' } }}
              >
                Send invitation
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Pending invitations
      </Typography>

      {isLoadingPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoadingPending && isPendingError && (
        <Alert severity="warning">
          We couldn't load pending invitations right now.
        </Alert>
      )}

      {!isLoadingPending && !isPendingError && pendingItems.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              No pending invitations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the form above to invite someone to your team.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!isLoadingPending && !isPendingError && pendingItems.length > 0 && isMobile && (
        <Box>
          {pendingItems.map((inv) => (
            <InvitationCard key={inv.id} invitation={inv} />
          ))}
        </Box>
      )}

      {!isLoadingPending && !isPendingError && pendingItems.length > 0 && !isMobile && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Invited At</TableCell>
                <TableCell>Expires At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingItems.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{inv.email}</TableCell>
                  <TableCell>{roleLabel(inv.role)}</TableCell>
                  <TableCell>{formatDateTime(inv.invitedAt)}</TableCell>
                  <TableCell>{formatDateTime(inv.expiresAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbarMessage(null)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
