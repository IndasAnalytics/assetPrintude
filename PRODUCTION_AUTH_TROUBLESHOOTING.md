# Production Authentication Troubleshooting Guide

## Issue: Infinite Redirect Loop in Production

### Symptoms
- Login works fine in localhost/development
- Login redirects infinitely in production
- Postman shows successful login with cookie
- Browser doesn't store authentication cookie

### Root Cause
The authentication cookie requires specific configuration for production environments:
- **HTTPS Requirement**: When `COOKIE_SECURE=true`, cookies only work over HTTPS
- **Domain Configuration**: Production domains need explicit cookie domain settings
- **Browser Security**: Modern browsers enforce strict cookie policies

## Solution Steps

### 1. Configure Environment Variables

Update your production environment variables (`.env` or deployment platform):

```env
# CRITICAL: Set this to "true" ONLY if your site uses HTTPS
COOKIE_SECURE=true

# Set your domain (with leading dot for subdomains)
# Examples:
#   Single domain: COOKIE_DOMAIN=yourdomain.com
#   With subdomains: COOKIE_DOMAIN=.yourdomain.com
COOKIE_DOMAIN=.yourdomain.com

# Ensure this is set
NODE_ENV=production

# Your production URL (must match cookie domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DOMAIN_URL=https://yourdomain.com
```

### 2. Verify HTTPS Configuration

**Your site MUST use HTTPS when `COOKIE_SECURE=true`**

✅ Check your deployment:
- Vercel/Netlify: HTTPS enabled by default
- Custom server: Ensure SSL certificates are installed
- Load balancer: Verify HTTPS termination is configured

❌ If you don't have HTTPS:
```env
# Temporary workaround (NOT recommended for production)
COOKIE_SECURE=false
```

### 3. Test Cookie in Browser

After deploying with correct settings:

1. Open **DevTools** (F12) → **Application** → **Cookies**
2. Navigate to your login page
3. Enter credentials and login
4. Check if `auth-token` cookie appears in the list

**Cookie should show:**
- Name: `auth-token`
- Domain: Your domain (e.g., `.yourdomain.com`)
- Path: `/`
- Secure: ✓ (if HTTPS)
- HttpOnly: ✓
- SameSite: `Lax`

### 4. Check Server Logs

The application now includes debug logging:

**On login (in API response):**
```
🍪 Login - Cookie set with options: {
  secure: true,
  domain: '.yourdomain.com',
  sameSite: 'lax',
  path: '/',
  user: 'user@example.com'
}
```

**In middleware (if no cookie found):**
```
🔒 Middleware - No token found for path: /app/dashboard
🍪 Middleware - All cookies: none
```

**In middleware (if token verified):**
```
✅ Middleware - Token verified for user: user@example.com Path: /app/dashboard
```

### 5. Common Issues & Fixes

#### Issue: Cookie not appearing in browser

**Cause**: `COOKIE_SECURE=true` but site is HTTP (not HTTPS)

**Fix**:
```env
# Option 1: Enable HTTPS (RECOMMENDED)
# Configure SSL certificate on your server/deployment

# Option 2: Disable secure flag (NOT RECOMMENDED)
COOKIE_SECURE=false
```

#### Issue: Cookie appears but auth still fails

**Cause**: Cookie domain mismatch

**Fix**:
```env
# If your site is: app.yourdomain.com
COOKIE_DOMAIN=.yourdomain.com

# If your site is: yourdomain.com
COOKIE_DOMAIN=yourdomain.com

# If API is on different subdomain (api.yourdomain.com)
COOKIE_DOMAIN=.yourdomain.com
```

#### Issue: Works in one browser but not others

**Cause**: Browser-specific cookie policies (Safari is strict)

**Fix**:
1. Ensure `sameSite: "lax"` (already configured)
2. Verify domain doesn't have leading dot for single domain
3. Check browser's privacy settings

#### Issue: Cookie clears after page refresh

**Cause**: `maxAge` not set or session cookie

**Fix**: Already configured to 7 days (604800 seconds)

### 6. Deployment Platform-Specific

#### Vercel
```env
# In Vercel dashboard → Settings → Environment Variables
COOKIE_SECURE=true
COOKIE_DOMAIN=.yourdomain.com
```

#### Netlify
```env
# In Netlify dashboard → Site settings → Environment variables
COOKIE_SECURE=true
COOKIE_DOMAIN=.yourdomain.com
```

#### Docker/Custom Server
Ensure:
1. HTTPS is configured (use nginx/traefik with Let's Encrypt)
2. Environment variables are passed to container
3. Port 443 is exposed and forwarded

### 7. Quick Test

Test cookie functionality:

```bash
# Test login and check cookies
curl -i -X POST https://yourdomain.com/api/auth/client/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Look for Set-Cookie header in response:
# Set-Cookie: auth-token=...; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=.yourdomain.com
```

### 8. Emergency Rollback

If authentication is completely broken in production:

```env
# Temporary settings to restore access
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

Then investigate the issue with proper HTTPS setup.

## Security Best Practices

✅ **Do:**
- Always use HTTPS in production (`COOKIE_SECURE=true`)
- Set explicit `COOKIE_DOMAIN` for your domain
- Use strong `JWT_SECRET` (32+ random characters)
- Keep `httpOnly=true` (prevents XSS attacks)

❌ **Don't:**
- Use `COOKIE_SECURE=false` in production
- Leave `JWT_SECRET` as default value
- Set overly permissive `COOKIE_DOMAIN` (e.g., `.com`)
- Disable `httpOnly` flag

## Support

If issues persist after following this guide:
1. Check server logs for cookie setting confirmation
2. Verify middleware is receiving cookies
3. Test in incognito/private window to rule out cached cookies
4. Check browser console for CORS or security errors
5. Verify JWT_SECRET matches between deployments

## Summary of Changes

The authentication system now supports:
- ✅ Configurable cookie security via `COOKIE_SECURE`
- ✅ Explicit domain configuration via `COOKIE_DOMAIN`
- ✅ Debug logging for production troubleshooting
- ✅ Works in both development and production environments
- ✅ Compatible with all major deployment platforms
