# Fresh Google OAuth Setup for SmartJeb

## 🔄 Reset Instructions (If you have issues)

If you're having Google OAuth issues, follow these steps to reset completely:

### Step 1: Clean Up Existing Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Delete any existing OAuth 2.0 Client IDs for this project
3. In Supabase Dashboard → Authentication → Providers → Disable Google (if enabled)

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
   http://localhost:5173/auth/callback
   ```
   
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
3. Add **Redirect URLs**:
   - `http://localhost:5173`
   - `http://localhost:5173/auth/callback`

### Step 5: Test Configuration
1. Start your local dev server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try "Sign in with Google"

## 🚨 Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Check that redirect URIs in Google Cloud Console exactly match:
- `https://nantppvvwcoyfstdxjry.supabase.co/auth/v1/callback`
- `http://localhost:5173/auth/callback`

### Issue: "Error 403: access_denied"
**Solution**: 
1. Make sure Google+ API is enabled
2. Check OAuth consent screen is configured
3. Add test users if app is not published

### Issue: "Invalid login hint"
**Solution**: Clear browser cookies and try again

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
- **Local Redirect URI**: http://localhost:5173/auth/callback

If you continue having issues, create a completely new Google Cloud project and follow these steps exactly.
