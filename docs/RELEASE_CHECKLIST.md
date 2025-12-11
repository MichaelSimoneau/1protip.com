# Release Checklist (iOS, Android, Web)

1) Preconditions
- Confirm `.env` from `env.example` is filled and secrets are set in EAS (`eas secret:list`).
- Ensure `app.json` version/buildNumber/versionCode are bumped and `updates.url` matches the project ID.
- Verify icons/splash assets and permissions (camera + read media).

2) Quality gates
- `npm run lint`
- `npm run typecheck`
- Manual smoke: launch app, camera/photo pick works, Supabase calls succeed.

3) Builds
- Development: `npm run build:dev` (or platform-specific)
- Preview: `npm run build:preview`
- Production: `npm run build:prod` (channels configured in `eas.json`)

4) Submissions
- iOS: fill `ascAppId` and `appleTeamId` in `eas.json`, then `eas submit --profile production --platform ios`
- Android: place `android-service-account.json`, then `eas submit --profile production --platform android`

5) OTA Updates
- Production channel: `npm run update:prod`
- Preview channel: `npm run update:preview`

6) Web deploy
- `npm run build:web` -> host `dist` (static output)

7) Monitoring & analytics
- Configure crash/error monitoring (e.g., Sentry) and analytics before release; ensure DSN/keys are set in EAS secrets.

8) Store metadata
- Update store listings (screenshots, privacy labels, contact info) and verify privacy permission text matches actual permissions.

