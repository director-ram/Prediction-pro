# Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### 2. Netlify
```bash
npm run build
# Upload the 'out' folder to Netlify
```

### 3. GitHub Pages
```bash
npm run build
# Push the 'out' folder to gh-pages branch
```

## Environment Variables

Set these in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your-wallet-address
```

## Pre-deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Platform wallet address configured
- [ ] Google OAuth configured (if using)
- [ ] Build completes successfully (`npm run build`)

## Post-deployment Steps

1. Test all authentication methods
2. Verify wallet connections work
3. Test prediction creation and resolution
4. Confirm admin panel access
5. Check mobile responsiveness

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies are installed

### Runtime Errors
- Check browser console for client-side errors
- Verify Supabase connection
- Test wallet adapter functionality

### Authentication Issues
- Verify Supabase Auth configuration
- Check Google OAuth setup (if using)
- Test wallet connection flow