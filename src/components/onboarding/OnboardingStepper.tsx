import { useEffect } from 'react'
import { Box, Button, Stack, Step, StepLabel, Stepper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setOnboardingStep, type OnboardingStep } from '../../store/onboardingSlice'
import type { AppDispatch, RootState } from '../../store/store'

export const ONBOARDING_STEPS = ['Add Property', 'Upload Data', 'Generate Report'] as const

interface OnboardingStepperProps {
  activeStep: OnboardingStep
}

export function OnboardingStepper({ activeStep }: OnboardingStepperProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const tenantId = user?.id ?? 'default'

  useEffect(() => {
    dispatch(setOnboardingStep({ tenantId, step: activeStep }))
  }, [dispatch, tenantId, activeStep])

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ flex: 1, minWidth: 0 }}>
          {ONBOARDING_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Button
          size="small"
          onClick={() => navigate('/dashboard')}
          sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
        >
          Skip onboarding
        </Button>
      </Stack>
    </Box>
  )
}
