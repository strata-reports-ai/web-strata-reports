import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { initOnboarding, setOnboardingStep } from '../store/onboardingSlice'
import { AppDispatch, RootState } from '../store/store'

const STEPS = ['Add Property', 'Upload Data', 'Generate Report']

export function WelcomePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const isNarrow = useMediaQuery('(max-width:400px)')

  const user = useSelector((state: RootState) => state.auth.user)
  const tenantId = user?.id ?? 'default'
  const activeStep = useSelector((state: RootState) => state.onboarding.activeStep)

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

        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isNarrow}
          orientation={isNarrow ? 'vertical' : 'horizontal'}
          sx={{ mb: 5 }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleBegin}
            sx={{ minWidth: 200, minHeight: 48 }}
          >
            Begin
          </Button>
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
    </Box>
  )
}
