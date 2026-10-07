# node-react-app-template

Template for **progmise** deployable web services — React + Vite SPA with an
Express (Node.js) backend, Docker image, and thin callers to the
[reusable-workflows](https://github.com/progmise/reusable-workflows) `app-*`
pipelines.

## What's inside

| Piece | Notes |
|---|---|
| React 19 + Vite | SPA in `src/` → `dist/` (base `/`) |
| Express 5 backend | `server/index.js` — serves `dist/` + `/api/*`; example `/api/ping` + `/api/health` |
| GitHub OAuth | `/api/auth/login` → callback → HttpOnly cookie `gh_token` → `/api/me`. Optional infra: needs `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`; the app runs without them (sign-in just won't complete) |
| Docker | Self-contained `Dockerfile` (npm build → node runtime, npm stripped from the final image); `Dockerfile.vercel` kept in sync for Vercel container deploys — **bump both together** |
| CI/CD | Thin callers in `.github/workflows` → `reusable-workflows` `app-*` `@v1` |

## Use this template

1. **Use this template** on GitHub → name the repo after the app.
2. Rename `name` in `package.json` and the `<title>`/`h1`.
3. Replace the `/api/ping` example with real endpoints + UI.
4. Update this README.

## Local development

```bash
cp .env.example .env   # GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET for sign-in (optional)
npm ci
npm run build
npm start              # http://localhost:8080

npm run dev            # vite dev server with /api proxy → :8080
```

## One-time setup (CI/CD)

Everything is **optional** — CI stays green with zero credentials:

- **Publish Image** (`DOCKER_USERNAME` var + `DOCKER_TOKEN` secret): pushes
  `docker.io/<DOCKER_USERNAME>/<repo>` — skipped when unset
- **Deploy** (`VERCEL_TOKEN` secret + `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`
  vars): Vercel — skipped when unset. The project's **Framework Preset must
  be `Container`** so `Dockerfile.vercel` is detected and all traffic routes
  to the built image
- **`DEPLOY_ENVIRONMENTS`** (var, JSON list, default `["pro"]`)
- **Tracing** (`GRAFANA_OTLP_ENDPOINT` var + `GRAFANA_OTLP_AUTH` secret)
- **OAuth** (Vercel project env vars, Production): `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET` — OAuth App callback:
  `https://<project>.vercel.app/api/auth/callback`

## Release & deploy

- **Release** (manual, `main`): bump `version` in `package.json`, run
  *Actions → Release*. Publishes `:<version>` + `:latest` to Docker Hub and
  creates the GitHub Release/tag. **Never deploys.**
- **Deploy** (manual): deploy any released `version` to one env
  (`pro`/`cert`/`pre`, must be in `DEPLOY_ENVIRONMENTS`) — or via the
  `deploy-manifest` orchestrator.
- **Integration** (on merge): CI + publishes `:<sha>` + `:edge`/`:latest`,
  deploys to non-pro envs.
- **CI Checks** (on PR): build, lint via `npm test --if-present`, SAST, SCA,
  container scan (CSA).
