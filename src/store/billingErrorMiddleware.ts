import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit'
import { setBillingGate, BillingGateType } from './billingSlice'

interface PaymentRequiredErrorData {
  type?: BillingGateType
  message?: string
}

export const billingErrorMiddleware: Middleware = (api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as { status?: number; data?: PaymentRequiredErrorData } | undefined
    if (payload && payload.status === 402) {
      const data = payload.data ?? {}
      const type: BillingGateType =
        data.type === 'plan_limit_exceeded' || data.type === 'past_due'
          ? data.type
          : 'trial_expired'
      const defaultMessages: Record<BillingGateType, string> = {
        trial_expired: 'Your trial has ended. Upgrade your plan to continue.',
        plan_limit_exceeded: 'You have reached your plan limit. Upgrade to continue.',
        past_due: 'Payment failed. Please update your payment method.',
      }
      api.dispatch(
        setBillingGate({
          type,
          message: data.message ?? defaultMessages[type],
        }),
      )
    }
  }
  return next(action)
}
