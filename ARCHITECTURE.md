# 1ProTip Architecture

This document outlines the React Foundation architecture patterns used in this Expo application.

## Project Structure

```
/project
├── app/                         # Expo Router navigation
│   ├── _layout.tsx             # Root layout with ErrorBoundary & Suspense
│   └── (tabs)/                 # Tab-based navigation
│       ├── _layout.tsx         # Tab navigation configuration
│       ├── index.tsx           # Home tab
│       ├── feed.tsx            # Feed tab
│       └── settings.tsx        # Settings tab
├── features/                    # Feature-based modules
│   ├── auth/                   # Authentication feature
│   │   └── hooks/
│   │       └── useLinkedInAuth.ts
│   ├── feed/                   # Feed feature
│   │   └── hooks/
│   │       └── useFeed.ts
│   └── tips/                   # Tips feature
│       └── hooks/
│           └── useTips.ts
├── services/                    # External service integrations
│   └── supabase/
│       ├── client.ts           # Supabase client setup
│       └── types.ts            # Database types
├── shared/                      # Shared utilities
│   ├── components/             # Reusable components
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   └── hooks/                  # Shared hooks
│       └── useAsync.ts
└── hooks/                       # App-level hooks
    └── useFrameworkReady.ts
```

## Key Architecture Patterns

### 1. Feature-Based Organization
- Code is organized by feature domain rather than technical type
- Each feature contains its own hooks, components, and business logic
- Promotes better scalability and maintainability

### 2. Custom Hooks Pattern
- Business logic is encapsulated in custom hooks
- `useLinkedInAuth` - LinkedIn OAuth flow
- `useFeed` - Published tips feed
- `useTips` - Tip management
- `useAsync` - Generic async operation handling

### 3. React 18 Concurrent Features
- Root layout wrapped with `Suspense` for async operations
- `ErrorBoundary` for graceful error handling
- Loading states with skeleton screens
- Optimized for concurrent rendering

### 4. React Native New Architecture
- `newArchEnabled: true` in app.json
- JSI (JavaScript Interface) enabled
- Fabric rendering system
- TurboModules support
- Compatible with React 18 features

### 5. Component Composition
- Separation of concerns between presentation and logic
- Container components use hooks for data/logic
- Presentational components focus on UI
- React.memo for performance optimization

### 6. Service Layer
- Supabase client in dedicated service module
- Centralized type definitions
- Feature-specific service modules

### 7. Error Handling Strategy
- Root-level ErrorBoundary catches all errors
- Feature-specific error states in hooks
- User-friendly error messages with recovery actions

### 8. Navigation Architecture
- Tab-based primary navigation
- Direct routing to tabs (no redirect layer)
- Type-safe routes with Expo Router typed routes
- Suspense boundaries at route level

## Development Workflow

### Running the App
```bash
npm run dev
```

### Building for Web
```bash
npm run build
```

### EAS Builds

**Development Builds:**
```bash
npm run build:dev          # All platforms
npm run build:dev:ios      # iOS only
npm run build:dev:android  # Android only
```

**Preview Builds:**
```bash
npm run build:preview          # All platforms
npm run build:preview:ios      # iOS only
npm run build:preview:android  # Android only
```

**Production Builds:**
```bash
npm run build:prod          # All platforms
npm run build:prod:ios      # iOS only
npm run build:prod:android  # Android only
```

## Platform Configuration

### iOS
- Bundle ID: `com.michaelsimoneau.oneprotip`
- URL Scheme: `oneprotip://`
- Camera and photo library permissions configured
- Supports iPhone and iPad

### Android
- Package: `com.michaelsimoneau.oneprotip`
- Adaptive icon with brand color
- Camera and storage permissions
- APK for preview, AAB for production

### Web
- Metro bundler
- Single-page application output
- Custom metro config for React Native web compatibility

## Best Practices Followed

1. **Single Responsibility Principle** - Each file has one clear purpose
2. **Feature Colocation** - Related code lives together
3. **Type Safety** - TypeScript throughout with strict mode
4. **Performance** - React.memo, lazy loading, code splitting
5. **Accessibility** - Proper component structure and ARIA patterns
6. **Error Resilience** - Comprehensive error boundaries
7. **State Management** - Local state with hooks, no prop drilling
8. **Testing Ready** - Hooks are easily testable in isolation

## Environment Variables

Required variables in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_LINKEDIN_CLIENT_ID` (optional)
- `EXPO_PUBLIC_LINKEDIN_REDIRECT_URI` (optional)

## Next Steps

1. Complete LinkedIn OAuth setup
2. Add more comprehensive error recovery
3. Implement optimistic updates for mutations
4. Add analytics and monitoring
5. Set up CI/CD with EAS
6. Configure app store metadata
7. Add unit and integration tests
