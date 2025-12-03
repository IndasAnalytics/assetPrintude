# Vercel Deployment Guide

## Quick Fix for Infinite Redirect Issue

Your authentication infinite redirect is caused by missing or incorrect environment variables in Vercel.

### Step 1: Set Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `asset-printude`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DB_USER` | `Indus` | Your database user |
| `DB_PASSWORD` | `Param@99811` | Your database password |
| `DB_SERVER` | `157.20.215.187` | Your database server |
| `DB_NAME` | `AssetTrackDB` | Your database name |
| `DB_ENCRYPT` | `true` | Enable encryption |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` | ⚠️ Change this to a strong random value! |
| `COOKIE_SECRET` | `your-super-secret-cookie-key-change-in-production` | ⚠️ Change this to a strong random value! |
| `NODE_ENV` | `production` | **CRITICAL** |
| `COOKIE_SECURE` | `true` | **CRITICAL** - Vercel has HTTPS |
| `COOKIE_DOMAIN` | `.vercel.app` | **CRITICAL** - Enables cookies across Vercel subdomains |
| `DOMAIN_URL` | `https://asset-printude.vercel.app` | Your production URL |
| `NEXT_PUBLIC_APP_NAME` | `AssetTrack` | App name |
| `NEXT_PUBLIC_APP_URL` | `https://asset-printude.vercel.app` | Your production URL |

### Step 2: Deploy

After setting environment variables:

1. **Option A - Redeploy from Dashboard:**
   - Go to **Deployments** tab
   - Click **⋮** on latest deployment
   - Click **Redeploy**

2. **Option B - Push to Git:**
   ```bash
   git add .
   git commit -m "Fix production authentication"
   git push
   ```

Vercel will automatically deploy with the new environment variables.

### Step 3: Verify

1. Wait for deployment to complete (usually 1-2 minutes)
2. Visit your site: `https://asset-printude.vercel.app`
3. Try to login
4. Open **DevTools** (F12) → **Application** → **Cookies**
5. Verify `auth-token` cookie appears after login

## Troubleshooting

### Still getting infinite redirect?

Check server logs in Vercel:

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **Functions** tab
4. Look for login logs:
   ```
   🍪 Login - Cookie set with options: { secure: true, domain: '.vercel.app', ... }
   ```

### Cookie not appearing?

**Check cookie domain:**
- If using custom domain (e.g., `yourdomain.com`), set:
  ```
  COOKIE_DOMAIN=.yourdomain.com
  ```
- If using Vercel subdomain (`asset-printude.vercel.app`), use:
  ```
  COOKIE_DOMAIN=.vercel.app
  ```

### Environment Variables Not Taking Effect?

Vercel requires **redeployment** after changing environment variables:
1. Go to Settings → Environment Variables
2. After saving, go to Deployments
3. Click ⋮ on latest deployment → Redeploy

## Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random value (use: `openssl rand -base64 32`)
- [ ] Change `COOKIE_SECRET` to a strong random value (use: `openssl rand -base64 32`)
- [ ] Verify `COOKIE_SECURE=true`
- [ ] Verify `NODE_ENV=production`
- [ ] Test login in incognito window
- [ ] Verify cookie is set in browser DevTools
- [ ] Test logout functionality
- [ ] Test protected routes require authentication

## Generate Strong Secrets

Run these commands to generate strong secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Or use OpenSSL:
```bash
openssl rand -base64 32
```

## Custom Domain Setup

If using a custom domain (e.g., `app.yourdomain.com`):

1. Add domain in Vercel: **Settings** → **Domains**
2. Update environment variables:
   ```
   COOKIE_DOMAIN=.yourdomain.com
   DOMAIN_URL=https://app.yourdomain.com
   NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
   ```
3. Redeploy

## Environment-Specific Variables

Vercel supports environment-specific variables:

- **Production**: Variables that apply to production deployments
- **Preview**: Variables for preview deployments (PR previews)
- **Development**: Variables for local development (not used, use `.env` instead)

For this app, set all variables to **Production** only.

## Complete Setup Summary

```bash
# Production Environment Variables for Vercel

# Database
DB_USER=Indus
DB_PASSWORD=Param@99811
DB_SERVER=157.20.215.187
DB_NAME=AssetTrackDB
DB_ENCRYPT=true

# Authentication (CHANGE THESE!)
JWT_SECRET=<generate-strong-random-value>
COOKIE_SECRET=<generate-strong-random-value>

# Cookie Settings (CRITICAL FOR AUTH)
COOKIE_SECURE=true
COOKIE_DOMAIN=.vercel.app

# Application
NODE_ENV=production
DOMAIN_URL=https://asset-printude.vercel.app
NEXT_PUBLIC_APP_NAME=AssetTrack
NEXT_PUBLIC_APP_URL=https://asset-printude.vercel.app
```

## Testing Checklist

After deployment:

1. ✅ Visit `https://asset-printude.vercel.app`
2. ✅ Navigate to `/auth/client/login`
3. ✅ Login with valid credentials
4. ✅ Should redirect to `/app/dashboard` (no infinite loop)
5. ✅ Refresh page - should stay authenticated
6. ✅ Open in new tab - should stay authenticated
7. ✅ Check DevTools → Application → Cookies:
   - Cookie name: `auth-token`
   - Domain: `.vercel.app`
   - Secure: ✓
   - HttpOnly: ✓
8. ✅ Logout - cookie should be removed
9. ✅ Try accessing protected route - should redirect to login

## Common Errors

### Error: "Unauthorized" on protected routes
**Cause**: Environment variables not set or not redeployed
**Fix**: Set variables in Vercel dashboard and redeploy

### Error: Infinite redirect loop
**Cause**: Cookie not being set or read properly
**Fix**:
1. Verify `COOKIE_SECURE=true`
2. Verify `COOKIE_DOMAIN=.vercel.app`
3. Check Vercel uses HTTPS (it does by default)
4. Redeploy after setting variables

### Error: Cookie not persisting
**Cause**: Domain mismatch
**Fix**: Set `COOKIE_DOMAIN=.vercel.app` (note the leading dot)

## Support

If issues persist:
1. Check Vercel function logs for cookie setting confirmation
2. Check browser DevTools → Network → Response Headers for `Set-Cookie`
3. Verify all environment variables are set in Vercel
4. Try in incognito/private window
5. Clear browser cookies and try again

## Quick Commands

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build (test before deploying)
npm run build

# Deploy to Vercel
vercel --prod
```

---

**Last Updated**: 2025-12-03
**Production URL**: https://asset-printude.vercel.app
