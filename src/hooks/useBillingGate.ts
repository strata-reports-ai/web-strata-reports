import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { useGetBillingStatusQuery } from '../api/billingApi'

export interface BillingGateResult {
  isBlocked: boolean
  blockReason: string | null
  propertiesAtLimit: boolean
  reportsAtLimit: boolean
}

export function useBillingGate(): BillingGateResult {
  const gate = useSelector((s: RootState) => s.billing.gate)
  const { data } = useGetBillingStatusQuery()

  const propertiesAtLimit = !!data && data.propertiesLimit > 0 && data.propertiesUsed >= data.propertiesLimit
  const reportsAtLimit = !!data && data.reportsQuota > 0 && data.reportsThisQuarter >= data.reportsQuota
  const statusBlocked = !!data && (data.status === 'expired' || data.status === 'past_due')

  const isBlocked = !!gate || statusBlocked || propertiesAtLimit || reportsAtLimit

  let blockReason: string | null = null
  if (gate) {
    blockReason = gate.message
  } else if (statusBlocked) {
    blockReason =
      data?.status === 'past_due'
        ? 'Payment failed — please update your payment method.'
        : 'Your trial has ended — upgrade to continue.'
  } else if (propertiesAtLimit) {
    blockReason = 'You have reached your property limit. Upgrade your plan.'
  } else if (reportsAtLimit) {
    blockReason = 'You have reached your report quota for this quarter. Upgrade your plan.'
  }

  return { isBlocked, blockReason, propertiesAtLimit, reportsAtLimit }
}
