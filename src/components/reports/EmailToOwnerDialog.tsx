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
  Stack,
  TextField,
} from '@mui/material'
import { useEmailReportToOwnerMutation } from '../../api/reportSlice'
import { track, ANALYTICS_EVENTS } from '../../services/analytics'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

const MESSAGE_MAX = 1000

interface EmailToOwnerDialogProps {
  open: boolean
  onClose: () => void
  reportId: string
  propertyName: string
  defaultOwnerEmail?: string | null
  onSent?: (email: string) => void
}

export function EmailToOwnerDialog({
  open,
  onClose,
  reportId,
  propertyName,
  defaultOwnerEmail,
  onSent,
}: EmailToOwnerDialogProps) {
  const defaultSubject = `${propertyName} — Quarterly Report`
  const [toEmail, setToEmail] = useState<string>(defaultOwnerEmail ?? '')
  const [subject, setSubject] = useState<string>(defaultSubject)
  const [message, setMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [emailReportToOwner, { isLoading }] = useEmailReportToOwnerMutation()

  useEffect(() => {
    if (open) {
      setToEmail(defaultOwnerEmail ?? '')
      setSubject(`${propertyName} — Quarterly Report`)
      setMessage('')
      setErrorMessage(null)
    }
  }, [open, defaultOwnerEmail, propertyName])

  const trimmedEmail = toEmail.trim()
  const emailValid = isValidEmail(trimmedEmail)
  const subjectValid = subject.trim().length > 0
  const messageValid = message.length <= MESSAGE_MAX
  const canSend = !isLoading && emailValid && subjectValid && messageValid

  const ownerEmailMissing = !defaultOwnerEmail || defaultOwnerEmail.trim().length === 0

  const handleSend = async () => {
    if (!canSend) return
    setErrorMessage(null)
    try {
      await emailReportToOwner({
        reportId,
        toEmail: trimmedEmail,
        subject: subject.trim(),
        message: message.trim() || undefined,
      }).unwrap()
      track(ANALYTICS_EVENTS.report_email_sent, { reportId })
      onSent?.(trimmedEmail)
      onClose()
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number
        data?: { detail?: string; error_message?: string }
      }
      const detail =
        apiErr?.data?.detail ??
        apiErr?.data?.error_message ??
        'Failed to send email. Please try again.'
      setErrorMessage(detail)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="email-to-owner-title"
    >
      <DialogTitle id="email-to-owner-title">Email report to owner</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 0 }}>
          {ownerEmailMissing && (
            <Alert severity="warning">
              No owner email is on file for this property. Enter an address below to send the
              report.
            </Alert>
          )}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Owner email"
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            fullWidth
            required
            error={toEmail.length > 0 && !emailValid}
            helperText={
              toEmail.length > 0 && !emailValid ? 'Enter a valid email address' : ' '
            }
            disabled={isLoading}
            inputProps={{ 'aria-label': 'Owner email' }}
          />
          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
            error={!subjectValid}
            disabled={isLoading}
          />
          <TextField
            label="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            inputProps={{ maxLength: MESSAGE_MAX }}
            helperText={`${message.length}/${MESSAGE_MAX}`}
            error={!messageValid}
            disabled={isLoading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading} sx={{ minHeight: 44 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!canSend}
          sx={{ minHeight: 44, minWidth: 44 }}
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          <Box component="span">{isLoading ? 'Sending…' : 'Send'}</Box>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
