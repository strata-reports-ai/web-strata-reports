import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper'
import { useGetReportQuery } from '../../api/reportSlice'
import type { RootState } from '../../store/store'

const TIPS = [
  'Download the PDF and attach it to an email to your owner.',
  'Add a short personal note highlighting key wins from the period.',
  'Send quarterly to keep owners informed and build trust.',
]

export function OnboardingSuccess() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchParams] = useSearchParams()
  const reportId = searchParams.get('reportId')
  const user = useSelector((state: RootState) => state.auth.user)
  const tenantId = user?.id ?? 'default'

  const { data: report, isLoading, isError } = useGetReportQuery(reportId ?? '', {
    skip: !reportId,
  })

  const [iframeError, setIframeError] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const isSafeUrl = (url: string) => url.startsWith('https://')

  const handleDownload = () => {
    if (!report?.pdfUrl || !isSafeUrl(report.pdfUrl)) {
      setDownloadError('Report PDF is not available.')
      return
    }
    const a = document.createElement('a')
    a.href = report.pdfUrl
    a.download = `report-${report.id}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDownloadError(null)
  }

  const handleGoToDashboard = () => {
    try {
      localStorage.removeItem(`onboarding_step_${tenantId}`)
    } catch {
      // ignore
    }
    navigate('/dashboard')
  }

  const iframeHeight = isMobile ? 400 : 600
  const canPreview = !!report?.pdfUrl && isSafeUrl(report.pdfUrl) && !iframeError

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%', p: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
      <OnboardingStepper activeStep={3} />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CheckCircleIcon color="success" />
            <Typography variant="h5">Your first report is ready!</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Preview it below, then download and share with your owner.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={!report?.pdfUrl}
              fullWidth
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGoToDashboard}
              fullWidth
            >
              Go to dashboard
            </Button>
          </Stack>

          {downloadError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDownloadError(null)}>
              {downloadError}
            </Alert>
          )}

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load report. You can find it in the reports list.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              PDF Preview
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : canPreview ? (
              <Box
                component="iframe"
                src={report!.pdfUrl!}
                onError={() => setIframeError(true)}
                sx={{
                  width: '100%',
                  minWidth: 0,
                  height: iframeHeight,
                  border: 'none',
                  display: 'block',
                }}
                title="Report PDF Preview"
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Preview not available. Use the download button above.
                </Typography>
              </Box>
            )}
          </Paper>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6">How to send to your owner</Typography>
          </Stack>
          <List dense disablePadding>
            {TIPS.map((tip) => (
              <ListItem key={tip} sx={{ alignItems: 'flex-start', px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
