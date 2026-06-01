import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  useMarkReportSentMutation,
  type SentToOwnerChannel,
} from '../api/reportSlice'

const NOTE_MAX = 500

interface MarkAsSentDialogProps {
  open: boolean
  reportId: string
  force?: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MarkAsSentDialog({
  open,
  reportId,
  force,
  onClose,
  onSuccess,
}: MarkAsSentDialogProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [channel, setChannel] = useState<SentToOwnerChannel | ''>('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [markSent, { isLoading }] = useMarkReportSentMutation()

  useEffect(() => {
    if (open) {
      setChannel('')
      setNote('')
      setError(null)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!channel) {
      setError('Please choose a channel.')
      return
    }
    if (note.length > NOTE_MAX) {
      setError(`Notes must be ${NOTE_MAX} characters or fewer.`)
      return
    }
    try {
      await markSent({
        reportId,
        channel,
        note: note.trim() ? note.trim() : undefined,
        force,
      }).unwrap()
      onSuccess()
      onClose()
    } catch {
      setError('Failed to mark as sent. Please try again.')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>Mark as sent to owner</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <FormControl required sx={{ mb: 2, display: 'block' }}>
          <FormLabel id="mark-sent-channel-label">Channel</FormLabel>
          <RadioGroup
            aria-labelledby="mark-sent-channel-label"
            value={channel}
            onChange={(_event, value) => setChannel(value as SentToOwnerChannel)}
          >
            <FormControlLabel value="email" control={<Radio />} label="Email" />
            <FormControlLabel
              value="download"
              control={<Radio />}
              label="Direct download link"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>
        <TextField
          label="Notes (optional)"
          multiline
          minRows={3}
          fullWidth
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
          inputProps={{ maxLength: NOTE_MAX }}
          helperText={`${note.length}/${NOTE_MAX}`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isLoading || !channel}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
