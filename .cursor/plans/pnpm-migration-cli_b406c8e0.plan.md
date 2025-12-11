---
name: pnpm-migration-cli
overview: Switch Node tooling to pnpm and add a Python CLI that bootstraps/activates a local venv with project rc helpers.
todos:
  - id: document-directive
    content: Record pnpm+CLI directive in docs/overlord/COMMANDS.md
    status: pending
  - id: pnpm-migrate
    content: Add pnpm config, replace package-lock with pnpm-lock.yaml
    status: pending
  - id: ci-update-pnpm
    content: Switch CI workflow to pnpm install/lint/typecheck
    status: pending
  - id: python-cli
    content: Build cli/__init__.py with venv+rc activation and pnpm wrappers
    status: pending
  - id: docs-update
    content: Update README/QUICK_START for pnpm and CLI usage
    status: pending
---

# PNPM Migration & Local CLI

- Document this directive in `docs/overlord/COMMANDS.md` so the pnpm + Python CLI mandate is recorded per repo rules.
- Migrate Node tooling to pnpm: add `packageManager` (pnpm@9.x) in `package.json`, replace `package-lock.json` with `pnpm-lock.yaml` via `pnpm install`, and ignore `.venv`/pnpm store as needed.
- Update CI to pnpm in `.github/workflows/ci.yml` (setup pnpm, use pnpm cache, run `pnpm install`, `pnpm lint`, `pnpm typecheck`).
- Add Python CLI at `cli/__init__.py`: create/ensure `.venv`, expose commands (e.g., `bootstrap`, `install`, `dev`, `lint`, `typecheck`, `build`) that run pnpm via `corepack`; include `init-shell` to write project-local `.bashrc`/`.zshrc` snippets that auto-activate `.venv` when sourced; keep `.venv` untracked.
- Refresh docs (README/QUICK_START) to describe pnpm usage and the new CLI workflow, including sourcing the local rc files instead of