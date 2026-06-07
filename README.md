# web-strata-reports

The frontend for **StrataReport AI** — a React 18 + TypeScript single-page app where short-term-rental property managers upload operational data and generate polished, owner-facing quarterly PDF reports in under two minutes. Part of the [StrataReport AI](https://github.com/strata-reports-ai/orchestrator-strata-reports) system (see that repo for the full architecture and the autonomous build pipeline that produced this code).

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **MUI v6** for components/theming
- **Redux Toolkit + RTK Query** for state and API data fetching
- **React Router 6** for routing
- **Playwright** for end-to-end tests
- Deployed to **Azure Static Web Apps**

## Features (by page)

- **Onboarding** — guided first-run: create a property, upload a CSV, generate a first report
- **Properties** — manage units (`PropertiesPage`, `PropertyDetailPage`, `PropertyFormPage`)
- **Imports** — upload and track CSV ingestion batches (`ImportsPage`)
- **Reports** — generate, list, and view quarterly owner reports with PDF download (`GenerateReportPage`, `ReportsListPage`, `ReportDetailPage`)
- **Billing** — Stripe-backed subscription management (`BillingSettingsPage`, `PricingPage`)
- **Settings** — profile, tenant, branding (logo upload), and team/invite management
- **Auth** — sign up, sign in, email verification, password reset (`SignUpPage`, `SignInPage`, `VerifyEmailPage`, `ForgotPasswordPage`, `ResetPasswordPage`)
- **Marketing site** — separate static marketing pages deployed alongside the app

## Project structure

```
src/
├── pages/        # Route-level screens (dashboard, reports, properties, settings, auth, onboarding)
├── features/     # Feature slices (RTK)
├── api/          # RTK Query API definitions (talks to fn-strata-reports /api)
├── components/   # Shared UI components
├── router/       # Route configuration
├── services/     # Cross-cutting services (analytics, etc.)
├── store/        # Redux store setup
├── hooks/        # Shared hooks
├── content/      # Static copy/content
└── theme.ts      # MUI theme
```

The SPA talks to the backend ([`fn-strata-reports`](https://github.com/strata-reports-ai/fn-strata-reports)) over `/api`. Auth uses httpOnly cookies set by the backend, so tokens are never stored in JS-accessible storage.

## Scripts

- `npm run dev` — start Vite dev server on port 3000 (proxies `/api` to `http://localhost:7071`).
- `npm run build` — typecheck (`tsc -b`) and produce a production build.
- `npm run lint` — run ESLint.
- `npm run preview` — preview the production build.
- `npm test` — run the Node-based unit tests (requires Node 22+ for `--experimental-strip-types`).

## Environment variables

All client-visible variables must be prefixed with `VITE_`. Define them in a `.env.local` for local development.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_HELP_CENTER_URL` | no | `https://help.strata-reports.ai` | URL the in-app Help menu links to. |
| `VITE_POSTHOG_KEY` | no | _(empty)_ | PostHog project API key. **When empty, PostHog is not initialised and no analytics network calls are made.** Leave empty for local development. |
| `VITE_POSTHOG_HOST` | no | `https://us.i.posthog.com` | PostHog ingestion host (use `https://eu.i.posthog.com` for EU cloud, or your self-hosted host). Only consulted when `VITE_POSTHOG_KEY` is set. |

### PostHog analytics

PostHog is initialised once from `src/main.tsx` using `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST`. When the key is empty PostHog never loads and `track()` becomes a no-op, keeping local/dev parity with production.

The frontend emits the following events from `src/services/analytics.ts`:

- `signup`, `login` — auth handlers
- `property_created` — onboarding add-property step
- `csv_uploaded` — onboarding CSV upload step
- `report_generation_started`, `report_generation_succeeded` — report flow
- `report_downloaded` — PDF download click
- `plan_changed` — Stripe Checkout completion redirect

The events `csv_processed` and `churned` are emitted server-side; the frontend only exports their string constants for reference.
