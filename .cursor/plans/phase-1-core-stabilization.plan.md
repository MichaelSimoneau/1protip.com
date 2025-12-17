# Phase 1: Core Auth & Foundation Stabilization

This phase focuses on fixing the broken authentication flow and solidifying the backend architecture.

## Goals

- Fix `CommandError: You're currently using the bare workflow, where runtime version policies are not supported.` by setting `runtimeVersion` manually in `app.json`.
- Fix `eas.json` validation errors (remove invalid cache config).
- Remove deprecated `buildNumber` and `versionCode` from `app.json` when using remote versioning.
- Ensure LinkedIn OAuth works correctly in both development and production builds.
- Ensure `sync-secrets.js` correctly propagates secrets.

## Todos

- [x] Fix `eas.json` validation errors.
- [x] Remove `buildNumber` and `versionCode` from `app.json`.
- [x] Ensure `runtimeVersion` is set to a string in `app.json`.
- [x] Verify LinkedIn OAuth flow end-to-end.
- [x] Ensure secrets syncing is reliable.