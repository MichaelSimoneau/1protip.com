---
name: linkedin-splash-oauth
overview: Add a LinkedIn-branded tunnel splash entry that pulses a large embossed LinkedIn logo, launches OAuth on tap (unless a cached token is reusable), and routes to the feed once authenticated.
todos:
  - id: splash-cta
    content: Add LinkedIn CTA overlay to tunnel splash
    status: pending
  - id: pulse-cta
    content: Pulse the LinkedIn logo when idle
    status: pending
  - id: auth-trigger
    content: Wire tap to use useLinkedInAuth login and handle states
    status: completed
  - id: token-skip
    content: Skip OAuth when cached token is valid
    status: completed
  - id: nav-feed
    content: Route to /feed after auth; remove timer redirect
    status: completed
  - id: doc-overlord
    content: Log directive in docs/overlord/COMMANDS.md
    status: pending
---

# LinkedIn Splash OAuth

- Update `apps/free/app/(tabs)/index.tsx` to replace the timer-based redirect with a splash screen that centers a large embossed LinkedIn-rounded-square logo; require a tap on that logo to trigger the login flow and show inline loading/error states.
- Enhance `shared/components/TunnelSplash.tsx` (or a wrapper) to render the LinkedIn logo CTA overlay on the tunnel effect, with styling that matches the embossed blue brand treatment and exposes props/callbacks for press/loading/disabled states; add a subtle idle pulse (scale/size/saturation) when untouched.
- Reuse `useLinkedInAuth` for the OAuth launch: on tap, call `login`, surface errors, and navigate to `/feed` on success; if a cached token/session is valid and can re-auth, skip the OAuth prompt and go straight to the feed.
- After implementing, record the new directive in `docs/overlord/COMMANDS.md` per overlord rule once edits are allowed.