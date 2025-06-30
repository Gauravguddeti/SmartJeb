# Quick Google OAuth Setup Guide

## Step 1: Find Your Supabase Project Reference

### Option A: From Dashboard URL
- Go to your Supabase project dashboard
- Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Copy the part after `/project/`

### Option B: From API Settings (Recommended)
1. Go to Supabase Dashboard → Settings → API
2. Find "Project URL": `https://YOUR_PROJECT_REF.supabase.co`
3. Your project reference is the part before `.supabase.co`

## Step 2: Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" and enable it

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add these Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   http://localhost:5173
   ```
   
   **Replace YOUR_PROJECT_REF with your actual project reference!**

## Step 4: Configure Supabase

1. In Supabase Dashboard → Authentication → Providers
2. Enable "Google"
3. Enter your Google OAuth:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
4. Save

## Step 5: Test

Your redirect URIs should be:
- **Production**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- **Development**: `http://localhost:5173`

## Example with Real Project Reference

If your project reference is `xyzabc123456`, then:
- **Supabase URL**: `https://xyzabc123456.supabase.co`
- **Redirect URI**: `https://xyzabc123456.supabase.co/auth/v1/callback`

## Troubleshooting

### Can't find project reference?
1. Check Supabase Settings → General → Reference ID
2. Or look at Settings → API → Project URL

### Google OAuth not working?
1. Make sure Google+ API is enabled
2. Check redirect URIs match exactly
3. Wait 5-10 minutes for Google changes to propagate
