# LinkedIn App Setup Guide

This guide walks you through creating a LinkedIn Developer App to enable OAuth authentication and API access for your 1ProTip platform.

## Overview

To fetch your LinkedIn posts with #1ProTip hashtag, you need to:
1. Create a LinkedIn Developer App
2. Configure OAuth 2.0 settings
3. Request necessary API permissions
4. Add credentials to your application

## Step 1: Create LinkedIn Developer App

### 1.1 Access LinkedIn Developer Portal

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account (Michael Simoneau's account)
3. Click "Create app" button

### 1.2 Fill App Details

**Required Information:**
- **App name**: `1ProTip Platform`
- **LinkedIn Page**: Associate with your LinkedIn company page (or create one)
- **App logo**: Upload your 1ProTip logo
- **Legal agreement**: Check the box to agree to API Terms of Use

### 1.3 Verify Your App

LinkedIn requires app verification:
1. You'll receive a verification URL
2. Add it to your LinkedIn company page or website
3. LinkedIn will verify ownership

## Step 2: Configure OAuth 2.0

### 2.1 Add Redirect URLs

Navigate to the "Auth" tab and add these redirect URLs:

**For Development:**
```
http://localhost:8081/auth/linkedin/callback
exp://localhost:8081/--/auth/linkedin/callback
```

**For Production:**
```
https://free/auth/linkedin/callback
https://app.1protip.com/auth/linkedin/callback
```

### 2.2 Get OAuth Credentials

Copy these values (you'll need them later):
- **Client ID**: `your_client_id_here`
- **Client Secret**: `your_client_secret_here`

## Step 3: Request API Permissions

### 3.1 Required Scopes

For 1ProTip, you need these OAuth 2.0 scopes:

1. **r_liteprofile** - Access basic profile info
   - Status: Generally available
   - No approval needed

2. **r_emailaddress** - Access email address
   - Status: Generally available
   - No approval needed

3. **w_member_social** - Post on your behalf
   - Status: Requires approval
   - Apply in "Products" tab

### 3.2 Apply for Products

1. Go to the "Products" tab
2. Find "Share on LinkedIn" or "Marketing Developer Platform"
3. Click "Request access"
4. Fill out the application:
   - **Use case**: Personal content management platform
   - **Description**: Platform to manage and showcase #1ProTip posts
   - **Expected usage**: Personal use, viewing own posts

**Note**: Approval can take 1-2 weeks

## Step 4: Add Credentials to Your App

### 4.1 Create Environment File

Create `.env` file in your project root:

```env
# LinkedIn OAuth
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
EXPO_PUBLIC_LINKEDIN_REDIRECT_URI=exp://localhost:8081/--/auth/linkedin/callback

# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_SECRET_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4.2 Store Credentials Securely

**For Edge Functions** (server-side only):
Create secrets in Supabase dashboard:
```bash
# Via Supabase CLI (if using)
supabase secrets set LINKEDIN_CLIENT_SECRET=your_secret_here
```

**Never expose Client Secret in client-side code!**

## Step 5: Understanding LinkedIn API Limitations

### Available Endpoints

1. **Profile Information**
   - Get your own profile
   - ✅ Available without approval

2. **Share/Post Content**
   - Create new posts
   - ❌ Requires "Share on LinkedIn" product approval

3. **View Posts**
   - Unfortunately, LinkedIn does NOT provide:
   - ❌ Public hashtag feed API
   - ❌ User post history API
   - ❌ Search API for personal content

### Alternative Approaches

Since LinkedIn doesn't provide a hashtag feed API:

#### Option A: Manual Content Creation (Current)
- Create tips in your database
- Manually post to LinkedIn
- Store LinkedIn post URL in database

#### Option B: RSS Feed Scraping
- LinkedIn profiles have RSS feeds
- Can be parsed for recent activity
- Not officially supported

#### Option C: LinkedIn Newsletter/Articles
- If you publish #1ProTip as a newsletter
- Can use LinkedIn Newsletter API
- More reliable than post scraping

## Step 6: Implementation Strategy

### Phase 1: OAuth Authentication (Now)
1. ✅ User can authenticate with LinkedIn
2. ✅ Store access token securely
3. ✅ Display profile information

### Phase 2: Content Management (Current)
1. ✅ Create tips in database
2. ✅ Manual LinkedIn posting
3. ✅ Store post URLs

### Phase 3: Automation (Future)
1. Implement RSS parsing Edge Function
2. Scheduled job to sync posts
3. Auto-import new #1ProTip posts

## Testing Your Setup

### Test OAuth Flow

1. Run your app: `npm run dev`
2. Navigate to Settings tab
3. Click "Connect LinkedIn"
4. Authorize the app
5. Verify connection status

### Verify Scopes

Check granted scopes in LinkedIn app dashboard:
- Approved scopes will be marked green
- Pending will show "In review"

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure exact match including protocol
   - Check for trailing slashes

2. **Scope Not Available**
   - Some scopes require product approval
   - Check "Products" tab status

3. **Invalid Client Credentials**
   - Verify Client ID and Secret
   - Check for extra spaces

4. **App Not Verified**
   - Complete LinkedIn page verification
   - May take 24-48 hours

## Next Steps

Once your LinkedIn app is set up:

1. ✅ Add credentials to `.env`
2. ✅ Test OAuth flow in app
3. ✅ Start creating tips in database
4. ✅ Manually post to LinkedIn with #1ProTip
5. ⏳ Wait for API approval (if needed)

## Resources

- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn API Reference](https://docs.microsoft.com/en-us/linkedin/shared/api-guide)
- [Share on LinkedIn Product](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)

## Security Best Practices

1. ✅ Never commit `.env` to git
2. ✅ Use Supabase secrets for server-side credentials
3. ✅ Implement token refresh logic
4. ✅ Validate redirect URIs
5. ✅ Use HTTPS in production

---

**Ready to implement?** Proceed to the next guide: [LinkedIn OAuth Implementation](./LINKEDIN_OAUTH_IMPLEMENTATION.md)
