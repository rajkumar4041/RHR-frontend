# RHR HRMS — Frontend

Enterprise HRMS SaaS web client. React 18 · TypeScript · Vite · MUI 6 ·
TanStack Query · Axios · Zustand · Formik + Yup · React Router.

## Status

Foundation complete and verified (Phase 5):

- Vite + TS project, `@/` path alias, dev proxy to the backend.
- MUI theme, `CssBaseline`, app providers (Theme + QueryClient + Router).
- Axios client with Bearer injection and **single-flight 401 refresh-token
  rotation**; falls back to logout on refresh failure.
- Zustand auth store (persisted tokens + user).
- Auth flow: **Login** and **Register-company** screens (Formik + Yup),
  wired to real backend endpoints.
- Protected routes (client guard is UX; the backend enforces authorization),
  app shell (responsive drawer + app bar + user menu + logout),
  permission-aware navigation, dashboard, honest "coming soon" placeholders
  for modules still to be built.

## Prerequisites

- Node 18+ and npm
- The RHR backend running (default proxy target `http://localhost:8081`)

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (or next free port)
```

`/api/*` is proxied to the backend in dev (see `vite.config.ts`), so there are
no CORS issues. For a non-default backend, set `VITE_API_BASE_URL`.

```bash
npm run build       # tsc + vite production build
npm run type-check  # types only
```

## Layout

```
src/
  app/            providers, router, nav config, layout shell
  components/     ProtectedRoute, ComingSoonPage
  features/
    auth/         login + register pages, authApi hooks, AuthShell
    dashboard/    dashboard
  lib/            axios client, query client
  stores/         zustand auth store
  theme/          MUI theme
  types/          API envelope + DTO types
```

Verified: register-company, login, `/me`, and refresh rotation all work
end-to-end through the dev proxy against the backend.
