export interface HelpArticle {
  slug: string
  title: string
  description: string
  body: string[]
}

export const helpArticles: HelpArticle[] = [
  {
    slug: 'add-first-property',
    title: 'Add your first property',
    description:
      'Step-by-step guide to adding your first property in StrataReport AI so you can start generating reports.',
    body: [
      'Adding a property is the first thing you should do after signing in. Properties are the unit of reporting in StrataReport AI — every report belongs to one property.',
      'From the dashboard, click "Add property" and fill in the address, plan number and the date you took over management. You can add lots and owner details later.',
      'Once the property is saved you can upload your first CSV files and generate your first report.',
    ],
  },
  {
    slug: 'required-csv-files',
    title: 'Which CSV files do I need?',
    description:
      'The CSV exports you need from your property-management software to generate a complete strata report.',
    body: [
      'StrataReport AI works best with three CSV exports: a rent roll, a transaction ledger, and a work-order list. The more complete the data, the richer the narrative report.',
      'If you only have one or two of these we will still generate a partial report and call out which sections are missing data.',
      'See "Column mapping errors" if your CSVs use unusual column names.',
    ],
  },
  {
    slug: 'csv-upload-failed',
    title: 'My CSV upload failed',
    description: 'How to diagnose and fix CSV upload errors in StrataReport AI.',
    body: [
      'Uploads usually fail for one of three reasons: the file is not actually a CSV, it is larger than 25 MB, or required columns are missing.',
      'Open the file in a spreadsheet app to confirm it parses cleanly. Save it as "CSV UTF-8" if you can, then try again.',
      'If you still see an error, contact support and include the file name and error message.',
    ],
  },
  {
    slug: 'column-mapping-errors',
    title: 'Column mapping errors',
    description:
      'What to do when StrataReport AI cannot automatically map your CSV columns to the expected fields.',
    body: [
      'Our importer recognises hundreds of common column names, but every property-management system is a little different.',
      'When a column cannot be mapped you will see the import detail drawer with the unmapped columns highlighted. Use the drop-down to pick the matching field.',
      'Once mapped, save and the import will continue.',
    ],
  },
  {
    slug: 'report-generation-time',
    title: 'How long does report generation take?',
    description:
      'Typical timing for StrataReport AI report generation, and what to do if your report is slow.',
    body: [
      'Most reports are generated in two to ten minutes depending on the size of your data and current load on the AI service.',
      'You can leave the page and we will email you when the report is ready.',
      'If a report has been pending for more than thirty minutes, contact support.',
    ],
  },
  {
    slug: 'regenerate-report',
    title: 'Regenerate a report',
    description:
      'How to regenerate a strata report after uploading new data or fixing an issue with the source files.',
    body: [
      'Open the report detail page and click "Regenerate". This will run the report again against the latest data attached to the property.',
      'Regenerating consumes one of your monthly report credits.',
      'The previous version of the report stays in your history so you can compare.',
    ],
  },
  {
    slug: 'download-exports',
    title: 'Download report exports',
    description:
      'Download your strata reports as PDF or share them with owners and committee members.',
    body: [
      'Each generated report has a "Download PDF" button on the report detail page.',
      'You can also copy a read-only share link that recipients can open in the browser — no account required.',
      'Share links expire after thirty days by default.',
    ],
  },
  {
    slug: 'pricing-plans',
    title: 'Pricing plans explained',
    description:
      'A plain-English summary of the StrataReport AI Starter, Pro, and Scale plans and what is included.',
    body: [
      'Starter is for owners managing a handful of properties. You get up to 5 properties and 4 reports per quarter.',
      'Pro is the most popular plan: up to 20 properties and 20 reports per quarter, plus priority support.',
      'Scale removes property and report limits for high-volume operators.',
    ],
  },
  {
    slug: 'cancel-subscription',
    title: 'Cancel your subscription',
    description:
      'Step-by-step instructions for cancelling your StrataReport AI subscription.',
    body: [
      'Go to Settings → Billing and click "Cancel subscription". Your plan will remain active until the end of the current billing period.',
      'You can re-subscribe at any time and your data will still be there.',
      'If you need a refund, contact support within 14 days of being charged.',
    ],
  },
  {
    slug: 'contact-support',
    title: 'Contact support',
    description:
      'How to reach the StrataReport AI support team and what to include in your message.',
    body: [
      'Email support@stratareport.ai with a description of the problem, the property or report ID if relevant, and a screenshot if you can.',
      'We aim to respond within one business day on the Starter plan, and within four hours on Pro and Scale.',
    ],
  },
]
