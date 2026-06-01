import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MobileStepper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { initOnboarding, setOnboardingStep } from '../store/onboardingSlice'
import { AppDispatch, RootState } from '../store/store'
import { useGetPropertiesQuery } from '../api/propertiesApi'
import { useSeedSampleDataMutation } from '../api/onboardingApi'

const STEPS = ['Add Property', 'Upload Data', 'Generate Report']

export function WelcomePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const isNarrow = useMediaQuery('(max-width:400px)')

  const user = useSelector((state: RootState) => state.auth.user)
  const tenantId = user?.id ?? 'default'
  const activeStep = useSelector((state: RootState) => state.onboarding.activeStep)

  const { data: propertiesData } = useGetPropertiesQuery({ pageSize: 1 })
  const hasExistingProperties = (propertiesData?.totalCount ?? 0) > 0

  const [seedSampleData, { isLoading: isSeeding }] = useSeedSampleDataMutation()
  const [errorToastOpen, setErrorToastOpen] = useState(false)

  useEffect(() => {
    dispatch(initOnboarding({ tenantId }))
  }, [dispatch, tenantId])

  const handleBegin = () => {
    dispatch(setOnboardingStep({ tenantId, step: 0 }))
    navigate('/properties/new')
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  const handleTrySampleData = async () => {
    try {
      const result = await seedSampleData().unwrap()
      navigate(
        `/onboarding/generate-report?propertyId=${encodeURIComponent(result.propertyId)}`,
      )
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: { propertyId?: string } }
      if (apiErr?.status === 409 && apiErr.data?.propertyId) {
        navigate(
          `/onboarding/generate-report?propertyId=${encodeURIComponent(apiErr.data.propertyId)}`,
        )
        return
      }
      setErrorToastOpen(true)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
        py: 4,
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ textAlign: 'center' }}>
          Let's get your first report in 10 minutes.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Follow these three steps to set up your first strata report.
        </Typography>

        {isNarrow ? (
          <Box sx={{ mb: 5 }}>
            <MobileStepper
              variant="dots"
              steps={STEPS.length}
              position="static"
              activeStep={activeStep}
              nextButton={null}
              backButton={null}
              sx={{ bgcolor: 'transparent', justifyContent: 'center', px: 0 }}
            />
            <Typography
              variant="caption"
              align="center"
              display="block"
              sx={{ mt: 1, color: 'text.secondary' }}
            >
              Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
            </Typography>
          </Box>
        ) : (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {STEPS.map((label, index) => (
              <Step key={label} completed={index < activeStep}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleBegin}
              disabled={isSeeding}
              sx={{ minWidth: 200, minHeight: 48 }}
            >
              Get started
            </Button>
            {!hasExistingProperties && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleTrySampleData}
                disabled={isSeeding}
                startIcon={
                  isSeeding ? <CircularProgress size={18} color="inherit" /> : undefined
                }
                sx={{ minWidth: 200, minHeight: 48 }}
              >
                Try with sample data
              </Button>
            )}
          </Box>
          {isSeeding && (
            <Typography variant="caption" color="text.secondary">
              Setting up your demo property…
            </Typography>
          )}
          <Button
            variant="text"
            size="small"
            onClick={handleSkip}
            sx={{ color: 'text.secondary' }}
          >
            Skip onboarding
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={errorToastOpen}
        autoHideDuration={5000}
        onClose={() => setErrorToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorToastOpen(false)}
          sx={{ width: '100%' }}
        >
          Could not load sample data — please try again or add a property manually
        </Alert>
      </Snackbar>
    </Box>
  )
}
