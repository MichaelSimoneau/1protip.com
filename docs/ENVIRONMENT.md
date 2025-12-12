# Environment Configuration

Set the following LinkedIn environment variables for all builds:

- `EXPO_PUBLIC_LINKEDIN_CLIENT_ID`
- `EXPO_SECRET_LINKEDIN_CLIENT_SECRET` (do not bundle in client)
- `EXPO_PUBLIC_LINKEDIN_REDIRECT_URI` (must match a LinkedIn-registered redirect)

Supported redirect values (pick one per environment):
- Web/local: `http://localhost:8081/auth/linkedin/callback`
- Expo Go / simulator: `exp://localhost:8081/--/auth/linkedin/callback`
- Production web: `https://1protip.com/auth/linkedin/callback` (or `https://app.1protip.com/auth/linkedin/callback`)

Aliases `EXPO_PUBLIC_CLIENT_ID` and `EXPO_SECRET_CLIENT_SECRET` are accepted by `scripts/sync-secrets.js` but prefer the canonical keys above.

GitHub/Firebase secrets:
- Use `scripts/sync-secrets.js` to push `EXPO_PUBLIC_LINKEDIN_CLIENT_ID`, `EXPO_SECRET_LINKEDIN_CLIENT_SECRET`, and `EXPO_PUBLIC_LINKEDIN_REDIRECT_URI` to GitHub and Firebase Functions secrets.
- `.github/workflows/deploy.yml` expects these secrets to be defined in the repository.

For local development, copy `env.example` to `.env` (or app-specific `.env`) and fill the values before running.

