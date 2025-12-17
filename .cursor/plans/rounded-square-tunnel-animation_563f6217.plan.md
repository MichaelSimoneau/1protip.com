---
name: rounded-square-tunnel-animation
overview: Replace circular tunnel rings with expanding rounded square borders that fade out, ending with the LinkedIn logo as the final square with a dramatic multi-pulse glimmer effect.
todos:
  - id: replace-rings
    content: Replace Ring component with RoundedSquare (border-only, rounded corners, LinkedIn blue)
    status: pending
  - id: animation-sequence
    content: Implement sequential expansion animation (8 squares over ~3 seconds, fade out as they grow)
    status: pending
  - id: integrate-logo
    content: Integrate LinkedIn logo as final square in sequence
    status: pending
  - id: enhance-pulse
    content: Add dramatic multi-pulse glimmer effect to LinkedIn logo (scale, shadow, brightness)
    status: pending
  - id: update-index
    content: Update index.tsx to work with integrated logo (remove overlay, adjust text positioning)
    status: pending
  - id: remove-old-elements
    content: Remove center mark, particles, and separate logo rendering from TunnelSplash
    status: pending
---

# Rounded Square Tunnel Animation

## Changes to TunnelSplash Component

- Replace `Ring` component with `RoundedSquare` component in `apps/free/components/TunnelSplash.tsx`:
- Change from circular (`borderRadius: size / 2`) to rounded square (`borderRadius: size * 0.15` to match LinkedIn logo)
- Use border-only styling (no fill, just `borderWidth` and `borderColor`)
- Border color: LinkedIn blue `#0077b5`
- Start from small size in center, expand to larger than screen
- Fade out as they expand (opacity decreases from ~0.8 to 0)
- Sequential appearance: 8 squares appearing ~375ms apart (total ~3 seconds)

- Remove center mark, particles, and separate logo rendering since LinkedIn logo will be the final square

- Integrate LinkedIn logo as the 9th element in the sequence:
- Final square should be filled LinkedIn logo (blue background with "in" text)
- Appears after the 8 border squares complete
- Stays visible and pulses with dramatic multi-animation effect

## Enhanced LinkedIn Logo Pulse

- Update `LinkedInLogoButton` component in `apps/free/components/LinkedInLogoButton.tsx`:
- Add multiple overlapping pulse animations:
  - Scale animation (more dramatic: 1.0 to 1.15+)
  - Shadow opacity pulsing (0.6 to 1.2)
  - Brightness/opacity effect (using overlay or filter)
  - Faster pulse cycle (1-1.5 seconds instead of 2)
- Create "glimmer" effect with multiple animated properties running simultaneously

## Update Index Screen

- Modify `apps/free/app/(tabs)/index.tsx`:
- Remove overlay prop usage since logo is now integrated into TunnelSplash
- Pass LinkedIn logo button as part of the tunnel animation sequence
- Keep "#1ProTip" text overlay but adjust positioning to work with integrated logo

## Animation Timing

- Square 1-8: Sequential appearance starting at 0ms, 375ms, 750ms, etc.
- Each square: Expand from ~40px to ~2000px over ~1.5 seconds, fade out
- Final logo: Appears at ~3000ms, then continuous dramatic pulse