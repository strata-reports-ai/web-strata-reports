# What CSV files do I need?

StrataReport AI builds each report from three core CSV exports: a reservations file, an expenses file, and an optional financial transactions file from your accounting system. Together, these give the engine a complete picture of revenue, costs, and net operating performance for each property.

The reservations CSV should include one row per booking with the check-in date, check-out date, guest name (optional), nightly rate, cleaning fees, taxes, and the payout amount. The expenses CSV should include one row per transaction with a date, vendor or description, category, amount, and the property it applies to. If you connect QuickBooks, you can also drop in a chart-of-accounts export to ensure expense categories line up with your books.

You do not need to clean or reformat anything before uploading. The column-mapping wizard will detect common synonyms and ask you to confirm any ambiguous fields the first time you upload from a new source.

## Minimum required columns

- Reservations: check-in, check-out, payout amount.
- Expenses: date, amount, property.
- Optional: tax rate, channel fee, refund flag.
