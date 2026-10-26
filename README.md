# WymNet Frontend

React 19 + Vite + TypeScript frontend for WymNet AI Solutions & Automation. The
architecture and conventions are defined in [`architecture.md`](./architecture.md) —
read it before making structural changes.

## What exists today (Phase 0 + 1)

- **Public marketing website** — `/`, `/products`, `/products/:slug` (WymAssist,
  WymInsight, WymFlow), `/use-cases`, `/pricing`, `/about`, `/contact`, 404.
- **Authentication** — `/sign-in`, `/register` against the real backend, session
  restore on reload, single-flight token refresh, logout, route guards with safe
  return-to handling.
- **Dashboard shell** — `/dashboard` overview (real organization + entitlement
  data) and `/dashboard/products/:code` product landing pages. Navigation is
  driven by actual product entitlements.
- **Foundation** — typed API client with error normalization and token refresh,
  token store, design tokens + global styles, shared components, route-level
  error boundaries, Vitest + Testing Library tests.

The embeddable WymAssist widget is a planned separate entry point and is not
implemented yet.

## Layout

```text
src/
  app/            providers (Auth, Query), router, layouts, error boundaries
  features/
    auth/         forms, pages, schemas, services, types, tests
    marketing/    pages, components, content data, styles, tests
    dashboard/    shell components, overview + product pages, styles, tests
    organizations/ API + TanStack Query keys/hooks for org + entitlements
  shared/         api client + errors, auth storage/jwt, components, styles, config
  test/           vitest setup and render helpers
```

## Environment

Copy `.env.example` to `.env`:

| Variable             | Purpose                            | Default                 |
| -------------------- | ---------------------------------- | ----------------------- |
| `VITE_API_BASE_URL`  | Backend origin (no trailing slash) | `http://localhost:3000` |
| `VITE_CONTACT_EMAIL` | Contact-page `mailto:` destination | `hello@wymnet.ai`       |

All `VITE_*` values are public — never put secrets here.

## Commands

```bash
npm run dev            # Vite dev server (http://localhost:5173)
npm run build          # typecheck + production build
npm run typecheck      # tsc -b
npm run lint           # eslint
npm run format         # prettier --write
npm run format:check   # prettier --check
npm test               # vitest run
```

## Backend integration

The app calls the real Express backend (`../backend`). Contracts used:

- `POST /api/v1/auth/register` — creates the organization + admin user and
  returns tokens; this **is** the onboarding flow (no separate org-creation step
  exists — the backend has no standalone organization creation endpoint).
- `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`,
  `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- `GET /api/v1/organizations/:id` and
  `GET /api/v1/organizations/:id/products` (added in this phase for
  entitlement-aware navigation).

Refresh and logout send the **current access token in the Authorization header**
plus the refresh token in the body — matching the backend contract, which now
tolerates expired-but-valid access tokens on those two routes.

## Known gaps / limitations

- No live end-to-end verification yet — see the phase report.
- Contact page uses a real `mailto:` link; there is no contact-submission API.
- Pricing is contact-for-pricing; no billing/tier API exists.
- No email verification or password reset — the backend does not implement them.
- Tokens are stored in `localStorage` (the backend has no httpOnly-cookie
  contract); storage is isolated in `src/shared/auth/token-store.ts` for a
  future migration.
