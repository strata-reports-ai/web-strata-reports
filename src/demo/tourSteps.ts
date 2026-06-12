/** Event the demo banner dispatches to (re)launch the guided tour. */
export const START_TOUR_EVENT = 'stayrecap:start-tour'

export interface TourStep {
  /** Route the step lives on; the tour navigates here before showing it. */
  route: string
  /** data-tour attribute of the element to spotlight. Omit for a centered card. */
  selector?: string
  title: string
  body: string
  /** Preferred side for the callout relative to the spotlighted element. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/dashboard',
    selector: 'dashboard-stats',
    title: 'Your portfolio at a glance',
    body: 'These cards summarise the whole account — properties under management, reports generated this quarter, imports still processing, and the recurring revenue at stake across your owner relationships.',
    placement: 'bottom',
  },
  {
    route: '/dashboard',
    selector: 'generate-report',
    title: 'Generate an owner report',
    body: 'The core action: pick a property and a period and StayRecap produces a polished, owner-ready PDF in about two minutes — numbers computed in code, narrative written by AI so it never invents a figure.',
    placement: 'bottom',
  },
  {
    route: '/properties',
    selector: 'properties-table',
    title: 'Your properties',
    body: 'Every property you manage lives here. Click a property name to open its detail page — address and owner, plus all of its reports and data imports in one place.',
    placement: 'top',
  },
  {
    route: '/reports',
    selector: 'reports-table',
    title: 'Quarterly reports',
    body: 'A full history of generated reports with their status. Open one to preview and download the owner-ready PDF, email it straight to the owner, or regenerate it.',
    placement: 'top',
  },
  {
    route: '/imports',
    selector: 'imports-table',
    title: 'Bring in your data',
    body: 'StayRecap reads CSV exports from your PMS, accounting, and review tools. Every upload is tracked here with its record count and status, so nothing slips through.',
    placement: 'top',
  },
  {
    route: '/settings/billing',
    selector: 'billing-usage',
    title: 'Plan & usage',
    body: 'Keep an eye on plan limits — properties and reports used against your quota — and upgrade as you grow. Billing is handled securely through Stripe.',
    placement: 'top',
  },
  {
    route: '/dashboard',
    title: "That's the tour!",
    body: 'Everything here runs on realistic sample data. Sign up to connect your own properties and generate real owner reports — or close this and keep exploring the demo on your own.',
  },
]
