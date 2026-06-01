# StrataReport AI — Upptime status page

This directory contains the [Upptime](https://upptime.js.org) configuration that
powers the public status page at **https://status.strata-reports.com**.

Upptime is a GitHub-Actions-based uptime monitor: scheduled workflows run
HTTP checks against the endpoints listed in `.upptimerc.yml`, write the
uptime history into this repository, and publish a static Jekyll-style status
site to GitHub Pages.

The `status/` directory is fully isolated from the React SPA build — none of
these files affect `npm run build` or the production frontend deployment.

## Monitored endpoints

| Name | URL | Notes |
| --- | --- | --- |
| Marketing site | `https://strata-reports.com` | Public landing page |
| Frontend app | `https://app.strata-reports.com` | SPA root |
| Functions health probe | `https://app.strata-reports.com/api/health` | Expects HTTP 200 |
| Billing webhook | `https://app.strata-reports.com/api/billing/webhook` | `HEAD` only, expects HTTP 405 (Method Not Allowed) |

Health checks run on a **5-minute cadence** (`*/5 * * * *`).

## How to add a new endpoint

1. Edit `status/.upptimerc.yml`.
2. Append a new entry under the `sites:` list. Example:

   ```yaml
   - name: My new service
     url: https://example.strata-reports.com/api/something
     tags:
       - api
     expectedStatusCodes:
       - 200
   ```

   Optional fields:
   - `method:` — `GET` (default), `HEAD`, `POST`, etc.
   - `expectedStatusCodes:` — list of acceptable response codes.
   - `headers:` — list of `Key: value` strings for custom request headers.
   - `body:` — request body for POST/PUT checks.
   - `assignees:` — GitHub usernames notified on incident.

3. Open a PR. Once merged, the next scheduled run of the **Uptime CI**
   workflow will pick up the new endpoint and start recording history.

## Notifications

When a check transitions to **DOWN**:

1. Upptime automatically opens a new GitHub issue in this repository,
   labelled with the site name and `down`. The issue is updated when the
   check recovers and closed once stable.
2. An email notification is also sent via Postmark's SMTP relay using the
   `email` notifier defined in `.upptimerc.yml`. The destination address is
   read from the `NOTIFICATION_EMAIL` repository secret; the Postmark server
   token is read from `POSTMARK_SMTP_TOKEN`.

## Incidents

GitHub issues opened by Upptime **are** the incident records. Each issue
includes the down timestamp, the failing endpoint, and an automatically
updated comment thread showing recovery progress. Closing the issue marks
the incident resolved and contributes to the historical uptime data shown
on the status page.

For planned maintenance, create an issue manually with the label
`maintenance` — Upptime will surface it in the "Scheduled maintenance"
section of the status site.

## Required repository secrets

| Secret | Purpose |
| --- | --- |
| `GH_PAT` | Fine-scoped personal access token with `repo` access — Upptime uses this to commit history and open issues. |
| `NOTIFICATION_EMAIL` | Destination email address for outage notifications. |
| `POSTMARK_SMTP_TOKEN` | Postmark server token used as SMTP username + password for outbound email via `smtp.postmarkapp.com:587`. |

## Workflow files

| File | Schedule | Purpose |
| --- | --- | --- |
| `.github/workflows/uptime.yml` | `*/5 * * * *` | Run HTTP checks against every endpoint. |
| `.github/workflows/response-time.yml` | `0 23 * * *` | Record response-time samples. |
| `.github/workflows/summary.yml` | `0 0 * * *` | Update the repo-level README summary. |
| `.github/workflows/graphs.yml` | `0 0 * * *` | Regenerate uptime / response-time graphs. |
| `.github/workflows/static-site.yml` | `0 1 * * *` | Build and deploy the public status site to GitHub Pages. |

## Custom domain verification

After the first successful run of the **Static Site CI** workflow:

1. Confirm the `gh-pages` branch contains the rendered site.
2. In the repository **Settings → Pages**, set the custom domain to
   `status.strata-reports.com` (the `CNAME` file in this directory is
   committed for this purpose).
3. Add a `CNAME` DNS record pointing `status.strata-reports.com` to
   `strata-reports-ai.github.io`.
4. Wait for GitHub Pages to issue the TLS certificate, then visit
   <https://status.strata-reports.com> to confirm the page renders.
