---
name: linkedin-integration-plan
overview: Implement and verify LinkedIn OAuth + feed syncing per existing docs, ensuring env/secrets, edge functions, and client flows are wired and documented.
todos:
  - id: review-state
    content: Inspect existing LinkedIn auth/feed code and edge functions
    status: completed
  - id: env-secrets
    content: Prepare env variables and Supabase secrets for LinkedIn
    status: completed
  - id: edge-funcs
    content: Ensure oauth/profile/posts edge functions meet requirements
    status: in_progress
  - id: client-flow
    content: Confirm Settings connect flow and Feed sync behaviour
    status: in_progress
  - id: overlord-log
    content: Update docs/overlord/COMMANDS.md with new directives
    status: pending
---

# LinkedIn Integration Implementation Plan

- Verify current LinkedIn code paths to understand gaps: `lib/linkedin.ts`, `features/auth/hooks/useLinkedInAuth.ts`, `supabase/functions/linkedin-*` (oauth-exchange, get-profile, get-posts), and feed hooks (`features/feed/hooks/useFeed.ts`).
- Configure credentials and secrets: add `.env` values (`EXPO_PUBLIC_LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `EXPO_PUBLIC_LINKEDIN_REDIRECT_URI`, Supabase keys) and mirror secrets in Supabase Edge settings (`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`).
- Confirm/adjust edge functions to align with docs: ensure oauth exchange handles redirect URIs/scopes, profile fetch stores `profile_id`/avatar, and post sync filters `#1ProTip` with deduping. The strategy for the `linkedin-get-posts` function is now defined in `unify-backend-feed-strategy_9f8e7d6c.plan.md`.
- Wire client flows: Settings “Connect LinkedIn” triggers OAuth and shows connection status; Feed uses edge function to sync posts and handles errors gracefully. The primary feed sync is currently blocked by an incorrect initial route. Fixing this is the first step and is tracked in the `auth-flow-fix.plan.md`.
- Document directives per overlord rule: append new instructions/decisions to `docs/overlord/COMMANDS.md` after changes.