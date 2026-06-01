# web-strata-reports

React 18 + TypeScript SPA for StrataReport AI. Vite + MUI v6 + RTK Query.

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
