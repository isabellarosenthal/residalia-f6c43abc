# AGENTS.md

## Cursor Cloud specific instructions

This is **Residalia**, a single-product (not a monorepo) TanStack Start + React 19 + Vite condominium/property-management SaaS, deployed to Cloudflare Workers. The backend is hosted **Supabase** (Postgres + Auth + RLS); credentials are committed in `.env`, so there is **no local database to run** — the app talks to the cloud Supabase project directly.

### Package manager & tooling
- The package manager is **Bun** (`bunfig.toml` + `bun.lock`). A `package-lock.json` also exists, but prefer Bun for consistency with the lockfile. Bun installs to `~/.bun/bin` and is on `PATH` via `~/.bashrc`.
- `bunfig.toml` sets `minimumReleaseAge = 86400` (skips packages published <24h ago). This is a supply-chain guard; do not remove it.

### Services (only one local process)
| Service | Required | Command | Notes |
|---|---|---|---|
| Web app (Vite / TanStack Start SSR) | Yes | `bun run dev` | Serves frontend + SSR server functions. Talks to hosted Supabase. |

- The dev server listens on **port 8080** (host/port are managed internally by `@lovable.dev/vite-tanstack-config`'s sandbox detection — not configurable in repo). Vite's usual 5173 is overridden.
- Other scripts: `bun run build` (Vite + Nitro Cloudflare build, ~13s), `bun run preview`, `bun run lint` (eslint), `bun run format` (prettier).

### Non-obvious caveats
- **Lint is noisy by default**: `bun run lint` currently reports thousands of pre-existing `prettier/prettier` formatting errors across the existing codebase. This is the repo's existing state, not a setup problem. Don't try to mass-fix formatting unless asked; scope lint review to files you change.
- **Auth/signup works against hosted Supabase**: email/password admin signup at `/login` (switch to "Crear una") creates an account and lands on `/dashboard` with an onboarding modal — email confirmation is not required. Resident signup requires an invitation code from an admin. Google OAuth uses Lovable Cloud and may not complete in a headless/sandboxed browser.
- `vite.config.ts` warns: do NOT manually add tanstackStart/react/tailwind/cloudflare plugins — `@lovable.dev/vite-tanstack-config` already includes them; duplicates break the app.
- Optional env vars referenced in code but absent from `.env`: `SUPABASE_SERVICE_ROLE_KEY` (admin server client) and `RESIDENT_QR_SECRET` (falls back to a default). Not needed for normal dev/testing.
