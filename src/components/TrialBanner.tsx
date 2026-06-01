import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, IconButton, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useGetBillingStatusQuery } from '../api/billingApi'

const DISMISS_KEY = 'trial_banner_dismissed'

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function TrialBanner() {
  const navigate = useNavigate()
  const { data } = useGetBillingStatusQuery()
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (dismissed) {
      try {
        sessionStorage.setItem(DISMISS_KEY, '1')
      } catch {
        // ignore storage errors
      }
    }
  }, [dismissed])

  if (!data) return null

  const goToBilling = () => navigate('/settings/billing')

  if (data.status === 'expired') {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: 1200 }}
        action={
          <Button color="inherit" size="small" onClick={goToBilling}>
            Upgrade
          </Button>
        }
      >
        Your trial has ended — upgrade to continue generating reports.
      </Alert>
    )
  }

  if (data.status === 'past_due') {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 0, position: 'sticky', top: 0, zIndex: 1200 }}
        action={
          <Button color="inherit" size="small" onClick={goToBilling}>
            Update Payment
          </Button>
        }
      >
        Payment failed — please update your payment method.
      </Alert>
    )
  }

  if (
    data.status === 'trialing' ||
    (data.status === 'active' && data.trialEndsAt && new Date(data.trialEndsAt).getTime() > Date.now())
  ) {
    if (dismissed) return null
    const days = data.trialEndsAt ? daysUntil(data.trialEndsAt) : 0
    return (
      <Box
        sx={{
          bgcolor: 'info.light',
          color: 'info.contrastText',
          px: 2,
          py: 1,
          position: 'sticky',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="body2">
            {days} day{days === 1 ? '' : 's'} left in your trial.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={goToBilling}
              sx={{ minHeight: 36 }}
            >
              Upgrade now
            </Button>
            <IconButton
              size="small"
              aria-label="dismiss"
              onClick={() => setDismissed(true)}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    )
  }

  return null
}
