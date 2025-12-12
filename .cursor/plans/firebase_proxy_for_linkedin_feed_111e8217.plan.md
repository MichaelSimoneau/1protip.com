---
name: Firebase proxy for LinkedIn feed
overview: '**SUPERSEDED:** This plan is obsolete. The backend proxy strategy is now defined in `unify-backend-feed-strategy_9f8e7d6c.plan.md`, which recommends using Supabase Functions for architectural consistency.'
---
---
name: Firebase proxy for LinkedIn feed
overview: Initialize Firebase with Functions+Hosting, add a Cloud Function to proxy the LinkedIn hashtag feed using server-side secrets, and point the app feed to that endpoint.
todos:
  - id: init-firebase
    content: Init Firebase (functions+hosting) in repo with TypeScript
    status: pending
  - id: function-proxy
    content: "Add Cloud Function to fetch LinkedIn #1ProTip using server secrets"
    status: pending
  - id: wire-client
    content: Point app feed to Firebase endpoint and remove client-secret requirement
    status: pending
---

1) Run `firebase init functions hosting` (new project) with TypeScript, npm, no ESLint, and set default region (us-central1) to scaffold `firebase.json`, `.firebaserc`, and functions/. Configure environment placeholders for LinkedIn client id/secret and owner info.
2) Implement a Cloud Function (https callable or HTTPS endpoint) that fetches LinkedIn #1ProTip posts using server-held client credentials, orders with michaelsimoneau first, and returns normalized feed items; add minimal hosting rewrite if using HTTPS endpoint.
3) Update the app feed client to call the Firebase function/endpoint instead of direct LinkedIn; keep web/native parity and remove client-secret assertions. Document required `firebase functions: