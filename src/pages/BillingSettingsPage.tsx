import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import {
  useGetBillingStatusQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  type BillingStatus,
} from '../api/billingApi'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

function statusColor(status: BillingStatus): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'active':
      return 'success'
    case 'trialing':
      return 'info'
    case 'past_due':
      return 'warning'
    case 'canceled':
    case 'expired':
      return 'error'
    default:
      return 'default'
  }
}

function statusLabel(status: BillingStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'trialing':
      return 'Trialing'
    case 'past_due':
      return 'Past Due'
    case 'canceled':
      return 'Canceled'
    case 'expired':
      return 'Expired'
    default:
      return status
  }
}

interface UsageBarProps {
  label: string
  used: number
  limit: number
}

function UsageBar({ label, used, limit }: UsageBarProps) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {used} / {limit}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={pct >= 100 ? 'error' : pct >= 80 ? 'warning' : 'primary'}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  )
}

export function BillingSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isLoading, isError } = useGetBillingStatusQuery()
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateCheckoutSessionMutation()
  const [createPortal, { isLoading: portalLoading }] = useCreatePortalSessionMutation()
  const [actionError, setActionError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setSuccessOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('checkout')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleUpgrade = async () => {
    setActionError(null)
    try {
      const result = await createCheckout().unwrap()
      window.location.href = result.url
    } catch {
      setActionError('Unable to start checkout. Please try again.')
    }
  }

  const handleManage = async () => {
    setActionError(null)
    try {
      const result = await createPortal().unwrap()
      window.location.href = result.url
    } catch {
      setActionError('Unable to open billing portal. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !data) {
    return (
      <Alert severity="error">Failed to load billing information. Please refresh.</Alert>
    )
  }

  const planLabel = data.plan ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1) : '—'

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', overflowX: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Billing
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Current Plan
              </Typography>
              <Typography variant="h6">{planLabel}</Typography>
            </Box>
            <Chip label={statusLabel(data.status)} color={statusColor(data.status)} />
          </Stack>

          {data.trialEndsAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Trial ends: {formatDate(data.trialEndsAt)}
            </Typography>
          )}

          <Stack spacing={2} sx={{ mt: 2 }}>
            <UsageBar
              label="Properties"
              used={data.propertiesUsed}
              limit={data.propertiesLimit}
            />
            <UsageBar
              label="Reports this quarter"
              used={data.reportsThisQuarter}
              limit={data.reportsQuota}
            />
          </Stack>
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button
          variant="contained"
          startIcon={
            checkoutLoading ? <CircularProgress size={18} color="inherit" /> : <UpgradeIcon />
          }
          onClick={handleUpgrade}
          disabled={checkoutLoading || portalLoading}
          sx={{ minHeight: 44 }}
          fullWidth
        >
          Upgrade / Change Plan
        </Button>
        <Button
          variant="outlined"
          startIcon={
            portalLoading ? <CircularProgress size={18} color="inherit" /> : <CreditCardIcon />
          }
          onClick={handleManage}
          disabled={checkoutLoading || portalLoading}
          sx={{ minHeight: 44 }}
          fullWidth
        >
          Manage Billing
        </Button>
      </Stack>

      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)} sx={{ width: '100%' }}>
          Subscription activated! Welcome to {planLabel} plan.
        </Alert>
      </Snackbar>
    </Box>
  )
}
