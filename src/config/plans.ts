export type PlanId = 'starter' | 'pro' | 'scale'

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number
  propertiesLimit: number
  reportsQuota: number
  reportsQuotaLabel: string
  unlimitedReports: boolean
  description: string
  features: string[]
}

export const OVERAGE_RATE_PER_REPORT = 2

export const PLANS: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    propertiesLimit: 5,
    reportsQuota: 4,
    reportsQuotaLabel: '4 reports/quarter included',
    unlimitedReports: false,
    description: 'For owners getting started with strata reporting.',
    features: [
      'Up to 5 properties',
      '4 reports per quarter included',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 79,
    propertiesLimit: 20,
    reportsQuota: 20,
    reportsQuotaLabel: '20 reports/quarter included',
    unlimitedReports: false,
    description: 'For growing portfolios that need more reports.',
    features: [
      'Up to 20 properties',
      '20 reports per quarter included',
      'Priority email support',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    priceMonthly: 199,
    propertiesLimit: 50,
    reportsQuota: -1,
    reportsQuotaLabel: 'Unlimited reports',
    unlimitedReports: true,
    description: 'For high-volume operators who need unlimited reporting.',
    features: [
      'Up to 50 properties',
      'Unlimited reports',
      'Priority support',
    ],
  },
] as const

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}
