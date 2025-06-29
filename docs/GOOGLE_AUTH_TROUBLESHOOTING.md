# Google Authentication Troubleshooting Guide

## "Refused to Connect" Error - Common Causes and Solutions

### 1. Check Your Google Cloud Console Configuration

#### Verify OAuth Client Settings:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID

#### Check Authorized JavaScript Origins:
Make sure these are added:
- `http://localhost:3000` (for development)
- `https://yourdomain.com` (for production)
- `https://your-project-ref.supabase.co` (your Supabase project URL)

#### Check Authorized Redirect URIs:
Must include:
- `https://your-project-ref.supabase.co/auth/v1/callback`

### 2. Verify Supabase Configuration

#### In Supabase Dashboard:
1. Go to **Authentication** > **Providers**
2. Click on **Google**
3. Verify:
   - ✅ **Enabled** is turned ON
   - ✅ **Client ID** matches your Google Console Client ID exactly
   - ✅ **Client Secret** matches your Google Console Client Secret exactly

#### Check Site URL:
- Should be your production domain (e.g., `https://yourdomain.com`)
- For development, you can use `http://localhost:3000`

### 3. Common Configuration Mistakes

#### ❌ Wrong Redirect URI Format:
```
Wrong: https://your-project-ref.supabase.co/auth/callback
Right: https://your-project-ref.supabase.co/auth/v1/callback
```

#### ❌ Missing JavaScript Origins:
Make sure to include your Supabase project URL in JavaScript origins

#### ❌ HTTP vs HTTPS Mismatch:
- Development: Use `http://localhost:3000`
- Production: Use `https://yourdomain.com`

### 4. Debug Steps

#### Step 1: Check Browser Console
Open browser dev tools and look for errors like:
- `Refused to connect`
- `OAuth client not found`
- `Redirect URI mismatch`

#### Step 2: Verify Environment Variables
Check that your Supabase URL and keys are correct:
```bash
# In your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 3: Test OAuth Flow Manually
Try this URL in your browser (replace with your values):
```
https://your-project-ref.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000
```

### 5. Quick Fix Checklist

#### ✅ Google Cloud Console:
- [ ] OAuth client created
- [ ] Correct JavaScript origins added
- [ ] Correct redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
- [ ] OAuth consent screen configured

#### ✅ Supabase Dashboard:
- [ ] Google provider enabled
- [ ] Client ID copied correctly (no extra spaces)
- [ ] Client Secret copied correctly (no extra spaces)
- [ ] Site URL set correctly

#### ✅ Application Code:
- [ ] Environment variables set correctly
- [ ] No typos in Supabase URL
- [ ] Auth flow implemented correctly

### 6. Test Configuration

#### Development Test:
1. Start your app: `npm run dev`
2. Go to `http://localhost:3000`
3. Try Google login
4. Should redirect to Google OAuth consent screen

#### Production Test:
1. Deploy your app
2. Update Google Console with production URLs
3. Test Google login on production domain

### 7. Alternative Solutions

#### If Google Auth Still Doesn't Work:

1. **Use Email Authentication** (already working in your app)
2. **Try a different OAuth provider** (GitHub, Discord, etc.)
3. **Contact Supabase Support** with your project details

#### Temporary Workaround:
Your app already has excellent email authentication. Users can:
1. Sign up with email
2. Connect their crypto wallet later
3. Use all features normally

### 8. Getting Help

#### Information to Provide When Seeking Help:
- Your Supabase project reference
- Google Cloud Console project ID
- Exact error messages from browser console
- Screenshots of your Google OAuth configuration
- Screenshots of your Supabase Auth configuration

#### Useful Resources:
- [Supabase Google Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Community Discord](https://discord.supabase.com/)

### 9. Security Notes

- Never share your Client Secret publicly
- Use HTTPS for all production URLs
- Regularly review OAuth consent screen settings
- Monitor authentication logs for suspicious activity

Your app is already well-designed with fallback authentication methods, so users can still access all features even if Google auth needs troubleshooting.