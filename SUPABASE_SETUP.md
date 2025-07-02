# 🚀 Supabase Setup Guide for PennyLog

## 📋 Overview
PennyLog requires Supabase for user authentication and data storage. Follow this guide to set up your own Supabase project.

## ⚠️ Current Issue
The demo Supabase project URL (`nantppvvwcoyfstdxjry.supabase.co`) is no longer available. You need to create your own Supabase project.

## 🔧 Setup Instructions

### Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Project
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `pennylog-expense-tracker` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for the project to be ready (2-3 minutes)

### Step 3: Get Your Project Credentials
1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 4: Update Environment Variables
1. Open the `.env` file in your project root
2. Replace the values:
   ```env
   # Replace with your actual Supabase URL
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   
   # Replace with your actual anon key
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Set Up Database Tables
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the provided SQL script (`supabase-schema.sql`)
3. This will create the necessary tables for expenses and user data

### Step 6: Configure Authentication
1. Go to **Authentication** → **Settings**
2. **Site URL**: Add your app's URL (e.g., `http://localhost:5173` for development)
3. **Redirect URLs**: Add the same URL
4. **Enable Google OAuth** (optional):
   - Go to **Authentication** → **Providers**
   - Enable Google
   - Add your Google OAuth credentials

### Step 7: Set Up Storage (Optional - for receipts)
1. Go to **Storage**
2. Create a new bucket called `receipts`
3. Set the bucket to public if you want receipts to be viewable
4. Configure RLS (Row Level Security) policies as needed

## 🔄 Restart Your Development Server
After updating the environment variables:
```bash
npm run dev
```

## ✅ Verification
1. Open your app
2. You should no longer see the yellow warning banner
3. Sign up/sign in should work properly
4. User data should persist across sessions

## 🛠️ Troubleshooting

### Issue: "Failed to load resource: net::ERR_NAME_NOT_RESOLVED"
- **Solution**: Your Supabase URL is incorrect or the project doesn't exist
- **Fix**: Double-check your `.env` file and Supabase project URL

### Issue: "Invalid API key"
- **Solution**: Your anon key is incorrect
- **Fix**: Copy the anon key again from Supabase Settings → API

### Issue: Authentication doesn't work
- **Solution**: Check your redirect URLs in Supabase Auth settings
- **Fix**: Ensure your app URL is added to allowed redirect URLs

### Issue: Guest mode works but authentication doesn't
- **Solution**: Database tables might not be created
- **Fix**: Run the SQL schema script in Supabase SQL Editor

## 🆓 Free Tier Limits
Supabase free tier includes:
- ✅ Up to 50,000 monthly active users
- ✅ Up to 500MB database storage
- ✅ Up to 1GB file storage
- ✅ Up to 2GB bandwidth per month

This is more than enough for personal expense tracking!

## 📞 Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify your `.env` file configuration
3. Check Supabase project status in the dashboard
4. Ensure all database tables are created properly

## 🔒 Security Notes
- Never commit your `.env` file to git
- Keep your Supabase credentials secure
- Use Row Level Security (RLS) for production apps
- Regularly update your Supabase project
