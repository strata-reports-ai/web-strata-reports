# Mobile Core Flow QA Checklist

> Pre-launch mobile verification for the five core flows of StrataReport AI, as
> required by PRD section 18.2. Complements the 360px no-horizontal-scroll audit
> tracked in
> [strata-reports-ai/orchestrator-strata-reports#138](https://github.com/strata-reports-ai/orchestrator-strata-reports/issues/138).
>
> The Playwright companion script lives at `tests/mobile/core-flows.spec.ts` and
> captures one screenshot per checklist step into `test-results/mobile/`. Run it
> with `npm run test:mobile` against staging; it is **not** part of the default
> CI pipeline.

## Tester metadata

| Field                          | Value |
| ------------------------------ | ----- |
| Tester name                    |       |
| Date (YYYY-MM-DD)              |       |
| Build / commit SHA under test  |       |
| Staging URL                    |       |
| iOS device + Safari version    |       |
| Android device + Chrome version|       |

## Viewport spot-check

Before exercising the flows below, open the staging app in mobile browser dev
tools (or on device) and spot-check each of the listed viewport widths for the
following pages: `/auth/signup`, `/dashboard`, `/properties`, `/imports`,
`/reports`. Confirm there is no horizontal scroll, no clipped CTAs, and no
overlapping UI. This re-runs the audit from
[#138](https://github.com/strata-reports-ai/orchestrator-strata-reports/issues/138)
at the three target widths.

| Viewport width | iOS Safari | Chrome Android |
| -------------- | :--------: | :------------: |
| 360px          |   [ ]      |     [ ]        |
| 390px          |   [ ]      |     [ ]        |
| 414px          |   [ ]      |     [ ]        |

## Legend

- `[ ]` not yet verified
- `[P]` pass
- `[F]` fail (raise an issue and link it in the notes column)

Each step lists a screenshot ID; the Playwright script saves the matching file
to `test-results/mobile/<browser>/<screenshot-id>.png` so manual and automated
captures can be cross-referenced.

---

## Flow 1 — Signup

Verifies a new tenant can sign up from a cold start on mobile.

| #   | Step                                                                                                          | Expected outcome                                                                       | Screenshot ID            | iOS Safari | Chrome Android | Notes |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ | :--------: | :------------: | ----- |
| 1.1 | Open staging URL in a fresh private tab and navigate to `/auth/signup`.                                       | Signup form renders with email, password, organisation name, and submit visible.       | `signup-01-form`         |   [ ]      |     [ ]        |       |
| 1.2 | Tap each input in order and confirm the on-screen keyboard does not obscure the field or the submit CTA.      | Inputs scroll into view above the keyboard; no field is hidden.                        | `signup-02-keyboard`     |   [ ]      |     [ ]        |       |
| 1.3 | Submit invalid credentials (e.g. weak password) and observe validation messaging.                             | Inline validation appears, submit button remains accessible, no layout shift overflow. | `signup-03-validation`   |   [ ]      |     [ ]        |       |
| 1.4 | Submit valid credentials and wait for redirect.                                                               | User lands on `/onboarding/welcome` (or `/dashboard` if onboarding skipped).           | `signup-04-redirect`     |   [ ]      |     [ ]        |       |

## Flow 2 — Add property

Verifies that an authenticated user can add a property from mobile.

| #   | Step                                                                                                                  | Expected outcome                                                                          | Screenshot ID                 | iOS Safari | Chrome Android | Notes |
| --- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------- | :--------: | :------------: | ----- |
| 2.1 | From the dashboard, open the bottom nav and tap **Properties**.                                                       | Properties list renders; bottom nav remains visible and fixed.                            | `addproperty-01-list`         |   [ ]      |     [ ]        |       |
| 2.2 | Tap the **Add property** CTA (FAB or list-level button).                                                              | Navigates to `/properties/new`; the back affordance is reachable with the thumb.          | `addproperty-02-form`         |   [ ]      |     [ ]        |       |
| 2.3 | Fill in name, address, and any required fields. Confirm autocomplete suggestions do not push the submit button off-screen. | All inputs reachable; submit button visible without horizontal scrolling.            | `addproperty-03-filled`       |   [ ]      |     [ ]        |       |
| 2.4 | Submit the form.                                                                                                      | Redirects to the property detail page or properties list with the new property visible.   | `addproperty-04-confirmation` |   [ ]      |     [ ]        |       |

## Flow 3 — Upload CSV

Verifies that the import flow works from a mobile browser, including file picker.

| #   | Step                                                                                                                        | Expected outcome                                                                        | Screenshot ID            | iOS Safari | Chrome Android | Notes |
| --- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------ | :--------: | :------------: | ----- |
| 3.1 | Navigate to `/imports` via the bottom nav.                                                                                  | Imports landing page renders; primary CTA visible.                                      | `upload-01-landing`      |   [ ]      |     [ ]        |       |
| 3.2 | Tap **Upload CSV** and choose a sample lots CSV from device storage / Files app.                                            | Native file picker opens; selection returns to the app without losing route state.      | `upload-02-picker`       |   [ ]      |     [ ]        |       |
| 3.3 | Wait for parsing and confirm the column-mapping screen renders without horizontal scroll.                                   | Mapping table is tappable; required columns are highlighted.                            | `upload-03-mapping`      |   [ ]      |     [ ]        |       |
| 3.4 | Confirm mapping and submit the import.                                                                                      | Success toast/snackbar appears; user sees the import listed with status `Completed`.    | `upload-04-success`      |   [ ]      |     [ ]        |       |

## Flow 4 — Generate report

Verifies that a report can be generated end-to-end on mobile.

| #   | Step                                                                                                              | Expected outcome                                                                       | Screenshot ID            | iOS Safari | Chrome Android | Notes |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ | :--------: | :------------: | ----- |
| 4.1 | Navigate to `/reports` and tap **New report**.                                                                    | Generate report form renders at `/reports/new`.                                        | `report-01-form`         |   [ ]      |     [ ]        |       |
| 4.2 | Pick a property, report type, and period. Confirm pickers (selects/date pickers) are usable with thumb input.     | Each picker opens, selects correctly, and dismisses without trapping focus.            | `report-02-inputs`       |   [ ]      |     [ ]        |       |
| 4.3 | Submit the form.                                                                                                  | Redirects to the report detail page in `Pending`/`In Progress` state.                  | `report-03-pending`      |   [ ]      |     [ ]        |       |
| 4.4 | Wait for status polling to mark the report as `Ready` (max 5 minutes per PRD).                                    | Status badge updates without a manual reload; ready CTA appears.                       | `report-04-ready`        |   [ ]      |     [ ]        |       |

## Flow 5 — View PDF

Verifies the user can open and view the generated report PDF on mobile.

| #   | Step                                                                                                          | Expected outcome                                                                            | Screenshot ID         | iOS Safari | Chrome Android | Notes |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------- | :--------: | :------------: | ----- |
| 5.1 | From the ready report, tap **View PDF**.                                                                      | Browser opens the PDF either inline or in the native viewer; no broken tab.                 | `pdf-01-open`         |   [ ]      |     [ ]        |       |
| 5.2 | Verify the first page renders legibly and pinch-to-zoom works.                                                | Text is sharp; zoom gesture works; no horizontal scroll on the surrounding page chrome.     | `pdf-02-zoom`         |   [ ]      |     [ ]        |       |
| 5.3 | Use the browser back affordance to return to the report detail page.                                          | App state is preserved; user is back on `/reports/:id` with the report still `Ready`.       | `pdf-03-back`         |   [ ]      |     [ ]        |       |
| 5.4 | Tap **Download** (where available) and confirm the file lands in the device's downloads.                      | Download completes; file opens from the downloads tray/Files app.                           | `pdf-04-download`     |   [ ]      |     [ ]        |       |

---

## Sign-off

| Role             | Name | Signature / approval link | Date |
| ---------------- | ---- | ------------------------- | ---- |
| QA owner         |      |                           |      |
| Engineering lead |      |                           |      |
| Product owner    |      |                           |      |

Once all rows are marked `[P]` on both browsers and the viewport spot-check
passes, attach this completed checklist plus the captured screenshots to the
launch readiness ticket.
