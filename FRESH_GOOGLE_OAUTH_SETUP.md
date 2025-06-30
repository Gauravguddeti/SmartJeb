# Fresh Google OAuth Setup for SmartJeb

## � Quick Reset (If you just want to reset fast)

**Google Cloud Console Reset:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials → Delete all OAuth 2.0 Client IDs
3. APIs & Services → Library → Disable "Google+ API" and "People API"

**Supabase Reset:**
1. Authentication → Providers → Toggle Google OFF
2. Clear Client ID and Secret fields

**Then follow the full setup below ↓**

---

## �🔄 Reset Instructions (If you have issues)

If you're having Google OAuth issues, follow these steps to reset completely:

### Step 1: Clean Up Existing Setup

#### Reset Google Cloud Console OAuth Settings:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Select your project** from the dropdown at the top
3. **Delete existing OAuth credentials:**
   - Navigate to "APIs & Services" → "Credentials"
   - Look for any existing "OAuth 2.0 Client IDs"
   - Click the **trash/delete icon** next to each OAuth 2.0 Client ID
   - Confirm deletion when prompted

4. **Reset OAuth Consent Screen (if needed):**
   - Go to "APIs & Services" → "OAuth consent screen"
   - If you want to start fresh, you can:
     - Edit the existing consent screen and update details
     - Or delete test users and start over

5. **Disable APIs (optional for complete reset):**
   - Go to "APIs & Services" → "Library"
   - Find "Google+ API" and "People API"
   - Click on each and press "DISABLE" if you want a complete reset
   - You'll re-enable them in the next steps

#### Reset Supabase Settings:
1. Go to your Supabase Dashboard
2. Navigate to Authentication → Providers
3. **Disable Google provider** (toggle it off)
4. Clear any existing Client ID and Client Secret fields
5. Save the changes

### Step 2: Fresh Google OAuth Setup

#### 2.1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. **Enable required APIs:**
   - Go to "APIs & Services" → "Library"
   - Search and enable: "Google+ API" (IMPORTANT!)
   - Also enable: "People API" (for profile info)

#### 2.2: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure OAuth consent screen first:
   - Choose "External" user type
   - Fill in App name: "SmartJeb"
   - Add your email as developer contact
   - Save and continue through all steps

4. **Create OAuth Client ID:**
   - Application type: "Web application"
   - Name: "SmartJeb Web Client"
   
5. **Add Authorized redirect URIs:**
   ```
   https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback
   ```
   
   **IMPORTANT: Do NOT add localhost URLs here!** 
   - Only use the Supabase callback URL
   - Localhost URLs can cause redirect issues
   - Supabase will handle the final redirect to your local app
   
6. **Save and copy:**
   - Client ID (starts with numbers, ends with .googleusercontent.com)
   - Client Secret (random string)

### Step 3: Configure Supabase
1. Go to Supabase Dashboard → Authentication → Providers
2. **Enable Google provider**
3. Enter your credentials:
   - **Client ID**: [paste from Google Cloud Console]
   - **Client Secret**: [paste from Google Cloud Console]
4. **Save configuration**

### Step 4: Update Site URL (IMPORTANT!)
1. In Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `http://localhost:5173`
3. **Do NOT add redirect URLs manually** - Supabase handles this automatically
4. **Make sure your dev server is running** before testing:
   ```bash
   npm run dev
   ```
   Should show: "Local: http://localhost:5173"

### Step 5: Test Configuration
1. Start your local dev server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try "Sign in with Google"

## 🚨 Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Check that redirect URIs in Google Cloud Console exactly match:
- `https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback`
- **Remove any localhost URLs from Google Cloud Console**

### Issue: OAuth redirects to localhost but gets "refused to connect"
**Solution**: 
1. **Make sure your dev server is running**: `npm run dev`
2. **Remove localhost URLs** from Google Cloud Console redirect URIs
3. **Only use Supabase callback URL**: `https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback`
4. **Set Site URL in Supabase** to: `http://localhost:5173`

### Issue: After Google consent screen, goes to localhost but fails
**This is your current issue! Follow these steps:**

1. **First, make sure dev server is running:**
   ```bash
   npm run dev
   ```
   You should see: "Local: http://localhost:5173/"

2. **Clean up Google Cloud Console:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - **Remove ALL localhost URLs** from "Authorized redirect URIs"
   - **Only keep**: `https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback`

3. **Check Supabase Site URL:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Site URL should be: `http://localhost:5173`
   - Clear any custom redirect URLs

4. **Test again:**
   - Go to `http://localhost:5173` (make sure server is running)
   - Click "Sign in with Google"
   - After Google consent, it should redirect back to your local app

### Issue: "Error 403: access_denied"
**Solution**: 
1. Make sure Google+ API is enabled
2. Check OAuth consent screen is configured
3. Add test users if app is not published

### Issue: "Invalid login hint"
**Solution**: Clear browser cookies and try again

### Issue: Still having problems after following the guide?
**Complete Nuclear Reset Option:**
1. **Create a brand new Google Cloud Project:**
   - Go to Google Cloud Console
   - Click the project dropdown → "New Project"
   - Give it a fresh name like "SmartJeb-OAuth-v2"
   
2. **Follow all setup steps from scratch** with the new project

3. **Alternative: Reset existing project completely:**
   - Delete ALL credentials in "APIs & Services" → "Credentials"
   - Go to "OAuth consent screen" → Delete all test users
   - Disable ALL APIs in "APIs & Services" → "Library"
   - Wait 10-15 minutes for Google's cache to clear
   - Start fresh with Step 2 of this guide

### Issue: "This app isn't verified" warning
**Solution**: 
- This is normal for development
- Click "Advanced" → "Go to SmartJeb (unsafe)" to continue
- Or add your email as a test user in OAuth consent screen

## 📋 Verification Checklist
- [ ] Google+ API enabled in Google Cloud Console
- [ ] OAuth 2.0 Client ID created with correct redirect URIs
- [ ] Supabase Google provider enabled with correct credentials
- [ ] Site URL set to `http://localhost:5173` in Supabase
- [ ] Test Google sign-in from localhost:5173

## 🔧 Your Current Configuration
- **Supabase URL**: https://nantppvvwcoyfstdxjry.supabase.co
- **Project Ref**: nantppvvwcoyfstdxjry
- **Required Redirect URI**: https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback
- **Site URL in Supabase**: http://localhost:5173
- **Dev server must be running**: npm run dev (on port 5173)

If you continue having issues, create a completely new Google Cloud project and follow these steps exactly.

## 🚀 **FOR VERCEL DEPLOYMENT (PRODUCTION)**

### Your Vercel URL: `https://smarjeb.vercel.app`

**To make Google OAuth work on your Vercel website, follow these steps:**

### Step 1: No changes needed in Google Cloud Console
- Your current redirect URI is already correct: `https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback`
- This works for both localhost AND Vercel!

### Step 2: Update Supabase Site URL for Production
1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Change Site URL** from `http://localhost:5173` to:
   ```
   https://smarjeb.vercel.app
   ```
3. **Save the changes**

### Step 3: Test on Vercel
1. Go to: `https://smarjeb.vercel.app`
2. Click "Sign in with Google"
3. It should now work perfectly!

### Step 4: Switching Between Development and Production
- **For local development**: Set Site URL to `http://localhost:5173`
- **For Vercel production**: Set Site URL to `https://smarjeb.vercel.app`

**You only need to change the Site URL in Supabase when switching between environments.**
