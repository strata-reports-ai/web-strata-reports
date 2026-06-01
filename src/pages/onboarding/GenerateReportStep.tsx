import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper'
import { useGetPropertiesQuery } from '../../api/propertiesApi'
import {
  useGenerateReportMutation,
  useGetReportQuery,
  type ReportStatus,
} from '../../api/reportSlice'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 3 * 60 * 1000

const STATUS_STEPS: { label: string }[] = [
  { label: 'Queued' },
  { label: 'Generating' },
  { label: 'Done' },
]

function getActiveStep(status: ReportStatus): number {
  switch (status) {
    case 'queued':
      return 0
    case 'generating':
    case 'processing':
      return 1
    case 'succeeded':
      return 2
    default:
      return 0
  }
}

function getMostRecentCompletedQuarter(now: Date = new Date()): {
  periodStart: string
  periodEnd: string
  label: string
} {
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentQuarter = Math.floor(month / 3) + 1
  let q = currentQuarter - 1
  let y = year
  if (q === 0) {
    q = 4
    y = year - 1
  }
  const starts = ['01-01', '04-01', '07-01', '10-01']
  const ends = ['03-31', '06-30', '09-30', '12-31']
  return {
    periodStart: `${y}-${starts[q - 1]}`,
    periodEnd: `${y}-${ends[q - 1]}`,
    label: `Q${q} ${y}`,
  }
}

interface PollingProgressProps {
  reportId: string
  onDone: () => void
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
      onDone()
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
  }, [report, onDone, onFailed, onTimeout])

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
        Lost connection while polling. Please try again.
      </Alert>
    )
  }

  const status = (report?.status ?? 'queued') as ReportStatus
  const activeStep = getActiveStep(status)

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Generating your first report — this may take a moment.
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

type Phase = 'idle' | 'polling' | 'error'

export function GenerateReportStep() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyIdParam = searchParams.get('propertyId')

  const { data: propertiesData, isLoading: propertiesLoading } = useGetPropertiesQuery({
    pageSize: 50,
    sortBy: 'name',
    sortDir: 'asc',
  })

  const properties = propertiesData?.items ?? []
  const selectedProperty =
    properties.find((p) => p.id === propertyIdParam) ?? properties[0]

  const period = getMostRecentCompletedQuarter()

  const [generateReport, { isLoading: isGenerating }] = useGenerateReportMutation()
  const [phase, setPhase] = useState<Phase>('idle')
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedProperty) {
      setErrorMessage('No property found. Please add a property first.')
      setPhase('error')
      return
    }
    setErrorMessage(null)
    try {
      const result = await generateReport({
        propertyId: selectedProperty.id,
        type: 'quarterly',
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
      }).unwrap()
      setActiveReportId(result.reportId)
      setPhase('polling')
    } catch (err: unknown) {
      const apiErr = err as { data?: { error_message?: string } }
      setErrorMessage(
        apiErr?.data?.error_message ?? 'Failed to generate report. Please try again.',
      )
      setPhase('error')
    }
  }

  const handlePollingDone = useCallback(() => {
    if (!activeReportId) return
    navigate(`/onboarding/success?reportId=${encodeURIComponent(activeReportId)}`)
  }, [activeReportId, navigate])

  const handlePollingFailed = useCallback((message: string) => {
    setErrorMessage(message)
    setPhase('error')
  }, [])

  const handleTimeout = useCallback(() => {
    setErrorMessage('Report generation timed out after 3 minutes. Please try again.')
    setPhase('error')
  }, [])

  const handleRetry = () => {
    setErrorMessage(null)
    setActiveReportId(null)
    setPhase('idle')
  }

  const noProperty = !propertiesLoading && !selectedProperty

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%', p: { xs: 2, sm: 3 } }}>
      <OnboardingStepper activeStep={2} />

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" gutterBottom>
            Generate your first report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We'll create a quarterly report using the data you've uploaded.
          </Typography>

          {phase === 'idle' && (
            <Stack spacing={2}>
              {propertiesLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Loading…
                  </Typography>
                </Stack>
              ) : noProperty ? (
                <Alert severity="error">
                  No property found. Please add a property first.
                </Alert>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Property
                      </Typography>
                      <Typography variant="body1">{selectedProperty?.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Period
                      </Typography>
                      <Typography variant="body1">{period.label}</Typography>
                    </Box>
                  </Stack>
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGenerate}
                disabled={isGenerating || propertiesLoading || noProperty}
                startIcon={
                  isGenerating ? <CircularProgress size={18} color="inherit" /> : undefined
                }
                fullWidth
              >
                {isGenerating ? 'Generating…' : 'Generate Report'}
              </Button>
            </Stack>
          )}

          {phase === 'polling' && activeReportId && (
            <PollingProgress
              reportId={activeReportId}
              onDone={handlePollingDone}
              onFailed={handlePollingFailed}
              onTimeout={handleTimeout}
            />
          )}

          {phase === 'error' && (
            <Stack spacing={2}>
              <Alert severity="error">{errorMessage}</Alert>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                fullWidth
              >
                Try again
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
