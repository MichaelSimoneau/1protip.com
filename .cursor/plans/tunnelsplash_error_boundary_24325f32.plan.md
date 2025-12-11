---
name: TunnelSplash error boundary
overview: Prevent TunnelSplash crashes by wrapping it in an error boundary with a safe fallback screen.
todos:
  - id: inspect-usage
    content: Check TunnelSplash usages to decide boundary scope
    status: pending
  - id: implement-boundary
    content: Add ErrorBoundary and SafeTunnelSplash wrapper with fallback
    status: pending
  - id: wire-home
    content: Use SafeTunnelSplash in home tab, preserve redirect timing
    status: pending
---

1) Inspect TunnelSplash usage in `app/(tabs)/index.tsx` and any other entrypoints to confirm where the boundary is needed.
2) Implement a lightweight React error boundary (class component) and a `SafeTunnelSplash` wrapper that renders TunnelSplash inside the boundary with a minimal static fallback view.
3) Replace direct `<TunnelSplash />` usage in the home tab with the safe wrapper so splash failures skip animation without crashing the app; keep navigation timing intact.