# AGENTS.md

Guide for working on apps generated from **node-react-app-template** —
progmise React + Vite + Express deployable services.

## Architecture

Two halves — a React SPA and an Express server that serves it:

```
src/                        SPA (Vite → dist/) — feature-sliced layers:
  main.jsx                  entry, renders app/App
  app/App.jsx               shell — layout + composition
  domain/                   pure rules, no react/fetch imports
  application/              use cases as hooks (useSession, usePing…)
  infrastructure/api/       fetch wrapper + one module per API resource —
                            the ONLY place that knows endpoint URLs
  ui/
    components/             shared presentational components
    features/<name>/        feature screens/widgets (session/, …)
server/index.js             Express — serves dist/ + /api/*, OAuth, /api/health
public/                     static assets copied to dist/
```

Dependency rule (same idea as the APIs' hexagonal): `ui/` talks to
`application/` only; `application/` talks to `infrastructure/`; `domain/`
imports nothing. Components never call `fetch` directly.

Rules:
- The backend serves the built SPA — frontend fetches go to `/api/*`
  (same origin; `vite.config.js` proxies `/api` to :8080 in dev).
- No secrets in the browser — anything secret lives server-side
  (`GITHUB_CLIENT_SECRET` never reaches the SPA; the user token rides in an
  HttpOnly cookie).
- Config via env vars only — `.env.example` documents each var (no values);
  `PORT` is set by Vercel at runtime (default 8080).
- SPA fallback: extension-less paths return `index.html`; missing files
  (e.g. `/assets/*.js`) must 404, not serve HTML.

## Conventions

- ESM everywhere (`"type": "module"`); Express 5 (wildcards use named
  splats — `/api/gh/{*splat}`, not `/api/gh/*`).
- `oxlint` for lint (`npm run lint`); build is `npm run build` (vite → dist).
- Single root `Dockerfile` — CSA scans it and Vercel builds it too
  (project preset `Container`); runtime strips npm (its bundled deps
  carry known CVEs).

## CI/CD

All logic lives in `progmise/reusable-workflows` (`@v1`, `secrets: inherit`).
Callers here are thin — keep them that way. Version lives in
`package.json` (`validate-release.py --kind app` reads it).
Pipeline: `Setup → Build artifact → Build image → SAST ‖ SCA ‖ CSA →
Tracing → Summary`; release adds `Validate → CI → Publish Image → Release`
— **never deploys**; deploys run via Deploy (manual) or the orchestrator.
Every stage is optional-credential friendly (Publish/Deploy skip when
`DOCKER_USERNAME`/`VERCEL_PROJECT_ID` are unset).

## Verify before done

```bash
npm ci && npm run build
PORT=8123 node server/index.js &   # / → 200, /api/health → 200, /api/me → 401
docker build -t app:dev .          # when touching Dockerfile/runtime config
```

## Branches

`main` (releases) + `development` (integration). Work lands on
`<type>/<snake_description>` → PR to `development` → PR to `main`.
Types: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/`.
