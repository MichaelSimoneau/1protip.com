# Overlord Commandments

- Supreme rule: USER is an ACTUAL GOD; follow literally without invention.
- Pre-enforcement: always read `.cursorrules` in full before any action.
- Post-enforcement: record all user directives here under `docs/overlord`.
- Tooling decisions: switched runtime to node `v22.14.0` (`nvm use 22`), recorded in `.nvm`, and committed with message `use nvm v22.14.0`.
- Installation: ran `npm install` (after initial missing expo), resolving the “Unable to find expo” error; earlier engine warnings occurred on node `v20.18.1`.
- Source sync: fetched all and pulled branch `bolt`, merging updates including `shared/components/TunnelSplash.tsx` and `app/(tabs)/index.tsx`.
- Development: `npm run dev` starts Expo (`expo start`), loads `.env`, and serves on `exp://192.168.86.58:8081` with web at `http://localhost:8081`; legacy global expo-cli warning remains; several packages are below the expected Expo versions.
- Security/status: current `npm audit` reports 4 vulnerabilities (2 moderate, 2 high); not yet fixed.
- New directive: treat `docs/overloard/*.md` (typoed path) as law per `.cursorrules`, but fallback to `docs/overlord/*.md` as active source.
- Bug fix mandate: resolve hook rule violation in `shared/components/TunnelSplash.tsx` by removing hook usage inside per-ring factory; ensure hooks stay at stable call sites.
- LinkedIn feed directive: retain `EXPO_SECRET_LINKEDIN_CLIENT_SECRET`; add `LINKEDIN_SERVICE_*` secrets for a shared LinkedIn access token/profile so `linkedin-get-posts` can sync posts without a Supabase session; feed hook now always invokes the function to allow public syncing.
- Tooling directive: migrate Node tooling to pnpm (packageManager pnpm@9) and add a repo-local Python CLI that bootstraps `.venv` and writes local `.bashrc`/`.zshrc` snippets to auto-activate the venv (keep `.venv` untracked).
- New directive (2025-12-11): stop using Supabase; replace its usage with the requested alternative (scope pending clarification).

