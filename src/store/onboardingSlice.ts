import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OnboardingStep = 0 | 1 | 2 | 3

interface OnboardingState {
  activeStep: OnboardingStep
}

function loadStep(tenantId: string): OnboardingStep {
  try {
    const raw = localStorage.getItem(`onboarding_step_${tenantId}`)
    const parsed = raw !== null ? parseInt(raw, 10) : 0
    if (parsed === 0 || parsed === 1 || parsed === 2 || parsed === 3) return parsed as OnboardingStep
  } catch {
    // ignore
  }
  return 0
}

function saveStep(tenantId: string, step: OnboardingStep) {
  try {
    localStorage.setItem(`onboarding_step_${tenantId}`, String(step))
  } catch {
    // ignore
  }
}

const initialState: OnboardingState = {
  activeStep: 0,
}

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    initOnboarding(state, action: PayloadAction<{ tenantId: string }>) {
      state.activeStep = loadStep(action.payload.tenantId)
    },
    setOnboardingStep(state, action: PayloadAction<{ tenantId: string; step: OnboardingStep }>) {
      state.activeStep = action.payload.step
      saveStep(action.payload.tenantId, action.payload.step)
    },
  },
})

export const { initOnboarding, setOnboardingStep } = onboardingSlice.actions
export default onboardingSlice.reducer
