# 1ProTip Platform

Your personal software engineering tips platform featuring #1ProTip posts from LinkedIn.

## Status: ✅ App Working

The app is now fully functional with tab navigation and ready for LinkedIn integration!

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Press `w` to open in web browser.

## Current Features

### ✅ Working
- Tab navigation (Home, Feed, Settings)
- Supabase database integration
- LinkedIn OAuth architecture
- Secure RLS policies
- Edge Functions for OAuth

### ⏳ Pending Setup
- LinkedIn Developer App creation
- OAuth credentials configuration
- LinkedIn feed integration

## Project Architecture

Built with:
- **Expo SDK 54** with Expo Router
- **React Native** with Reanimated
- **Supabase** for database and Edge Functions
- **TypeScript** for type safety

## Documentation

- 📘 [Quick Start Guide](./docs/QUICK_START.md) - **Start here!**
- 📘 [LinkedIn App Setup](./docs/LINKEDIN_APP_SETUP.md)
- 📘 [Security Fixes Applied](./docs/SECURITY_FIXES.md)

## Next Steps

1. Read the [Quick Start Guide](./docs/QUICK_START.md)
2. Create your LinkedIn Developer App
3. Configure OAuth credentials
4. Test the LinkedIn connection

## What Was Built

### App Structure
```
app/
├── index.tsx              # Entry point (redirects to tabs)
├── _layout.tsx            # Root layout
└── (tabs)/                # Tab navigation
    ├── index.tsx          # Home with setup progress
    ├── feed.tsx           # LinkedIn feed display
    └── settings.tsx       # LinkedIn connection settings
```

### Database
- `tips` table for your #1ProTip posts
- `blog_posts` table for extended articles
- `profiles` table with LinkedIn integration fields
- Optimized RLS policies for security

### LinkedIn Integration
- OAuth flow implemented
- Edge Functions for token exchange
- Profile fetching capability
- Secure token storage

## Architecture Highlights

### Tab Navigation
Clean tab-based interface:
- **Home**: Setup progress and welcome
- **Feed**: Your LinkedIn #1ProTip posts
- **Settings**: LinkedIn connection management

### LinkedIn OAuth Flow
```
User → LinkedIn Auth → OAuth Code → Edge Function → Access Token → Database
```

### Security
- ✅ Row Level Security enabled
- ✅ Optimized query performance
- ✅ Secure token storage
- ✅ OAuth state validation

## Development

### Available Scripts

```bash
npm run dev          # Start Expo dev server
npm run build:web    # Build for web
npm run typecheck    # Run TypeScript checks
npm run lint         # Run linter
```

### Environment Variables

Create `.env`:
```env
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Deployment

### Web
```bash
npm run build:web
# Deploy dist/ to Vercel, Netlify, etc.
```

### Mobile (Future)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS/Android
eas build --platform ios
eas build --platform android
```

## Contributing

This is a personal project by Michael Simoneau. Feedback welcome!

## Links

- [MichaelSimoneau.com](https://michaelsimoneau.com)
- [#1ProTip on LinkedIn](https://www.linkedin.com/search/results/all/?keywords=%231ProTip)

---

Built by Michael Simoneau - Self-taught coder turned business owner
