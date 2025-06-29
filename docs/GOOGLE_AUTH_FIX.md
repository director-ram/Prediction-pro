# Google OAuth "Refused to Connect" - SOLUTION

## The Problem
You're getting "oqaowdywqxfxsirraivn.supabase.co refused to connect" because of a configuration mismatch between Google Console and Supabase.

## EXACT SOLUTION for Your Project

### Step 1: Fix Google Cloud Console Settings

Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

#### Your OAuth 2.0 Client ID Settings Should Be:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://oqaowdywqxfxsirraivn.supabase.co
```

**Authorized redirect URIs:**
```
https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/callback
```

⚠️ **CRITICAL:** Make sure it's `/auth/v1/callback` NOT `/auth/callback`

### Step 2: Verify Supabase Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/oqaowdywqxfxsirraivn)
2. Authentication → Providers → Google
3. Make sure:
   - ✅ **Enabled** is turned ON
   - ✅ **Client ID** matches Google Console exactly
   - ✅ **Client Secret** matches Google Console exactly
   - ✅ **Site URL** is set to `http://localhost:3000` (for development)

### Step 3: Test This Exact URL

Replace `YOUR_CLIENT_ID` with your actual Google Client ID and test:

```
https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000
```

### Step 4: Common Mistakes to Avoid

❌ **Wrong redirect URI:**
- `https://oqaowdywqxfxsirraivn.supabase.co/auth/callback` (WRONG)

✅ **Correct redirect URI:**
- `https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/callback` (RIGHT)

❌ **Missing JavaScript origins:**
- Not including your Supabase URL

✅ **Correct JavaScript origins:**
- Both localhost AND Supabase URL

### Step 5: If Still Not Working

Try these debug steps:

1. **Clear browser cache** and cookies
2. **Try incognito/private browsing**
3. **Check browser console** for specific error messages
4. **Verify OAuth consent screen** is configured in Google Console

### Step 6: Alternative (If Google Auth Still Fails)

Your app works perfectly without Google auth! Users can:
- ✅ Sign up with email (works great)
- ✅ Connect crypto wallets (works great)
- ✅ Use all features normally

## Quick Checklist

- [ ] Google Console: JavaScript origins include Supabase URL
- [ ] Google Console: Redirect URI is `/auth/v1/callback` (with v1)
- [ ] Supabase: Google provider enabled
- [ ] Supabase: Client ID and Secret correct
- [ ] Browser: Clear cache and try incognito

## Need More Help?

If you're still getting "refused to connect":

1. **Screenshot your Google OAuth settings**
2. **Screenshot your Supabase Google provider settings**
3. **Check browser console for exact error message**

The most common cause is the missing `/v1/` in the redirect URI!