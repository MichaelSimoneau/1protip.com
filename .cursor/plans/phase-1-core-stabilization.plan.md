name: "Phase 1: Core Auth & Foundation Stabilization"
overview: This phase focuses on fixing the critical authentication bug and solidifying the project's foundational architecture. It ensures that the user is forced to authenticate before seeing any content, and it aligns the project's backend strategy towards a single, secure proxy pattern for all LinkedIn communications.
derived_from:
  - "auth-flow-fix_b4d4f3e2.plan.md"
  - "unify-backend-feed-strategy_9f8e7d6c.plan.md"
  - "linkedin-integration-plan_c0b4d5c9.plan.md"
todos:
  - id: fix-initial-route
    content: "Change `initialRouteName` in `app/(tabs)/_layout.tsx` from `feed` to `index`."
    status: pending
  - id: choose-backend-platform
    content: "Formally decide between Supabase Edge Functions and Firebase Cloud Functions for the feed proxy (Supabase recommended)."
    status: pending
  - id: implement-proxy-prototype
    content: "Implement a basic version of the chosen serverless function to fetch the LinkedIn feed."
    status: pending
  - id: verify-auth-flow
    content: "Manually verify that the app correctly opens to the login screen and navigates to the feed after successful authentication."
    status: pending
---

# Phase 1: Core Auth & Foundation Stabilization

This is the first and most critical phase of the project. The primary goal is to create a stable, secure, and usable foundation upon which all other features can be built.

## Key Objectives

1.  **Correct the User Flow:** The immediate priority is to fix the bug where unauthenticated users bypass the login screen. This involves a simple but critical code change.
2.  **Solidify Backend Strategy:** The project has conflicting plans for fetching data. This phase makes a definitive choice to use a secure serverless proxy, aligning with modern best practices and existing patterns in the codebase (Supabase for OAuth).

## Tasks (To-Do)

- **`fix-initial-route`**: The core task from `auth-flow-fix_b4d4f3e2.plan.md`. Change `initialRouteName` in `app/(tabs)/_layout.tsx` to point to `index`.
- **`choose-backend-platform`**: A decision derived from `unify-backend-feed-strategy_9f8e7d6c.plan.md`. Although Supabase is recommended for consistency, this task formalizes the decision.
- **`implement-proxy-prototype`**: Begin implementing the backend proxy. This doesn't have to be the full, paginated version, but a simple function that proves the connection can be made securely from the backend.
- **`verify-auth-flow`**: After the initial route is fixed, a manual test must be performed to confirm the entire login-to-feed flow works as expected.
