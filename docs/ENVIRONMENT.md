# Environment Configuration

Set the following environment variables for all builds (local and EAS):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_SECRET_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_LINKEDIN_CLIENT_ID`
- `EXPO_PUBLIC_LINKEDIN_REDIRECT_URI`
- `EXPO_SECRET_LINKEDIN_CLIENT_SECRET` (for Expo build tooling; do not ship to client)

Supabase Edge Function secrets (configure in Supabase dashboard, not in the app bundle):

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_SERVICE_ACCESS_TOKEN` (service token to fetch posts without user session)
- `LINKEDIN_SERVICE_PROFILE_ID` (URN or numeric id used for service fetch)
- `LINKEDIN_SERVICE_AUTHOR_NAME` (optional display name for service fetch)
- `LINKEDIN_SERVICE_AVATAR_URL` (optional avatar URL for service fetch)
- `LINKEDIN_SERVICE_HASHTAGS` (optional comma-separated hashtags; defaults to #1protip)

For EAS, create secrets (example):

- `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <value>`
- `eas secret:create --scope project --name EXPO_SECRET_SUPABASE_ANON_KEY --value <value>`
- `eas secret:create --scope project --name EXPO_PUBLIC_LINKEDIN_CLIENT_ID --value <value>`
- `eas secret:create --scope project --name EXPO_PUBLIC_LINKEDIN_REDIRECT_URI --value <value>`
- `eas secret:create --scope project --name EXPO_SECRET_LINKEDIN_CLIENT_SECRET --value <value>`

Configure Supabase Edge secrets via the Supabase dashboard (or `supabase secrets set`) using `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.

For unauthenticated LinkedIn feed syncing, also set `LINKEDIN_SERVICE_*` secrets in Supabase so `linkedin-get-posts` can run without a logged-in user.

For local development, copy `env.example` to `.env` and fill the values.

