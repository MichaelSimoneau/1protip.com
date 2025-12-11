---
name: LinkedIn hashtag feed
overview: Replace feed loading with direct LinkedIn API hashtag search using service token, prioritize michaelsimoneau posts first, and remove Supabase reliance for feed data.
todos:
  - id: inspect-feed
    content: Review feed hook/UI and existing supabase feed function usage
    status: pending
  - id: implement-linkedin-client
    content: "Build LinkedIn service client for #1ProTip posts with service token"
    status: pending
  - id: rewire-feed
    content: Point feed to new client, order mine first then recency, clean types/docs
    status: pending
---

1) Inspect current feed pipeline (`features/feed/hooks/useFeed.ts`, `app/(tabs)/feed.tsx`, `services/linkedin/*`, `supabase/functions/linkedin-get-posts`) to map Supabase dependencies and data shapes.
2) Add a LinkedIn service client that calls the LinkedIn API with the service token to fetch posts containing `#1ProTip`; filter to the hashtag, normalize to existing tip/card shape, and handle pagination/errors.
3) Update feed hook/UI to use the new client, remove Supabase usage, and enforce ordering with michaelsimoneau posts first then the rest by recency; adjust types/tests/env docs as needed.