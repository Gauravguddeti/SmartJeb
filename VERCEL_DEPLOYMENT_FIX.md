# 🚀 Vercel Deployment Fix Guide

## 🔍 **Why Your Vercel App Shows Old Version**

The "₹500.00 dinner" expense appearing in guest mode indicates Vercel is serving a cached or old version of your app.

## ✅ **Step-by-Step Fix:**

### 1. **Force Vercel Redeploy**
Go to your Vercel dashboard:
1. Open [vercel.com](https://vercel.com) → Your Project
2. Go to **Deployments** tab
3. Click the **3 dots** on the latest deployment
4. Select **"Redeploy"** 
5. Check **"Use existing Build Cache"** = **OFF**
6. Click **"Redeploy"**

### 2. **Check Environment Variables**
In Vercel dashboard → **Settings** → **Environment Variables**:
```
VITE_SUPABASE_URL=https://nantppvvwcoyfstdxjry.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```
**Important:** Make sure these are set for **Production** environment!

### 3. **Verify Build Settings**
In Vercel dashboard → **Settings** → **Git**:
- **Auto-deploy** should be **ON**
- **Production Branch** should be **master**
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `dist` (should be auto-detected)

### 4. **Clear All Caches**
In Vercel dashboard → **Settings** → **Functions**:
- Scroll down to **"Edge Cache"**
- Click **"Purge Everything"**

### 5. **Verify Latest Commit**
Check that your latest commit appears in Vercel:
- Go to **Deployments** tab
- Latest deployment should show commit: `"Fix Receipt Modal & Deployment Issues"`
- If not, manually trigger deployment

## 🔧 **Alternative: Force Deploy via Git**

Run these commands to force a new deployment:

```bash
# Create an empty commit to trigger deployment
git commit --allow-empty -m "🚀 Force Vercel redeploy - clear cache"
git push origin master
```

## 🧪 **Test After Deployment:**

1. **Wait 2-3 minutes** for deployment to complete
2. Visit your Vercel URL (clear browser cache first!)
3. Try "Guest Mode" - should NOT show the ₹500 dinner
4. Test Google OAuth - should work without errors
5. Test receipt upload - should open in proper modal

## 📱 **Clear Browser Cache:**

Before testing:
1. Press **Ctrl+Shift+R** (hard refresh)
2. Or open in **Incognito/Private** window
3. Or clear browser cache completely

## 🔍 **Debugging Steps:**

If still showing old version:

### Check 1: Verify Vercel Build Logs
1. Go to Vercel → Deployments → Latest deployment
2. Click **"View Build Logs"**
3. Look for any errors or warnings

### Check 2: Compare Timestamps
1. Check commit timestamp on GitHub
2. Check deployment timestamp on Vercel
3. They should match

### Check 3: Environment Variables
Make sure all required environment variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🎯 **Expected Behavior After Fix:**

✅ **Guest Mode:** 
- No pre-existing expenses
- Clean slate for new users
- Guest data migrates properly on auth

✅ **Google OAuth:**
- Works without errors
- Properly redirects back to app
- Session management works correctly

✅ **Receipt Upload:**
- Opens in full-screen modal
- Download functionality works
- Error handling for broken images

## 🆘 **Emergency Fix:**

If Vercel still won't update:

1. **Delete and recreate** the Vercel project:
   - Go to Settings → Advanced → Delete Project
   - Re-import from GitHub
   - Set environment variables again

2. **Use different branch:**
   ```bash
   git checkout -b production-fix
   git push origin production-fix
   ```
   Then change Vercel to deploy from `production-fix` branch

## 📞 **Need Help?**

If you're still seeing issues after following these steps:
1. Check Vercel deployment logs for errors
2. Verify all environment variables are correctly set
3. Try deploying from a fresh branch
4. Consider clearing CDN cache if using custom domain
