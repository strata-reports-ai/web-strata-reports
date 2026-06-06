import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import {
  useGetReportQuery,
  useRegenerateReportMutation,
  type ReportStatus,
} from '../api/reportSlice'
import { useReportPolling } from '../hooks/useReportPolling'
import { track, ANALYTICS_EVENTS } from '../services/analytics'

const STATUS_COLOR: Record<ReportStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  queued: 'default',
  generating: 'info',
  processing: 'info',
  succeeded: 'success',
  failed: 'error',
}

const STATUS_STEPS: { label: string }[] = [
  { label: 'Queued' },
  { label: 'Aggregating data' },
  { label: 'Generating narrative' },
  { label: 'Rendering PDF' },
  { label: 'Done' },
]

function getActiveStep(status: ReportStatus): number {
  switch (status) {
    case 'queued':
      return 0
    case 'generating':
    case 'processing':
      return 2
    case 'succeeded':
      return 4
    default:
      return 0
  }
}

function getPeriodLabel(periodStart: string): string {
  const start = new Date(periodStart)
  const month = start.getMonth()
  const year = start.getFullYear()
  const quarter = Math.floor(month / 3) + 1
  return `Q${quarter} ${year}`
}

interface MetaRowProps {
  label: string
  value: React.ReactNode
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 2 }} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  )
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [isPolling, setIsPolling] = useState(
    !!(location.state as { startPolling?: boolean } | null)?.startPolling,
  )
  const [iframeError, setIframeError] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null)

  const {
    data: report,
    isLoading,
    isError,
    refetch,
  } = useGetReportQuery(id ?? '', { skip: !id || isPolling })

  const { status: polledStatus, pollingState, errorMessage: pollingError } = useReportPolling(
    isPolling && id ? id : null,
  )

  const [regenerateReport, { isLoading: isRegenerating }] = useRegenerateReportMutation()

  const effectiveStatus: ReportStatus | undefined = isPolling
    ? polledStatus ?? 'queued'
    : report?.status

  const handlePollingDone = useCallback(() => {
    setIsPolling(false)
    if (id) track(ANALYTICS_EVENTS.report_generation_succeeded, { report_id: id })
    refetch()
  }, [refetch, id])

  useEffect(() => {
    if (isPolling && pollingState === 'succeeded') {
      handlePollingDone()
    }
  }, [isPolling, pollingState, handlePollingDone])

  const [downloadError, setDownloadError] = useState<string | null>(null)

  const isSafeUrl = (url: string) => url.startsWith('https://')

  const handleDownload = async () => {
    if (!id) return
    try {
      const result = await refetch()
      const url = result.data?.pdfUrl
      if (!url || !isSafeUrl(url)) return
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      track(ANALYTICS_EVENTS.report_downloaded, { report_id: id })
      setDownloadError(null)
    } catch {
      setDownloadError('Failed to download report. Please try again.')
    }
  }

  const handleRegenerateConfirm = async () => {
    setConfirmOpen(false)
    if (!id) return
    try {
      await regenerateReport(id).unwrap()
      setToast({ severity: 'success', message: 'Regeneration queued' })
      track(ANALYTICS_EVENTS.report_generation_started, { report_id: id })
      setIsPolling(true)
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number
        data?: { detail?: string; error_message?: string }
      }
      let message: string
      switch (apiErr?.status) {
        case 409:
          message = 'This report is already generating. Try again when it finishes.'
          break
        case 429:
          message =
            "You've reached your daily report limit. Upgrade your plan or wait until tomorrow."
          break
        case 503:
          message =
            'Report generation is temporarily unavailable. Please try again in a few minutes.'
          break
        default:
          message =
            apiErr?.data?.detail ??
            apiErr?.data?.error_message ??
            'Could not regenerate report.'
      }
      setToast({ severity: 'error', message })
    }
  }

  const isInProgress =
    effectiveStatus === 'queued' ||
    effectiveStatus === 'generating' ||
    effectiveStatus === 'processing'
  const regenerateDisabled = isRegenerating || isInProgress
  const regenerateTooltip = isInProgress ? 'Already in progress' : ''

  const periodLabel =
    report ? getPeriodLabel(report.periodStart) : ''

  const breadcrumbTitle = report
    ? `${report.propertyName} ${periodLabel}`
    : isLoading
    ? ''
    : 'Report'

  if (isError) {
    return (
      <Box>
        <Alert severity="error">Failed to load report. Please try again.</Alert>
      </Box>
    )
  }

  const iframeHeight = isMobile ? 400 : 600

  const showPolling =
    isPolling ||
    effectiveStatus === 'queued' ||
    effectiveStatus === 'generating' ||
    effectiveStatus === 'processing'

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/')}
        >
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/reports')}
        >
          Reports
        </Link>
        {isLoading ? (
          <Skeleton variant="text" width={120} />
        ) : (
          <Typography variant="body2" color="text.primary">
            {breadcrumbTitle}
          </Typography>
        )}
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5">
          {isLoading ? <Skeleton width={240} /> : breadcrumbTitle}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!showPolling && effectiveStatus === 'succeeded' && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              size={isMobile ? 'small' : 'medium'}
              sx={{ minHeight: 44, minWidth: 44 }}
            >
              Download PDF
            </Button>
          )}
          {!isLoading && (
            <Tooltip title={regenerateTooltip}>
              <span>
                {isMobile ? (
                  <IconButton
                    color="primary"
                    onClick={() => setConfirmOpen(true)}
                    disabled={regenerateDisabled}
                    aria-label="Regenerate report"
                    sx={{ minHeight: 44, minWidth: 44 }}
                  >
                    <RefreshIcon />
                  </IconButton>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={() => setConfirmOpen(true)}
                    disabled={regenerateDisabled}
                    size="medium"
                    aria-label="Regenerate report"
                    sx={{ minHeight: 44 }}
                  >
                    Regenerate
                  </Button>
                )}
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </Stack>
        ) : report ? (
          <>
            <MetaRow label="Property" value={report.propertyName} />
            <Divider />
            <MetaRow label="Period" value={periodLabel} />
            <Divider />
            <MetaRow
              label="Generated At"
              value={new Date(report.createdAt).toLocaleString()}
            />
            <Divider />
            {report.generatedBy && (
              <>
                <MetaRow label="Generated By" value={report.generatedBy} />
                <Divider />
              </>
            )}
            {report.aiModel && (
              <>
                <MetaRow label="AI Model" value={report.aiModel} />
                <Divider />
              </>
            )}
            {report.generationTimeMs != null && (
              <>
                <MetaRow
                  label="Generation Time"
                  value={`${report.generationTimeMs.toLocaleString()} ms`}
                />
                <Divider />
              </>
            )}
            {report.aiCostUsd != null && (
              <>
                <MetaRow
                  label="AI Cost"
                  value={`$${report.aiCostUsd.toFixed(4)}`}
                />
                <Divider />
              </>
            )}
            <MetaRow
              label="Status"
              value={
                <Chip
                  label={effectiveStatus ?? report.status}
                  color={STATUS_COLOR[effectiveStatus ?? report.status]}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              }
            />
          </>
        ) : null}
      </Paper>

      {showPolling && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          {pollingState === 'error' || pollingState === 'timeout' ? (
            <Alert severity="error">
              {pollingState === 'timeout'
                ? 'Report generation timed out. Please check back later.'
                : pollingError ?? 'Lost connection while polling. Please check back later.'}
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generating your report — this may take a moment.
              </Typography>
              <Stepper
                activeStep={getActiveStep(effectiveStatus ?? 'queued')}
                orientation="vertical"
                sx={{ mb: 2 }}
              >
                {STATUS_STEPS.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <LinearProgress sx={{ borderRadius: 1 }} />
            </Box>
          )}
        </Paper>
      )}

      {downloadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      )}

      {!showPolling && effectiveStatus === 'failed' && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {report?.errorMessage ?? 'Report generation failed.'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={isRegenerating}
          >
            Try Again
          </Button>
        </Paper>
      )}

      {!showPolling && effectiveStatus === 'succeeded' && (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            PDF Preview
          </Typography>
          {!iframeError && report?.pdfUrl && isSafeUrl(report.pdfUrl) ? (
            <Box
              component="iframe"
              src={report.pdfUrl}
              onError={() => setIframeError(true)}
              sx={{
                width: '100%',
                minWidth: 300,
                height: iframeHeight,
                border: 'none',
                display: 'block',
              }}
              title="Report PDF Preview"
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Preview not available.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            </Box>
          )}
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Regenerate this report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace the current PDF and AI narrative. The existing PDF will be permanently
            overwritten.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRegenerateConfirm} color="error" variant="contained">
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
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
