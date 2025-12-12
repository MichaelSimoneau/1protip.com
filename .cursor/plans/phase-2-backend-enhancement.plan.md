name: "Phase 2: Backend Feed Enhancement"
overview: With a stable foundation, this phase focuses on implementing a robust, paginated backend feed. It builds on the proxy pattern established in Phase 1 and delivers the full-featured feed fetching mechanism required by the client-side UI.
derived_from:
  - "unify-backend-feed-strategy_9f8e7d6c.plan.md"
  - "linkedin-feed-rolodex_d49065dc.plan.md"
todos:
  - id: backend-paged-feed
    content: "Implement paged LinkedIn feed with exact #1ProTip filtering in the serverless proxy function."
    status: pending
  - id: service-hook-integration
    content: "Wire the paginated `/api/feed` endpoint into the client-side `services/linkedin/feed.ts` and `features/feed/hooks/useFeed.ts`."
    status: pending
  - id: handle-load-more
    content: "Implement the 'load-more' functionality in the UI to trigger requests for subsequent pages."
    status: pending
  - id: test-pagination
    content: "Test the API pagination and the incremental loading on the client."
    status: pending
---

# Phase 2: Backend Feed Enhancement

This phase transitions from foundational fixes to feature development, focusing entirely on the backend and data layer for the main post feed.

## Key Objectives

1.  **Implement Pagination:** The LinkedIn API provides a large number of posts. A paginated backend is essential for performance and a good user experience. The proxy function will be enhanced to support `start` and `count` parameters.
2.  **Integrate with Client:** The client-side data hooks (`useFeed`) need to be updated to understand the paginated API, manage cursors or page numbers, and handle "load more" events.

## Tasks (To-Do)

- **`backend-paged-feed`**: Derived from `linkedin-feed-rolodex_d49065dc.plan.md`. This involves adding the pagination, filtering, and cursor logic to the Supabase/Firebase function created in Phase 1.
- **`service-hook-integration`**: Also from `linkedin-feed-rolodex`, this task is about updating the client-side code that calls the API. The `fetchHashtagFeed` service and `useFeed` hook must be modified to send pagination parameters and process the paginated response.
- **`handle-load-more`**: This is the UI-facing part of the data integration. The feed component will need a button or an infinite-scroll trigger to call the function that loads the next page of data.
- **`test-pagination`**: End-to-end testing to ensure the client correctly requests pages and the backend serves them as expected.
