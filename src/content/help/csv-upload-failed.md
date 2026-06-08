# Why did my CSV upload fail?

A failed upload almost always falls into one of three categories: the file format is not recognised, a required column is missing, or a row contains an unparseable value. The Imports page shows the specific error for each failed upload, including the row number where parsing stopped.

## File format issues

StayRecap accepts UTF-8 encoded CSV files up to 25 MB. If you exported your data as an Excel workbook (.xlsx), open it in your spreadsheet program and choose "Save as" or "Export" to produce a CSV. Tab-separated files and files with semicolon delimiters are also accepted; the engine auto-detects the delimiter from the first few rows.

## Missing required columns

Every reservations file needs at least a check-in date, a check-out date, and a payout amount. Every expenses file needs a date, an amount, and a property reference. If the column header does not exactly match a known synonym, you will be prompted to map it manually before the file is accepted.

## Unparseable values

Dates outside the range 2000–2099, payout amounts containing letters, and property references that do not match any property in your portfolio will cause individual rows to fail. The error report will list each problem row so you can correct the source and re-upload.
