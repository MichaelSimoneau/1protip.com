name: Unify Backend Feed Strategy
overview: This plan consolidates the backend strategy for fetching the LinkedIn feed. It deprecates the approach of using a client-side service token (`linkedin_hashtag_feed_57612232.plan.md`) in favor of a secure, serverless proxy function (`firebase_proxy_for_linkedin_feed_111e8217.plan.md`). The application already uses Supabase Edge Functions for authentication, so the same pattern should be used for feed fetching to ensure consistency and security.
todos:
  - id: choose-platform
    content: "Decide between Supabase Edge Functions and Firebase Cloud Functions for the proxy."
    status: pending
  - id: implement-proxy
    content: "Implement the chosen serverless function to fetch the LinkedIn feed using server-side secrets."
    status: pending
  - id: deprecate-conflicting-plan
    content: "Mark the `linkedin_hashtag_feed_57612232.plan.md` as obsolete."
    status: pending
  - id: update-client
    content: "Update the client-side feed fetching logic to call the new proxy endpoint."
    status: pending
---

# Unify Backend Feed Strategy

## Rationale

There are two conflicting plans for fetching the LinkedIn feed:
1.  **Direct Client Call (`linkedin_hashtag_feed_57612232.plan.md`):** Involves using a service token directly on the client. This is insecure as it exposes long-lived credentials.
2.  **Serverless Proxy (`firebase_proxy_for_linkedin_feed_111e8217.plan.md`):** Involves a backend function that holds the secrets and proxies requests to LinkedIn. This is the standard, secure approach.

This plan officially adopts the **Serverless Proxy** approach.

## Recommended Platform

The project already uses **Supabase Edge Functions** for handling the LinkedIn OAuth exchange (`linkedin-oauth-exchange`) and profile fetching (`linkedin-get-profile`). To maintain consistency in the architecture and tooling, the feed fetching proxy should also be implemented as a Supabase Edge Function (e.g., `linkedin-get-posts`).

This provides a single backend provider and simplifies environment variable and secret management. The existing `firebase_proxy_for_linkedin_feed` plan should be adapted to use Supabase instead of Firebase unless there is a compelling reason to introduce a second backend provider.

## Action Items

1.  **Consolidate on Supabase:** The feed-fetching logic should be implemented in the existing `supabase/functions/linkedin-get-posts/index.ts` function. This function must be secured to only respond to authenticated Supabase users.
2.  **Deprecate Conflicting Plans:**
    - The `linkedin_hashtag_feed_57612232.plan.md` is now obsolete.
    - The `firebase_proxy_for_linkedin_feed_111e8217.plan.md` should be merged into this strategy, with the implementation targeting Supabase instead of Firebase.
3.  **Update Client:** The `useFeed` hook and associated services must be updated to call the `linkedin-get-posts` Supabase function.
