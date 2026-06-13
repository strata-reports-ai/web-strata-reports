import { TOUR_STEPS, type TourStep } from './tourSteps'

export interface HowToGuide {
  id: string
  title: string
  description: string
  category: string
  /** Extra terms to match when searching, beyond title/description/category. */
  keywords: string[]
  steps: TourStep[]
}

export const HOW_TO_GUIDES: HowToGuide[] = [
  {
    id: 'generate-report',
    title: 'Generate an owner report',
    description: 'Turn a property and a period into a polished, owner-ready PDF.',
    category: 'Reports',
    keywords: ['report', 'pdf', 'generate', 'create', 'owner', 'quarterly', 'monthly'],
    steps: [
      {
        route: '/dashboard',
        selector: 'generate-report',
        title: 'Start a report',
        body: 'Reports begin from the dashboard (or the Reports tab). Click Generate Report to open the builder.',
        placement: 'bottom',
      },
      {
        route: '/reports/new',
        selector: 'generate-form',
        title: 'Choose property & period',
        body: 'Pick the property, choose a quarter or month, add an optional note for the owner, then hit Generate. StayRecap computes the numbers and writes the narrative — the PDF is ready in about two minutes.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'open-send-report',
    title: 'Open and send a report',
    description: 'Preview and download the PDF, or email a finished report to the owner.',
    category: 'Reports',
    keywords: ['report', 'download', 'pdf', 'email', 'send', 'owner', 'view', 'regenerate'],
    steps: [
      {
        route: '/reports',
        selector: 'reports-table',
        title: 'Your reports',
        body: 'Every report and its status lives here. Click any row to open it — from the detail page you can preview and download the PDF, email it straight to the owner, or regenerate it.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'explore-property',
    title: 'Explore a property',
    description: 'See a property’s details, its reports, and its data imports together.',
    category: 'Properties',
    keywords: ['property', 'properties', 'detail', 'owner', 'units', 'address', 'manage'],
    steps: [
      {
        route: '/properties',
        selector: 'properties-table',
        title: 'Your properties',
        body: 'Click a property’s name to open its detail page — address and owner, plus all of its reports and data imports in one place.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'upload-csv',
    title: 'Upload a CSV file',
    description: 'Bring revenue, expenses, reviews and more into StayRecap.',
    category: 'Data',
    keywords: ['upload', 'csv', 'import', 'data', 'file', 'revenue', 'expenses', 'add'],
    steps: [
      {
        route: '/imports/upload',
        selector: 'upload-dropzone',
        title: 'Upload a CSV',
        body: 'Choose the property and the type of data, then drag a CSV in (or click to browse). StayRecap maps the columns and pulls the records in automatically — you’ll see it appear in your import history.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'import-history',
    title: 'Track your data imports',
    description: 'See every CSV import and whether it processed successfully.',
    category: 'Data',
    keywords: ['import', 'csv', 'upload', 'data', 'history', 'revenue', 'expenses', 'reviews'],
    steps: [
      {
        route: '/imports',
        selector: 'imports-table',
        title: 'Import history',
        body: 'StayRecap reads CSV exports from your PMS, accounting, and review tools. Each upload is tracked here with its record count and status, so you always know your data is in.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'plan-usage',
    title: 'Check your plan & usage',
    description: 'See how many properties and reports you’ve used against your plan.',
    category: 'Account',
    keywords: ['billing', 'plan', 'usage', 'upgrade', 'subscription', 'limits', 'stripe', 'quota'],
    steps: [
      {
        route: '/settings/billing',
        selector: 'billing-usage',
        title: 'Plan & usage',
        body: 'Track properties and reports used against your quota, and upgrade as you grow. Billing is handled securely through Stripe.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'full-tour',
    title: 'Take the full guided tour',
    description: 'A quick spotlight tour across every part of StayRecap.',
    category: 'Getting started',
    keywords: ['tour', 'overview', 'walkthrough', 'guide', 'start', 'everything', 'intro'],
    steps: TOUR_STEPS,
  },
]

export function getGuide(id: string): HowToGuide | undefined {
  return HOW_TO_GUIDES.find((g) => g.id === id)
}
