import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { GenerateReportForm } from '../components/GenerateReportForm'
import { useGetReportQuery, type ReportStatus } from '../api/reportSlice'
import { track, ANALYTICS_EVENTS } from '../services/analytics'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

const STATUS_STEPS: { label: string; statuses: ReportStatus[] }[] = [
  { label: 'Queued', statuses: ['queued'] },
  { label: 'Aggregating data', statuses: ['generating'] },
  { label: 'Generating narrative', statuses: ['generating'] },
  { label: 'Rendering PDF', statuses: ['generating'] },
  { label: 'Done', statuses: ['succeeded'] },
]

function getActiveStep(status: ReportStatus): number {
  switch (status) {
    case 'queued':
      return 0
    case 'generating':
      return 2
    case 'succeeded':
      return 4
    case 'failed':
      return -1
    default:
      return 0
  }
}

interface PollingProgressProps {
  reportId: string
  onDone: (reportId: string) => void
  onFailed: (message: string) => void
  onTimeout: () => void
}

function PollingProgress({ reportId, onDone, onFailed, onTimeout }: PollingProgressProps) {
  const startTimeRef = useRef(Date.now())
  const [timedOut, setTimedOut] = useState(false)

  const { data: report, isError } = useGetReportQuery(reportId, {
    pollingInterval: timedOut ? 0 : POLL_INTERVAL_MS,
    skip: timedOut,
  })

  useEffect(() => {
    if (!report) return
    if (report.status === 'succeeded') {
      onDone(reportId)
      return
    }
    if (report.status === 'failed') {
      onFailed(report.errorMessage ?? 'Report generation failed.')
      return
    }
    if (Date.now() - startTimeRef.current >= POLL_TIMEOUT_MS) {
      setTimedOut(true)
      onTimeout()
    }
  }, [report, reportId, onDone, onFailed, onTimeout])

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
      onTimeout()
    }, POLL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [onTimeout])

  if (isError) {
    return (
      <Alert severity="error">
        Lost connection while polling. Please check the reports list.
      </Alert>
    )
  }

  const status = report?.status ?? 'queued'
  const activeStep = getActiveStep(status as ReportStatus)

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generating your report — this may take a moment.
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 2 }}>
        {STATUS_STEPS.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <LinearProgress sx={{ borderRadius: 1 }} />
    </Box>
  )
}

type Phase = 'form' | 'polling' | 'done' | 'error'

export function GenerateReportPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('form')
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const handleFormSuccess = (reportId: string) => {
    track(ANALYTICS_EVENTS.report_generation_started, { report_id: reportId })
    setActiveReportId(reportId)
    setPhase('polling')
  }

  const handleFormError = (message: string) => {
    setErrorMessage(message)
    setPhase('error')
  }

  const handlePollingDone = (reportId: string) => {
    track(ANALYTICS_EVENTS.report_generation_succeeded, { report_id: reportId })
    setSuccessOpen(true)
    setPhase('done')
    setTimeout(() => navigate('/reports'), 2000)
  }

  const handlePollingFailed = (message: string) => {
    setErrorMessage(message)
    setPhase('error')
  }

  const handleTimeout = () => {
    setErrorMessage('Report generation timed out after 5 minutes. Please try again.')
    setPhase('error')
  }

  const handleTryAgain = () => {
    setErrorMessage(null)
    setActiveReportId(null)
    setPhase('form')
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Generate Report
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {phase === 'form' && (
            <GenerateReportForm
              onSuccess={handleFormSuccess}
              onError={handleFormError}
            />
          )}

          {phase === 'polling' && activeReportId && (
            <PollingProgress
              reportId={activeReportId}
              onDone={handlePollingDone}
              onFailed={handlePollingFailed}
              onTimeout={handleTimeout}
            />
          )}

          {phase === 'done' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                Report ready!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to reports…
              </Typography>
            </Box>
          )}

          {phase === 'error' && (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleTryAgain}
                fullWidth
              >
                Try again
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)} sx={{ width: '100%' }}>
          Report generated successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
