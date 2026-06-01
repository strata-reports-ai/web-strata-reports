import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type BillingGateType = 'trial_expired' | 'plan_limit_exceeded' | 'past_due'

export interface BillingGate {
  type: BillingGateType
  message: string
}

interface BillingState {
  gate: BillingGate | null
}

const initialState: BillingState = {
  gate: null,
}

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setBillingGate(state, action: PayloadAction<BillingGate>) {
      state.gate = action.payload
    },
    clearBillingGate(state) {
      state.gate = null
    },
  },
})

export const { setBillingGate, clearBillingGate } = billingSlice.actions
export default billingSlice.reducer
