import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Snackbar,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { AnalyticsEvent } from '../../services/analytics'
import { track } from '../../services/analytics'

const FEEDBACK_EVENT = 'feedback_submitted' as AnalyticsEvent

const FEEDBACK_MAX_LENGTH = 2000
const FEEDBACK_ENDPOINT = '/api/support/feedback'
const SUPPORT_EMAIL = 'support@strata-reports.dev'

type SubmitState = 'idle' | 'submitting' | 'error' | 'unavailable'

export function FeedbackWidget() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const trimmed = message.trim()
  const submitDisabled = trimmed.length === 0 || state === 'submitting'

  const handleOpen = () => {
    setState('idle')
    setOpen(true)
  }

  const handleClose = () => {
    if (state === 'submitting') return
    setOpen(false)
    setState('idle')
  }

  const handleSubmit = async () => {
    if (submitDisabled) return
    setState('submitting')
    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          currentPath: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      })
      if (response.status === 404) {
        setState('unavailable')
        return
      }
      if (!response.ok) {
        setState('error')
        return
      }
      track(FEEDBACK_EVENT, { messageLength: trimmed.length })
      setMessage('')
      setOpen(false)
      setState('idle')
      setSnackbarOpen(true)
    } catch {
      setState('error')
    }
  }

  const triggerSx = isMobile
    ? {
        position: 'fixed' as const,
        top: 8,
        right: 8,
        zIndex: (t: typeof theme) => t.zIndex.appBar + 2,
        color: 'common.white',
        fontSize: '0.75rem',
        textDecoration: 'underline',
        cursor: 'pointer',
      }
    : {
        position: 'fixed' as const,
        left: 12,
        bottom: 12,
        zIndex: (t: typeof theme) => t.zIndex.drawer + 1,
        fontSize: '0.8rem',
        color: 'text.secondary',
        textDecoration: 'underline',
        cursor: 'pointer',
      }

  return (
    <>
      <Link
        component="button"
        type="button"
        onClick={handleOpen}
        sx={triggerSx}
        aria-label="Send feedback"
      >
        Send feedback
      </Link>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        aria-labelledby="feedback-dialog-title"
      >
        <DialogTitle id="feedback-dialog-title">Send feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 0 }}>
            <TextField
              autoFocus
              required
              multiline
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, FEEDBACK_MAX_LENGTH))}
              placeholder="Tell us what's working or what isn't..."
              inputProps={{ maxLength: FEEDBACK_MAX_LENGTH, 'aria-label': 'Feedback message' }}
              helperText={`${message.length}/${FEEDBACK_MAX_LENGTH}`}
              fullWidth
              disabled={state === 'submitting'}
            />
            {state === 'error' && (
              <Alert severity="error">
                Couldn't send — please try again or email{' '}
                <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>.
              </Alert>
            )}
            {state === 'unavailable' && (
              <Alert severity="warning">Feedback channel temporarily unavailable</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={state === 'submitting'}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitDisabled}
          >
            {state === 'submitting' ? 'Sending…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          Thanks — we'll read every message
        </Alert>
      </Snackbar>
    </>
  )
}
