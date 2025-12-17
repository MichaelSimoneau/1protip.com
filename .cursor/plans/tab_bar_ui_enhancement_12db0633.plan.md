---
name: Tab Bar UI Enhancement
overview: Fix tab bar icons (Account, Hashtag, MS) and make entire tab bar invisible on hidden pages (ScreenAL and ScreenAR)
todos:
  - id: fix-tab-icons
    content: Add proper icons to tab bar - Account icon for settings, Hash (#) for feed, User/MS icon for MS tab
    status: pending
  - id: animated-indicator
    content: Implement smooth animated blue highlight indicator that slides under active tab
    status: pending
  - id: hide-tabbar-hidden-pages
    content: Make entire tab bar completely invisible (height 0 with smooth animation) when on ScreenAL (index 0) or ScreenAR (index 4)
    status: pending
---

# Tab Bar UI Enhancement Plan

## Overview

Fix tab bar to display correct icons and make the entire tab bar invisible when hidden pages (ScreenAL and ScreenAR) are displayed.

## Current Issues

1. **Icons not showing correctly**: Tabs display but icons are missing or incorrect

   - Settings/Account tab should show: Account/User icon
   - Feed tab should show: Hash (#) icon  
   - MS tab should show: User/MS icon

2. **Tab bar visibility**: Tab bar remains visible when hidden pages (ScreenAL at index 0, ScreenAR at index 4) are shown - needs to collapse to height 0 with smooth animation

## Implementation Plan

### 1. Fix Tab Bar Icons

**File**: `apps/free/app/(tabs)/_layout.tsx`

- Import icons from `lucide-react-native`:
  - `User` icon for settings/account tab
  - `Hash` icon for feed tab (already used in feed.tsx)
  - `User` icon for MS tab (or appropriate MS representation)
- Update the `descriptors` object to return proper icon components
- Icons should respect `focused`, `color`, and `size` parameters from the tab bar system

**Implementation**:

```typescript
import { User, Hash } from 'lucide-react-native';

const descriptors = {
  'settings': { 
    options: { 
      tabBarIcon: ({ focused, color, size }) => (
        <User size={size} color={color} />
      )
    } 
  },
  'feed': { 
    options: { 
      tabBarIcon: ({ focused, color, size }) => (
        <Hash size={size} color={color} />
      )
    } 
  },
  'ms': { 
    options: { 
      tabBarIcon: ({ focused, color, size }) => (
        <User size={size} color={color} />
      )
    } 
  },
};
```

### 2. Implement Animated Highlight Indicator

**File**: `apps/free/components/CustomTabBar.tsx`

- Replace static `tabActive` background color with an animated indicator bar
- Use `react-native-reanimated` for smooth animations
- Create an `Animated.View` that slides horizontally under the active tab
- Calculate indicator position based on:
  - Tab width (using `onLayout` to measure each tab)
  - Active tab index
  - Tab spacing/margins
- Animate indicator position using `withTiming` with easing
- Position indicator below the tab icons (not as background)
- Use blue color (`#0066cc`) for the indicator

### 3. Make Tab Bar Invisible on Hidden Pages

**Files**:

- `apps/free/components/CustomTabBar.tsx`
- `apps/free/app/(tabs)/_layout.tsx`

- Pass `pageIndex` from `PagerLayout` to `CustomTabBar` as a prop
- Detect when `pageIndex === 0` (ScreenAL) or `pageIndex === 4` (ScreenAR)
- Add animated `height` to collapse tab bar to `0` when on hidden pages
- Use `Animated.View` with `useNativeDriver: false` (height animations require layout driver)
- Measure tab bar height first, then animate from full height to `0` when on hidden pages
- Animate transition smoothly (~300ms) with easing
- Set `overflow: 'hidden'` on container to ensure content doesn't show when collapsed

**Implementation**:

```typescript
// In _layout.tsx, pass pageIndex
<CustomTabBar
  state={state as any}
  descriptors={descriptors as any}
  navigation={navigation as any}
  onTabPress={(index) => pagerRef.current?.setPage(index + 1)}
  pageIndex={pageIndex} // Add this prop
/>

// In CustomTabBar.tsx
const isHiddenPage = pageIndex === 0 || pageIndex === 4;
const tabBarHeight = useRef(new Animated.Value(120)).current; // Initial height from styles

useEffect(() => {
  Animated.timing(tabBarHeight, {
    toValue: isHiddenPage ? 0 : 120, // Full height when visible
    duration: 300,
    useNativeDriver: false, // Height requires layout driver
  }).start();
}, [isHiddenPage, tabBarHeight]);

// Apply to container
<Animated.View style={[styles.container, { height: tabBarHeight, overflow: 'hidden' }]}>
```

## Files to Modify

1. `apps/free/app/(tabs)/_layout.tsx` - Add icons and pass pageIndex prop
2. `apps/free/components/CustomTabBar.tsx` - Add animated indicator and height collapse logic

## Dependencies

All required dependencies are already installed:

- `lucide-react-native` - for icons (User, Hash)
- `react-native-reanimated` - for animations