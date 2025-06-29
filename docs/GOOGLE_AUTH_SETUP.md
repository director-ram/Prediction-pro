# Google Authentication Setup Guide for PredictPro

## Overview
This guide will help you enable Google OAuth authentication in your PredictPro application using Supabase Auth.

## Prerequisites
- Supabase project (already set up)
- Google Cloud Console account
- Domain where your app will be hosted

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 1.2 Enable Google+ API
1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in required fields:
     - App name: "PredictPro"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "PredictPro Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

### 1.4 Get Your Credentials
After creating, you'll get:
- **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123def456`)

## Step 2: Configure Supabase

### 2.1 Add Google Provider in Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and click to configure
5. Enable the Google provider
6. Enter your Google OAuth credentials:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
7. Click **Save**

### 2.2 Configure Redirect URLs
In the same Google provider settings:
- **Site URL**: `https://yourdomain.com` (your production domain)
- **Redirect URLs**: Should already be set to `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Update Your Application Code

### 3.1 Enable Google Auth in AuthModal Component
In `components/AuthModal.tsx`, change this line:

```typescript
// Change from:
disabled={true}

// To:
disabled={false}
```

And update the button text:
```typescript
// Change from:
<span>Continue with Google (Coming Soon)</span>

// To:
<span>Continue with Google</span>
```

### 3.2 Remove the Warning Notice
In `components/AuthModal.tsx`, you can remove or comment out this section:

```typescript
{/* Google Auth Notice */}
<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
  <div className="flex items-start space-x-3">
    <Info className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
    <div>
      <h4 className="text-yellow-400 font-medium mb-2">Google Sign-In Notice</h4>
      <p className="text-yellow-300 text-sm mb-3">
        Google authentication requires additional setup in the Supabase dashboard. 
        For now, please use email sign-in which works perfectly.
      </p>
      <a
        href="https://supabase.com/docs/guides/auth/social-login/auth-google"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
      >
        <span>Setup Guide for Developers</span>
        <ExternalLink size={14} />
      </a>
    </div>
  </div>
</div>
```

## Step 4: Test the Integration

### 4.1 Development Testing
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Get Started" and try "Continue with Google"
4. You should be redirected to Google's OAuth consent screen

### 4.2 Production Testing
1. Deploy your app to your production domain
2. Update the Google OAuth settings with your production URLs
3. Test the Google login flow

## Step 5: Handle User Data

Your existing code in `hooks/useSupabaseAuth.ts` already handles Google authentication properly. When a user signs in with Google:

1. Supabase creates an auth user
2. Your app creates a corresponding user profile in the `users` table
3. The user can optionally connect a crypto wallet later

## Troubleshooting

### Common Issues:

1. **"OAuth client not found"**
   - Check that your Client ID is correct in Supabase
   - Verify the redirect URI matches exactly

2. **"Redirect URI mismatch"**
   - Ensure your redirect URI in Google Console matches: `https://your-project-ref.supabase.co/auth/v1/callback`

3. **"Access blocked"**
   - Make sure your OAuth consent screen is properly configured
   - Add test users if your app is in testing mode

4. **"Invalid domain"**
   - Verify your JavaScript origins include your domain
   - Check that your domain is properly configured in Supabase

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase logs in the dashboard
3. Test with a simple redirect first
4. Ensure all URLs use HTTPS in production

## Security Considerations

1. **Never expose your Client Secret** in frontend code
2. **Use HTTPS** for all production URLs
3. **Validate redirect URIs** carefully
4. **Review OAuth scopes** - only request what you need
5. **Monitor authentication logs** in both Google Console and Supabase

## Additional Features

Once Google auth is working, you can:

1. **Pre-fill user profiles** with Google data (name, avatar)
2. **Sync Google profile updates** automatically
3. **Add Google-specific features** like calendar integration
4. **Implement Google Analytics** for better user tracking

## Support

If you encounter issues:
1. Check [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
2. Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the browser console and Supabase logs for specific error messages

Your app already has excellent error handling for authentication failures, so users will see helpful messages if something goes wrong.