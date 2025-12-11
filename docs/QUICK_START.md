# 1ProTip Platform - Quick Start Guide

## Current Status

Your app is now working! The "screen doesn't exist" error has been fixed.

## What's Built

### ✅ Working Expo App
- Home tab with setup progress
- Feed tab (ready for LinkedIn integration)
- Settings tab with connection status
- Proper routing and navigation

### ✅ Database Setup
- Supabase tables: `tips`, `blog_posts`, `profiles`
- Optimized RLS policies
- LinkedIn integration fields ready

### ✅ LinkedIn OAuth Architecture
- OAuth flow implemented
- Edge Functions created:
  - `linkedin-oauth-exchange`: Exchanges auth code for token
  - `linkedin-get-profile`: Fetches LinkedIn profile
- Client-side LinkedIn auth helper

## Next Steps

### Step 1: Run the App (Now)

```bash
npm run dev
```

The app will start and you should see:
- Home tab with setup progress
- Working navigation between tabs
- Settings showing LinkedIn connection status

### Step 2: Create LinkedIn App (Required for OAuth)

Follow the detailed guide: [LinkedIn App Setup](./LINKEDIN_APP_SETUP.md)

**Quick Summary:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create new app called "1ProTip Platform"
3. Add redirect URLs:
   - `exp://localhost:8081/--/auth/linkedin/callback` (dev)
   - `https://1protip.com/auth/linkedin/callback` (prod)
4. Copy Client ID and Client Secret

### Step 3: Configure Environment Variables

Create `.env` file in project root:

```env
# LinkedIn OAuth
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
EXPO_PUBLIC_LINKEDIN_REDIRECT_URI=exp://localhost:8081/--/auth/linkedin/callback

# Supabase (already configured - verify these exist)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_SECRET_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Deploy Edge Functions

The LinkedIn OAuth functions need to be deployed to Supabase:

```bash
# These will be deployed when you connect your Supabase project
# Functions are in: supabase/functions/
```

### Step 5: Add Secrets to Supabase

In your Supabase dashboard:
1. Go to Settings → Edge Functions
2. Add secrets:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`

## How LinkedIn Integration Works

### Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Expo App  │─────▶│   LinkedIn   │─────▶│  Supabase   │
│             │◀─────│    OAuth     │◀─────│Edge Function│
└─────────────┘      └──────────────┘      └─────────────┘
       │                                            │
       │                                            ▼
       │                                    ┌─────────────┐
       └───────────────────────────────────▶│  Database   │
                                            └─────────────┘
```

### OAuth Flow

1. **User clicks "Connect LinkedIn"** in Settings tab
2. **App opens LinkedIn authorization** page
3. **User approves** the connection
4. **LinkedIn redirects back** with authorization code
5. **Edge Function exchanges** code for access token
6. **Token stored** in profiles table
7. **App fetches** LinkedIn profile

### Current Limitations

LinkedIn API does NOT provide:
- ❌ Hashtag feed API
- ❌ User post history API
- ❌ Search for your own posts

### Workaround Strategy

**Phase 1 (Current):**
- Manually create tips in the app
- Manually post to LinkedIn with #1ProTip
- Store LinkedIn post URL in database

**Phase 2 (Future):**
- RSS feed parsing Edge Function
- Scheduled sync of your LinkedIn posts
- Auto-import tips with #1ProTip hashtag

## Testing the App

### 1. Test Navigation
- Open app
- Navigate between Home, Feed, and Settings tabs
- Verify all screens load correctly

### 2. Test LinkedIn OAuth (when configured)
- Go to Settings tab
- Click "LinkedIn Connection" card
- Should open LinkedIn authorization
- After approval, status should show "Connected"

### 3. Test Database
- Check Supabase dashboard
- Verify tables exist: `tips`, `blog_posts`, `profiles`
- Check RLS policies are active

## Troubleshooting

### "Screen doesn't exist" Error
✅ **FIXED** - Index route now redirects to tabs properly

### LinkedIn OAuth Not Working
- Verify Client ID in `.env`
- Check redirect URI matches LinkedIn app settings
- Ensure Edge Functions are deployed
- Check Supabase secrets are set

### Database Connection Issues
- Verify `EXPO_PUBLIC_SUPABASE_URL` in `.env`
- Check `EXPO_SECRET_SUPABASE_ANON_KEY` in `.env`
- Test connection in Supabase dashboard

## Project Structure

```
project/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Redirects to tabs
│   ├── _layout.tsx        # Root layout
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx    # Tab layout
│       ├── index.tsx      # Home tab
│       ├── feed.tsx       # Feed tab
│       └── settings.tsx   # Settings tab
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   └── linkedin.ts       # LinkedIn OAuth helper
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge Functions
│       ├── linkedin-oauth-exchange/
│       └── linkedin-get-profile/
└── docs/                 # Documentation
    ├── QUICK_START.md
    ├── LINKEDIN_APP_SETUP.md
    └── SECURITY_FIXES.md
```

## Development Workflow

### Adding New Tips (Current Method)

1. Open your app
2. Navigate to Home tab
3. Create tip manually in database (via Supabase dashboard for now)
4. Post to LinkedIn with #1ProTip hashtag
5. Copy LinkedIn post URL
6. Add URL to tip record in database

### Future: Automated Flow

1. Connect LinkedIn OAuth
2. Create tip in app
3. App posts directly to LinkedIn
4. App stores post ID automatically
5. Scheduled job syncs engagement metrics

## Security Notes

### ✅ Implemented
- Row Level Security on all tables
- Optimized RLS policies
- Secure function search paths
- OAuth state validation
- Token storage in database

### 🔒 Production Recommendations
- Use Supabase Vault for LinkedIn tokens
- Implement token refresh logic
- Add rate limiting to Edge Functions
- Enable HTTPS for all production URLs
- Rotate secrets regularly

## Next Development Tasks

### Immediate
1. ✅ Fix routing (DONE)
2. ⏳ Create LinkedIn app
3. ⏳ Configure OAuth credentials
4. ⏳ Test LinkedIn connection

### Short Term
1. Add tip creation UI in app
2. Implement LinkedIn posting
3. Add blog post editor
4. Create public landing page

### Long Term
1. RSS feed parser Edge Function
2. Scheduled LinkedIn sync
3. Analytics dashboard
4. Mobile app builds

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **LinkedIn API**: https://docs.microsoft.com/en-us/linkedin/
- **Expo Docs**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/

---

**Ready to continue?** Start with creating your LinkedIn Developer App: [LinkedIn App Setup Guide](./LINKEDIN_APP_SETUP.md)
