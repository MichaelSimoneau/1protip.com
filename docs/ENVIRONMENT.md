# Environment Configuration

Set the following environment variables for all builds (local and EAS):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_SECRET_SUPABASE_ANON_KEY`
- `EXPO_SECRET_LINKEDIN_CLIENT_SECRET`
- `EXPO_PUBLIC_LINKEDIN_CLIENT_ID`
- `EXPO_PUBLIC_LINKEDIN_REDIRECT_URI`

For EAS, create secrets (example):

- `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <value>`
- `eas secret:create --scope project --name EXPO_SECRET_SUPABASE_ANON_KEY --value <value>`
- `eas secret:create --scope project --name EXPO_SECRET_LINKEDIN_CLIENT_SECRET --value <value>`
- `eas secret:create --scope project --name EXPO_PUBLIC_LINKEDIN_CLIENT_ID --value <value>`
- `eas secret:create --scope project --name EXPO_PUBLIC_LINKEDIN_REDIRECT_URI --value <value>`

For local development, copy `env.example` to `.env` and fill the values.

