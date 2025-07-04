# 🔐 Google OAuth Setup for Vercel Deployment

## Problem: Google OAuth Error on Vercel

Your app works locally but fails on Vercel with "Access blocked: authorisation error" because:
1. The production domain isn't registered with Google OAuth
2. Conflicting OAuth parameters in the authentication flow

## ✅ Solution: Fix OAuth Configuration

### Step 1: Fix OAuth Parameters (CRITICAL)
The OAuth configuration has been updated to remove conflicting parameters:

**Before (Problematic):**
```javascript
queryParams: {
  prompt: 'consent select_account', // Invalid - can't combine these
  access_type: 'offline',
  include_granted_scopes: 'false',
  approval_prompt: 'force', // Deprecated parameter
  hd: '', // Empty string causes issues
}
```

**After (Fixed):**
```javascript
queryParams: {
  prompt: 'select_account', // Valid single value
  access_type: 'offline'
}
```

### Step 2: Get Your Vercel Domain
### Step 2: Get Your Vercel Domain
1. Go to your Vercel dashboard
2. Find your project URL (e.g., `https://your-app-name.vercel.app`)
3. Copy the full URL

### Step 3: Update Google Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. In **Authorized redirect URIs**, add:
   ```
   https://your-app-name.vercel.app
   https://your-app-name.vercel.app/
   ```
5. In **Authorized JavaScript origins**, add:
   ```
   https://your-app-name.vercel.app
   ```
6. Click **Save**

### Step 4: Update Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**:
   ```
   https://your-app-name.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-app-name.vercel.app/**
   ```

### Step 5: Environment Variables on Vercel
Make sure your Vercel project has these environment variables:
```
VITE_SUPABASE_URL=https://nantppvvwcoyfstdxjry.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔄 Alternative: Use Custom Domain
If you have a custom domain:
1. Set up the custom domain in Vercel
2. Use your custom domain in all the above configurations
3. This provides better branding and consistency

## ⚡ Quick Fix Commands

After updating Google Console and Supabase, trigger a new Vercel deployment:

```bash
git commit --allow-empty -m "Trigger Vercel redeploy for OAuth fix"
git push origin master
```

## 🧪 Testing
1. Wait for Vercel deployment to complete
2. Visit your Vercel URL
3. Try Google sign-in - should work now!
4. Check browser console for any remaining errors

## 💡 Pro Tip
Always test OAuth on production domain before going live. Set up a staging environment with its own OAuth credentials for testing.
