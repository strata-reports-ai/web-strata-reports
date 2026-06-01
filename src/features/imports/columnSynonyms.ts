import type { ImportType } from '../../api/importSlice'

export interface ColumnSynonymEntry {
  canonical: string
  label: string
  synonyms: string[]
}

export const IMPORT_COLUMN_SYNONYMS: Record<ImportType, Record<string, ColumnSynonymEntry>> = {
  Revenue: {
    'revenue.booking_external_id': {
      canonical: 'revenue.booking_external_id',
      label: 'Booking ID',
      synonyms: ['Reservation ID', 'Booking ID', 'Confirmation Code'],
    },
    'revenue.check_in_date': {
      canonical: 'revenue.check_in_date',
      label: 'Check-in Date',
      synonyms: ['Check In', 'Arrival Date', 'Start Date', 'From'],
    },
    'revenue.amount': {
      canonical: 'revenue.amount',
      label: 'Amount',
      synonyms: ['Total', 'Gross', 'Revenue', 'Payout', 'Booking Total'],
    },
    'revenue.guest_name': {
      canonical: 'revenue.guest_name',
      label: 'Guest Name',
      synonyms: ['Guest', 'Customer', 'Booker'],
    },
  },
  Expenses: {
    'expenses.date': {
      canonical: 'expenses.date',
      label: 'Date',
      synonyms: ['Transaction Date', 'Posted Date', 'Expense Date'],
    },
    'expenses.amount': {
      canonical: 'expenses.amount',
      label: 'Amount',
      synonyms: ['Total', 'Cost', 'Spend', 'Debit'],
    },
    'expenses.category': {
      canonical: 'expenses.category',
      label: 'Category',
      synonyms: ['Type', 'Expense Type', 'Account', 'Class'],
    },
    'expenses.vendor': {
      canonical: 'expenses.vendor',
      label: 'Vendor',
      synonyms: ['Supplier', 'Payee', 'Merchant'],
    },
  },
  Tasks: {
    'tasks.task_id': {
      canonical: 'tasks.task_id',
      label: 'Task ID',
      synonyms: ['ID', 'Reference', 'Job ID', 'Work Order'],
    },
    'tasks.status': {
      canonical: 'tasks.status',
      label: 'Status',
      synonyms: ['State', 'Stage', 'Completion'],
    },
    'tasks.completed_at': {
      canonical: 'tasks.completed_at',
      label: 'Completed At',
      synonyms: ['Completed Date', 'Finished On', 'Close Date'],
    },
    'tasks.assignee': {
      canonical: 'tasks.assignee',
      label: 'Assignee',
      synonyms: ['Assigned To', 'Owner', 'Cleaner', 'Staff'],
    },
  },
  Reviews: {
    'reviews.rating': {
      canonical: 'reviews.rating',
      label: 'Rating',
      synonyms: ['Score', 'Stars', 'Overall Rating'],
    },
    'reviews.review_date': {
      canonical: 'reviews.review_date',
      label: 'Review Date',
      synonyms: ['Date', 'Submitted At', 'Posted Date'],
    },
    'reviews.guest_name': {
      canonical: 'reviews.guest_name',
      label: 'Guest Name',
      synonyms: ['Reviewer', 'Guest', 'Customer'],
    },
    'reviews.comment': {
      canonical: 'reviews.comment',
      label: 'Comment',
      synonyms: ['Review', 'Feedback', 'Text', 'Body'],
    },
  },
  Inspections: {
    'inspections.inspection_date': {
      canonical: 'inspections.inspection_date',
      label: 'Inspection Date',
      synonyms: ['Date', 'Performed On', 'Inspected At'],
    },
    'inspections.inspector': {
      canonical: 'inspections.inspector',
      label: 'Inspector',
      synonyms: ['Performed By', 'Assigned To', 'Staff'],
    },
    'inspections.result': {
      canonical: 'inspections.result',
      label: 'Result',
      synonyms: ['Outcome', 'Status', 'Pass/Fail'],
    },
    'inspections.notes': {
      canonical: 'inspections.notes',
      label: 'Notes',
      synonyms: ['Comments', 'Remarks', 'Findings'],
    },
  },
}

// Backend emits text matching: Could not find a column for '<name>'
// (see Story 3.2 AC). Capture group 1 is the missing column name.
const MISSING_COLUMN_REGEX = /[Cc]ould not find a column for ['"]([^'"]+)['"]/

export function extractMissingColumnName(errorSummary: string | null | undefined): string | null {
  if (!errorSummary) return null
  const match = errorSummary.match(MISSING_COLUMN_REGEX)
  return match ? match[1] : null
}

export function findColumnSynonymEntry(
  importType: ImportType,
  errorSummary: string | null | undefined,
): ColumnSynonymEntry | null {
  const missing = extractMissingColumnName(errorSummary)
  if (!missing) return null
  const typeMap = IMPORT_COLUMN_SYNONYMS[importType]
  if (!typeMap) return null

  const direct = typeMap[missing]
  if (direct) return direct

  const lowerMissing = missing.toLowerCase()
  for (const entry of Object.values(typeMap)) {
    if (
      entry.canonical.toLowerCase() === lowerMissing ||
      entry.label.toLowerCase() === lowerMissing ||
      entry.canonical.toLowerCase().endsWith('.' + lowerMissing)
    ) {
      return entry
    }
  }
  return null
}

export function templatePathForImportType(importType: ImportType): string {
  return `/templates/${importType.toLowerCase()}.csv`
}
