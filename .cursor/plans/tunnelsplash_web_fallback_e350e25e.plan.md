---
name: TunnelSplash web fallback
overview: Prevent web crashes by skipping TunnelSplash animation on web and guarding Reanimated import usage.
todos:
  - id: web-fallback
    content: Add Platform web guard to render static splash instead of animated Ring
    status: completed
  - id: defensive-animated
    content: Ensure Animated components/hooks exist before render; avoid undefined element
    status: completed
---

1) Detect web platform in `TunnelSplash` and render a static fallback immediately on web to avoid Reanimated usage there.
2) Keep native/mobile path using Reanimated, with a defensive null check so `Animated` is always a valid component before rendering `<Animated.View>` children.
3) Verify `SafeTunnelSplash` still wraps splash for error capture and that home tab renders the safe fallback on web without route warnings.