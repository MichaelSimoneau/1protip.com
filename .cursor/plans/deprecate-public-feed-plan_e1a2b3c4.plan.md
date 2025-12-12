name: Deprecate Public LinkedIn Feed Access
overview: This plan officially deprecates the 'Public LinkedIn Feed Access Plan' (`public_linkedin_feed_access_plan_8a6c73d2.plan.md`). The concept of an unauthenticated feed directly contradicts the core architectural requirement of an "auth-first" user flow, where users must authenticate via LinkedIn before viewing any feed content. The implemented code and user-stated goals mandate a secure, private experience, making the public feed plan obsolete.
todos:
  - id: mark-obsolete
    content: "Mark the `public_linkedin_feed_access_plan_8a6c73d2.plan.md` as obsolete or delete it."
    status: pending
  - id: communicate-decision
    content: "Ensure all team members are aware that development should not proceed on a public feed."
    status: pending
---

# Deprecation of Public LinkedIn Feed Access

## Rationale

- **Contradicts Core Architecture:** The user and codebase investigation have confirmed that the application must enforce LinkedIn authentication *before* a user can access the content feed. The public feed plan is in direct opposition to this.
- **Security:** An auth-first model is more secure and ensures that all API calls to LinkedIn are made on behalf of an authenticated user, which is a more robust and compliant integration pattern.
- **Implemented Flow:** The existing codebase (`index.tsx` splash screen, `useLinkedInAuth` hook) already implements the correct auth-first flow. The `public_linkedin_feed_access_plan` created confusion that led to a misconfiguration, which needs to be corrected.

## Action Items

1.  The `public_linkedin_feed_access_plan_8a6c73d2.plan.md` should be removed from the project's plans or clearly marked as **OBSOLETE** and **ARCHIVED**.
2.  All development efforts should align with the secure, auth-first model detailed in plans like `linkedin-splash-oauth_d092cee4.plan.md`.
