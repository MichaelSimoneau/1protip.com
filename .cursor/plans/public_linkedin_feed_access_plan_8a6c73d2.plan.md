---
name: Public LinkedIn Feed Access Plan
overview: '**DEPRECATED:** This plan is obsolete. See `deprecate-public-feed-plan_e1a2b3c4.plan.md`.'
---
---
name: Public LinkedIn Feed Access Plan
overview: Enable LinkedIn post syncing without Supabase login by using a single app-level LinkedIn credential/secret while keeping per-user auth flow intact for signed-in use.
todos:
  - id: secret-docs
    content: Clarify env/Supabase secrets for public LinkedIn fetch
    status: pending
  - id: edge-func-auth
    content: Add shared-token unauthenticated path to linkedin-get-posts
    status: pending
  - id: client-feed
    content: Confirm feed hook works without auth and with auth
    status: pending
  - id: overlord-update
    content: Log directive about public LinkedIn fetch in overlord doc
    status: pending
---

# Public LinkedIn Feed Access Plan

- Adjust env/secrets: keep client vars (`EXPO_PUBLIC_LINKEDIN_CLIENT_ID`, redirect URI) and restore a server-side secret accessible to edge functions (`LINKEDIN_CLIENT_SECRET` or `EXPO_SECRET_LINKEDIN_CLIENT_SECRET` if required by build). Document both `.env` and Supabase secrets, ensuring public feeds can run.
- Update `supabase/functions/linkedin-get-posts/index.ts` to support unauthenticated invocation using the shared LinkedIn token: allow a service invocation path that skips `auth.getUser`, loads the app-level token/author URN from secrets/config, and fetches posts even without a Supabase session while preserving per-user path when logged in.
- Ensure profile data handling: if unauthenticated, use configured author URN/name/avatar defaults; if authenticated, still hydrate from user profile and update Supabase where available.
- Verify client usage: `features/feed/hooks/useFeed.ts` should be able to call `linkedin-get-posts` without an active Supabase session (handle 200 response even when unauthenticated) and still load tips from Supabase.
- Update docs (ENVIRONMENT.md + overlord log) to reflect the unauthenticated/shared-token path and required secrets.