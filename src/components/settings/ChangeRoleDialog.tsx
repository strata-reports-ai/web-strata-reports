import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import {
  useUpdateUserRoleMutation,
  type TenantUser,
  type UserRole,
} from '../../api/usersApi'

interface ChangeRoleDialogProps {
  open: boolean
  user: TenantUser | null
  onClose: () => void
  onSuccess?: (user: TenantUser, role: UserRole) => void
}

const ROLE_OPTIONS: UserRole[] = ['owner', 'admin', 'member']

function roleLabel(role: UserRole): string {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  return 'Member'
}

export function ChangeRoleDialog({ open, user, onClose, onSuccess }: ChangeRoleDialogProps) {
  const [role, setRole] = useState<UserRole>('member')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [updateUserRole, { isLoading }] = useUpdateUserRoleMutation()

  useEffect(() => {
    if (open && user) {
      setRole(user.role)
      setErrorMessage(null)
    }
  }, [open, user])

  const handleSave = async () => {
    if (!user) return
    setErrorMessage(null)
    try {
      await updateUserRole({ id: user.id, role }).unwrap()
      onSuccess?.(user, role)
      onClose()
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number
        data?: { detail?: string; error_message?: string }
      }
      const detail =
        apiErr?.data?.detail ??
        apiErr?.data?.error_message ??
        'Failed to update role. Please try again.'
      setErrorMessage(detail)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  const targetName = user?.displayName || user?.email || ''

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="change-role-title"
    >
      <DialogTitle id="change-role-title">Change role</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 0 }}>
          {targetName && (
            <Typography variant="body2" color="text.secondary">
              Update role for <strong>{targetName}</strong>
            </Typography>
          )}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <FormControl fullWidth>
            <InputLabel id="change-role-select-label">Role</InputLabel>
            <Select
              labelId="change-role-select-label"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isLoading}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {roleLabel(r)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading} sx={{ minHeight: 44 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || !user || role === user.role}
          sx={{ minHeight: 44, minWidth: 44 }}
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          <Box component="span">{isLoading ? 'Saving…' : 'Save'}</Box>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
