# CLAUDE.md — web-strata-reports coding standards

## Project overview

React 18 + TypeScript SPA for StrataReport AI. MUI v6, RTK Query, React Router v6, Vite.

## Build must pass before opening a PR

Always run `npm run build` (runs `tsc -b && vite build`) and fix **all** errors before committing. Do not open a PR with build errors.

## TypeScript strict mode — unused variables are errors

`tsconfig.app.json` sets `"noUnusedLocals": true` and `"noUnusedParameters": true`.
**Every declared variable, constant, and parameter must be used.** If you define `const SIDEBAR_WIDTH = 240` you must reference it — or don't declare it at all. The build will fail with `TS6133` otherwise.

If you need to suppress a specific unused parameter (e.g., an event handler callback), prefix it with `_`:
```ts
onChange={(_event, value) => setValue(value)}
```

## Available packages — do not add new ones

Only use packages already in `package.json`. Key libraries:
- **MUI v6**: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`
- **Routing**: `react-router-dom` v6 — use `useNavigate`, `useLocation`, `<Outlet />`
- **State**: `@reduxjs/toolkit`, `react-redux` — RTK Query for API calls, `authSlice` for auth state
- **React**: v18 with `react-dom`

Do NOT install `axios`, `react-query`, `zustand`, `styled-components`, or any other packages.

## MUI layout rules

- Use `Grid2` and `Stack` — never legacy `Grid` (v1)
- Never use fixed pixel widths on shell elements — use `sx` with theme breakpoints
- Sidebar/drawer width: use the numeric value inline or define a module-level constant **and use it**
- Responsive breakpoints: `theme.breakpoints.down('sm')` for mobile, `up('md')` for desktop

## Routing pattern

```tsx
// Protected routes wrap with <ProtectedRoute>
// Unauthenticated users → /auth/signin
// Authenticated users on /auth/* → /dashboard
```

## API calls

Use RTK Query slices in `src/store/`. Base URL is `/api` (proxied by SWA in prod, Vite proxy in dev).
Never use `fetch` or `axios` directly in components.

## File structure

```
src/
  components/layout/    AppShell, BottomNav, Sidebar, TopBar
  components/routing/   ProtectedRoute
  pages/                one file per route
  store/                store.ts, authSlice.ts, *Api.ts slices
```
