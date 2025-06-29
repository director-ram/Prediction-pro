# Google Authentication Debug Guide

## Step-by-Step Debugging Process

### 1. Check Your Exact Configuration

#### Your Supabase Project URL:
```
https://oqaowdywqxfxsirraivn.supabase.co
```

#### Required Google Console Settings:

**Authorized JavaScript Origins:**
```
http://localhost:3000
https://oqaowdywqxfxsirraivn.supabase.co
```

**Authorized Redirect URIs:**
```
https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/callback
```

### 2. Test Your Configuration

#### Test URL (replace YOUR_CLIENT_ID):
```
https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000
```

### 3. Debug Steps

#### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try Google login
4. Look for specific error messages

#### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try Google login
4. Look for failed requests

#### Step 3: Verify Supabase Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/oqaowdywqxfxsirraivn)
2. Navigate to Authentication > Providers
3. Click on Google
4. Verify:
   - ✅ Enabled is ON
   - ✅ Client ID is correct
   - ✅ Client Secret is correct

### 4. Common Error Messages and Solutions

#### "OAuth client not found"
- **Cause:** Wrong Client ID in Supabase
- **Solution:** Double-check Client ID matches Google Console exactly

#### "Redirect URI mismatch"
- **Cause:** Wrong redirect URI in Google Console
- **Solution:** Must be exactly: `https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/callback`

#### "Access blocked: This app's request is invalid"
- **Cause:** OAuth consent screen not configured
- **Solution:** Configure OAuth consent screen in Google Console

#### "Refused to connect"
- **Cause:** Missing JavaScript origins
- **Solution:** Add your Supabase URL to JavaScript origins

### 5. Quick Test

Try this exact URL in your browser:
```
https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://oqaowdywqxfxsirraivn.supabase.co/auth/v1/callback&response_type=code&scope=openid%20email%20profile
```

Replace `YOUR_CLIENT_ID` with your actual Google Client ID.

### 6. Alternative Testing

If Google auth still doesn't work, your app has excellent alternatives:

1. **Email Authentication** ✅ (fully working)
2. **Wallet Authentication** ✅ (fully working)
3. **All app features** ✅ (work without Google)

### 7. Get Help

If you're still stuck, provide these details:
- Your Google Client ID (first 10 characters only)
- Exact error message from browser console
- Screenshot of your Google OAuth configuration
- Screenshot of your Supabase Google provider settings

The app is designed to work perfectly without Google auth, so users can still enjoy all features!