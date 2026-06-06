import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import type { RootState } from '../../store/store'
import {
  useDeactivateUserMutation,
  useListUsersQuery,
  type TenantUser,
  type UserRole,
} from '../../api/usersApi'
import { ChangeRoleDialog } from '../../components/settings/ChangeRoleDialog'

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

function roleLabel(role: UserRole): string {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  return 'Member'
}

function roleChipColor(role: UserRole): 'primary' | 'secondary' | 'default' {
  if (role === 'owner') return 'primary'
  if (role === 'admin') return 'secondary'
  return 'default'
}

interface RoleChipProps {
  role: UserRole
}

function RoleChip({ role }: RoleChipProps) {
  return (
    <Chip
      label={roleLabel(role)}
      color={roleChipColor(role)}
      size="small"
      variant={role === 'member' ? 'outlined' : 'filled'}
    />
  )
}

export function UsersPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const currentUserId = currentUser?.id ?? null

  const { data, isLoading, isError, refetch, isFetching } = useListUsersQuery()
  const [deactivateUserMutation, { isLoading: isDeactivating }] = useDeactivateUserMutation()

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuUser, setMenuUser] = useState<TenantUser | null>(null)
  const [changeRoleOpen, setChangeRoleOpen] = useState(false)
  const [changeRoleUser, setChangeRoleUser] = useState<TenantUser | null>(null)
  const [deactivateUser, setDeactivateUser] = useState<TenantUser | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, user: TenantUser) => {
    setMenuAnchor(event.currentTarget)
    setMenuUser(user)
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
    setMenuUser(null)
  }

  const handleChangeRole = () => {
    if (!menuUser) return
    setChangeRoleUser(menuUser)
    setChangeRoleOpen(true)
    handleCloseMenu()
  }

  const handleDeactivate = () => {
    if (!menuUser) return
    setDeactivateUser(menuUser)
    setDeactivateError(null)
    handleCloseMenu()
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivateUser) return
    setDeactivateError(null)
    try {
      await deactivateUserMutation(deactivateUser.id).unwrap()
      setSnackbarMessage(
        `${deactivateUser.displayName || deactivateUser.email} has been deactivated`,
      )
      setDeactivateUser(null)
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number
        data?: { detail?: string; error_message?: string }
      }
      setDeactivateError(
        apiErr?.data?.detail ??
          apiErr?.data?.error_message ??
          'Failed to deactivate user. Please try again.',
      )
    }
  }

  const handleCloseDeactivate = () => {
    if (isDeactivating) return
    setDeactivateUser(null)
    setDeactivateError(null)
  }

  const handleChangeRoleClose = () => {
    setChangeRoleOpen(false)
    setChangeRoleUser(null)
  }

  const handleChangeRoleSuccess = (user: TenantUser, role: UserRole) => {
    setSnackbarMessage(
      `${user.displayName || user.email}'s role updated to ${roleLabel(role)}`,
    )
  }

  const items = data?.items ?? []
  const showLoading = isLoading || (isFetching && items.length === 0)

  const isSelf = (u: TenantUser) => u.id === currentUserId

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', overflowX: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Team
      </Typography>

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          We couldn't load your team right now.
        </Alert>
      )}

      {showLoading && !isError && (
        <>
          {isMobile ? (
            <Stack spacing={1.5}>
              {[0, 1, 2].map((i) => (
                <Card key={i} variant="outlined">
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="50%" />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Display Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[0, 1, 2].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton variant="text" width={120} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={180} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="rounded" width={70} height={24} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={140} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="circular" width={24} height={24} sx={{ ml: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      )}

      {!showLoading && !isError && items.length === 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              No other users yet — invite teammates from the{' '}
              <Button
                variant="text"
                size="small"
                sx={{ p: 0, minWidth: 0, textTransform: 'none', verticalAlign: 'baseline' }}
                onClick={() => navigate('/settings/team')}
              >
                Invitations page
              </Button>
            </Typography>
          </CardContent>
        </Card>
      )}

      {!showLoading && !isError && items.length > 0 && isMobile && (
        <Stack spacing={1.5}>
          {items.map((u) => (
            <Card key={u.id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {u.displayName || '—'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {u.email}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <RoleChip role={u.role} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Last login: {formatDateTime(u.lastLoginAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={`Actions for ${u.displayName || u.email}`}
                    onClick={(e) => handleOpenMenu(e, u)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {!showLoading && !isError && items.length > 0 && !isMobile && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Display Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ wordBreak: 'break-word' }}>
                    {u.displayName || '—'}
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{u.email}</TableCell>
                  <TableCell>
                    <RoleChip role={u.role} />
                  </TableCell>
                  <TableCell>{formatDateTime(u.lastLoginAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label={`Actions for ${u.displayName || u.email}`}
                      onClick={(e) => handleOpenMenu(e, u)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleChangeRole}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change role</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeactivate}
          disabled={menuUser ? isSelf(menuUser) : false}
        >
          <ListItemIcon>
            <PersonOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
      </Menu>

      <ChangeRoleDialog
        open={changeRoleOpen}
        user={changeRoleUser}
        onClose={handleChangeRoleClose}
        onSuccess={handleChangeRoleSuccess}
      />

      <Dialog
        open={Boolean(deactivateUser)}
        onClose={handleCloseDeactivate}
        maxWidth="xs"
        fullWidth
        aria-labelledby="deactivate-user-title"
      >
        <DialogTitle id="deactivate-user-title">Deactivate user?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 0 }}>
            {deactivateError && <Alert severity="error">{deactivateError}</Alert>}
            <Typography variant="body2">
              Are you sure you want to deactivate{' '}
              <strong>{deactivateUser?.displayName || deactivateUser?.email}</strong>? They
              will no longer be able to sign in.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeactivate}
            disabled={isDeactivating}
            sx={{ minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeactivate}
            variant="contained"
            color="error"
            disabled={isDeactivating}
            sx={{ minHeight: 44, minWidth: 44 }}
            startIcon={
              isDeactivating ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {isDeactivating ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

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
