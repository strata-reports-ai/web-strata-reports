/**
 * Parse a calendar-date string (`YYYY-MM-DD`, or the date portion of an ISO
 * timestamp) into a `Date` in the **local** timezone.
 *
 * `new Date('2026-01-01')` parses the string as UTC midnight, which renders as
 * the previous day — and previous quarter — in negative-offset timezones (e.g.
 * `2026-01-01` shows as Dec 31 2025 / Q4 2025 in US timezones). Building the
 * Date from explicit local parts keeps the intended calendar date intact.
 *
 * Use this for date-only fields (period start/end, last report/import dates).
 * Do NOT use it for true timestamps (createdAt, uploadedAt) — those carry a
 * time/zone and should be converted to local time as usual.
 */
export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}
