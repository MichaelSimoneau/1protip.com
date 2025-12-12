---
name: linkedin-feed-rolodex
overview: "Paginate LinkedIn feed via backend and render a rolodex-style animated feed using /api/feed with exact #1ProTip filtering."
todos:
  - id: backend-feed
    content: "Implement paged LinkedIn feed with exact #1ProTip filtering"
    status: pending
  - id: service-hook
    content: Wire /api/feed pagination into service + hook
    status: pending
  - id: rolodex-ui
    content: Build reanimated rolodex feed showing 10 at a time
    status: pending
  - id: test-verify
    content: Test API pagination and animated scrolling
    status: pending
---

## Backend feed fixes

- Update `functions/src/index.ts` feed handler to use LinkedIn client_id/client_secret with paged search (start/count) and filter posts whose content includes the exact `#1ProTip` tag (case-insensitive). Limit to 10 per page by default, cap total to 100, and return a `nextStart` cursor.
- Validate/normalize `hashtag` (default `#1ProTip`) while keeping the `?hashtag=` param. Enforce a maximum count and sanitize inputs.

## App data layer

- Extend `apps/1protip.com/services/linkedin/feed.ts` to request `/api/feed` with pagination params (start/count=10) and surface `posts` plus `nextStart`.
- Update `features/feed/hooks/useFeed.ts` to manage cursor-based incremental loading (10 at a time), dedupe, and expose load-more state.

## Rolodex UI with Reanimated

- Rebuild feed screen (`app/(tabs)/feed.tsx` and/or `features/feed/components`) to render a rolodex-style, card-stacked list using Reanimated + Gesture Handler, showing ~10 items at a time and recycling off-screen cards when they exit the viewport.
- Implement continuous/infinite scroll trigger when nearing the end; rerender/remount off-screen items to keep memory low.

## Validation

- Local test against emulator `http://127.0.0.1:3333/api/feed?hashtag=%23{tag}&start=0&count=10`.
- Verify scrolling loads more pages up to the 100-post cap and cards recycle smoothly with the rolodex animation.