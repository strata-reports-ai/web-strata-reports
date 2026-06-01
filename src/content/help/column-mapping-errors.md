# How do I fix column-mapping errors?

When you upload a CSV with column headers that the engine does not recognise, the column-mapping wizard opens automatically. It shows each unmapped header on the left and a drop-down of standard StrataReport AI fields on the right. Pick the matching field for each header, then click "Apply mapping" to retry the upload.

The wizard remembers your choices for each source platform. The next time you upload a file with the same headers, the mapping is applied automatically and the wizard does not appear. If you need to change a saved mapping later, open the Imports page, click the gear icon next to the source name, and edit the mapping rules.

## Common cases

- "Reservation ID" vs "Booking ID" — both should map to the standard "Booking reference" field.
- "Gross earnings" vs "Net payout" — gross earnings includes fees and taxes; net payout is what hits your bank account. Pick whichever your accounting team treats as revenue, but be consistent across uploads.
- Property references — if your CSV uses a property short code that does not match a property name, add the short code as an alias on the property's detail page so future uploads map automatically.

If you cannot find a sensible target field for a header, you can mark it as "Ignore" to skip the column.
