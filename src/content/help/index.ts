import addFirstProperty from './add-first-property.md?raw'
import requiredCsvFiles from './required-csv-files.md?raw'
import downloadExports from './download-exports.md?raw'
import csvUploadFailed from './csv-upload-failed.md?raw'
import columnMappingErrors from './column-mapping-errors.md?raw'
import reportGenerationTime from './report-generation-time.md?raw'
import regenerateReport from './regenerate-report.md?raw'
import pricingPlans from './pricing-plans.md?raw'
import cancelSubscription from './cancel-subscription.md?raw'
import contactSupport from './contact-support.md?raw'

export type HelpCategory = 'Getting Started' | 'CSV Imports' | 'Reports' | 'Billing'

export interface HelpArticle {
  slug: string
  title: string
  category: HelpCategory
  source: string
}

export const HELP_CATEGORY_ORDER: HelpCategory[] = [
  'Getting Started',
  'CSV Imports',
  'Reports',
  'Billing',
]

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'add-first-property',
    title: 'How do I add my first property?',
    category: 'Getting Started',
    source: addFirstProperty,
  },
  {
    slug: 'required-csv-files',
    title: 'What CSV files do I need?',
    category: 'CSV Imports',
    source: requiredCsvFiles,
  },
  {
    slug: 'download-exports',
    title: 'Where do I download my Hostaway/Airbnb/QuickBooks exports?',
    category: 'Getting Started',
    source: downloadExports,
  },
  {
    slug: 'csv-upload-failed',
    title: 'Why did my CSV upload fail?',
    category: 'CSV Imports',
    source: csvUploadFailed,
  },
  {
    slug: 'column-mapping-errors',
    title: 'How do I fix column-mapping errors?',
    category: 'CSV Imports',
    source: columnMappingErrors,
  },
  {
    slug: 'report-generation-time',
    title: 'How long does report generation take?',
    category: 'Reports',
    source: reportGenerationTime,
  },
  {
    slug: 'regenerate-report',
    title: 'How do I regenerate a report?',
    category: 'Reports',
    source: regenerateReport,
  },
  {
    slug: 'pricing-plans',
    title: "What's included in each pricing plan?",
    category: 'Billing',
    source: pricingPlans,
  },
  {
    slug: 'cancel-subscription',
    title: 'How do I cancel my subscription?',
    category: 'Billing',
    source: cancelSubscription,
  },
  {
    slug: 'contact-support',
    title: 'How do I contact support?',
    category: 'Getting Started',
    source: contactSupport,
  },
]

export function findHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug)
}
