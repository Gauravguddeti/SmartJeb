# Supabase Setup Guide for SmartJeb

## Prerequisites
- A Supabase account (https://supabase.com)
- This SmartJeb project with the latest code

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `smartjeb-expense-tracker` (or your preferred name)
   - Database Password: Generate a strong password and save it securely
   - Region: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Set up Database Schema

1. In your Supabase dashboard, go to the "SQL Editor" tab
2. Copy the entire contents of `supabase-schema.sql` from this project
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `profiles` table for user profiles
- `expenses` table for expense data
- `goals` table for savings goals
- Row Level Security (RLS) policies
- Automatic triggers for profile creation and timestamp updates

## Step 3: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" > "Settings"
2. Under "Site URL", add your local development URL: `http://localhost:5173`
3. Under "Redirect URLs", add: `http://localhost:5173`

### Enable Google OAuth (Optional)
1. Go to "Authentication" > "Providers"
2. Enable "Google"
3. Add your Google OAuth credentials:
   - Go to Google Cloud Console
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Step 4: Get API Keys

1. In Supabase dashboard, go to "Settings" > "API"
2. Copy the following values:
   - Project URL
   - Anon/Public Key

## Step 5: Configure Environment Variables

1. In your SmartJeb project root directory, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the values:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Try the following:
   - Sign up with email/password
   - Sign in with Google (if configured)
   - Add some expenses and goals
   - Sign out and sign back in to verify data persistence
   - Try guest mode to ensure local storage still works

## Step 7: Deploy to Production

### Update Environment Variables for Production
When deploying to Vercel, Netlify, or other platforms:

1. Add the same environment variables to your hosting platform
2. Update the Site URL and Redirect URLs in Supabase to match your production domain
3. Update Google OAuth redirect URIs if using Google authentication

### Example for Vercel:
1. In Vercel dashboard, go to your project settings
2. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Features Enabled

After setup, your SmartJeb app will have:

✅ **User Authentication**
- Email/password signup and signin
- Google OAuth (if configured)
- Guest mode with local storage fallback

✅ **Data Persistence**
- Authenticated users: Data stored in Supabase
- Guest users: Data stored locally (with warnings)
- Automatic sync when signing in

✅ **Security**
- Row Level Security ensures users only see their own data
- Secure authentication with Supabase Auth

✅ **Real-time Capabilities**
- Ready for real-time updates (can be added later)
- Scalable PostgreSQL database

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check that your .env file is properly configured
   - Ensure VITE_ prefix is used for environment variables
   - Restart your development server after adding .env

2. **Authentication not working**
   - Verify Site URL and Redirect URLs in Supabase dashboard
   - Check browser console for CORS errors
   - Ensure your domain is added to allowed origins

3. **Data not saving**
   - Check browser console for Supabase errors
   - Verify RLS policies are set up correctly
   - Test with SQL Editor to ensure tables exist

4. **Google OAuth issues**
   - Verify Google Cloud Console setup
   - Check redirect URIs match exactly
   - Ensure Google+ API is enabled

### Getting Help

- Supabase Documentation: https://supabase.com/docs
- SmartJeb GitHub Issues: (your repo link)
- Supabase Discord: https://discord.supabase.com

## Next Steps

Once everything is working:
- Consider adding real-time features
- Set up automated backups
- Add email templates for auth flows
- Implement additional OAuth providers
- Add data export/import features
