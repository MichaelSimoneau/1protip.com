---
name: Tab Bar Layering Fix and Testing
overview: Fix z-index layering so icons appear above the blue indicator, and add comprehensive unit tests and Selenium tests for tab bar functionality.
todos:
  - id: fix-z-index-layering
    content: Fix z-index layering in CustomTabBar so icons render above blue indicator, indicator above background
    status: pending
  - id: create-unit-tests
    content: Create comprehensive unit tests for CustomTabBar component covering icons, indicator animation, and collapse behavior
    status: pending
    dependencies:
      - fix-z-index-layering
  - id: create-selenium-tests
    content: Create Selenium tests for tab bar functionality including visibility, navigation, and indicator animation
    status: pending
    dependencies:
      - fix-z-index-layering
---

# Tab Bar Layering Fix and Testing Plan

## Overview

Fix the visual layering of tab bar elements (icons above indicator, indicator above background) and add comprehensive unit tests and Selenium tests.

## Current Issue

The blue indicator may be rendering above the icons instead of below them. Need to ensure proper z-index layering:

- Background bar: bottom layer
- Blue indicator: middle layer (above background, below icons)
- Icons: top layer

## Implementation Plan

### 1. Fix Z-Index Layering

**File**: `apps/free/components/CustomTabBar.tsx`

- Add `zIndex` to styles to ensure proper layering:
- `tabBar`: `zIndex: 1` (base layer)
- `indicator`: `zIndex: 2` (above background, below icons)
- `tab`: `zIndex: 3` (above indicator)
- Ensure indicator is positioned correctly relative to tabBar
- Verify icons render above the indicator visually

### 2. Create Unit Tests

**File**: `apps/free/__tests__/CustomTabBar.test.tsx`

Test coverage:

- Tab bar renders with correct icons (User, Hash, User)
- Indicator animates to correct position when tab changes
- Tab bar collapses to height 0 on hidden pages (pageIndex 0 and 4)
- Tab bar expands to full height on visible pages
- Tab press triggers navigation correctly
- Panel opens/closes on tab double-tap
- Icons change color based on focused state

**Dependencies**:

- `@testing-library/react-native` for component testing
- Mock `react-native-reanimated` for animation testing
- Mock context providers (`TabPanelContext`, `useLinkedInAuth`)

### 3. Create Selenium Tests

**File**: `apps/free/tests/selenium/tab-bar.test.js`

Test coverage:

- Tab bar is visible on main pages (settings, feed, ms)
- Tab bar is hidden on hidden pages (ScreenAL, ScreenAR)
- Icons are visible and clickable
- Clicking tabs navigates to correct pages
- Blue indicator appears under active tab
- Indicator animates smoothly when switching tabs

**Implementation**:

- Use Selenium WebDriver to interact with web build
- Test tab visibility and interactions
- Verify indicator position and animation
- Test tab bar collapse/expand behavior

## Files to Modify/Create

1. `apps/free/components/CustomTabBar.tsx` - Fix z-index layering
2. `apps/free/__tests__/CustomTabBar.test.tsx` - Create unit tests (NEW)
3. `apps/free/tests/selenium/tab-bar.test.js` - Create Selenium tests (NEW)

## Testing Strategy

- Unit tests: Fast, isolated component testing with mocks
- Selenium tests: End-to-end browser testing of web build
- Both test suites should run as part of CI/CD pipeline