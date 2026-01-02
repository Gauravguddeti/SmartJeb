# HTTPS App Links Setup - Complete Guide

## ✅ Changes Made

### 1. Digital Asset Links File Created
**File:** `public/.well-known/assetlinks.json`

This file verifies your app ownership of the domain for Android App Links.

**Content:**
```json
{
  "package_name": "com.smartjeb.expensekeeper",
  "sha256_fingerprint": "18:25:0B:F8:1E:93:2F:E5:F3:1F:A0:6F:D8:08:17:78:9E:1E:74:B9:A3:BB:D3:91:FC:0A:E7:CE:99:BC:C0:C6"
}
```

### 2. Vercel Configuration Updated
**File:** `vercel.json`

Added routing and headers for the assetlinks.json file.

### 3. AndroidManifest.xml Updated
**File:** `android/app/src/main/AndroidManifest.xml`

**Removed:** Custom scheme deep links (`com.smartjeb.expensekeeper://`)

**Added:** HTTPS App Links for:
- `https://auth.smartjeb.app/callback`
- `https://smartjeb.vercel.app/callback` (fallback)

### 4. OAuth Code Updated
**File:** `src/context/AuthContext.jsx`

Changed redirect URL from custom scheme to HTTPS:
- `com.smartjeb.expensekeeper://auth/callback` ❌
- `https://auth.smartjeb.app/callback` ✅

---

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

```bash
# Build the app
npm run build

# Commit changes
git add .
git commit -m "Implement HTTPS App Links for OAuth"
git push

# Vercel will auto-deploy, OR manually deploy:
vercel --prod
```

### Step 2: Set Up Custom Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `auth.smartjeb.app`
3. Configure DNS (add CNAME record):
   ```
   Type: CNAME
   Name: auth
   Value: cname.vercel-dns.com
   ```

### Step 3: Verify Digital Asset Links

After deployment, test the file is accessible:
```
https://auth.smartjeb.app/.well-known/assetlinks.json
```

**OR** use the fallback:
```
https://smartjeb.vercel.app/.well-known/assetlinks.json
```

You should see the JSON content with your package name and certificate fingerprint.

### Step 4: Rebuild and Install Android App

```bash
# Sync Capacitor
npm run build
npx cap sync android

# Build APK
cd android
.\gradlew clean assembleDebug

# Install on device
.\gradlew installDebug
```

---

## 🧪 Testing

### 1. Test App Link Association

**On your Android device:**
```bash
adb shell pm get-app-links com.smartjeb.expensekeeper
```

**Expected output:**
```
com.smartjeb.expensekeeper:
  ID: ... 
  Signatures: ... 
  Domain verification state:
    auth.smartjeb.app: verified
    smartjeb.vercel.app: verified
```

### 2. Test Manual Deep Link

```bash
adb shell am start -W -a android.intent.action.VIEW -d "https://auth.smartjeb.app/callback?test=1" com.smartjeb.expensekeeper
```

**Expected:** App should open and log: `🔗 Deep link received: https://auth.smartjeb.app/callback?test=1`

### 3. Test Full OAuth Flow

1. Open app
2. Tap "Continue with Google"
3. Complete Google authentication
4. **Browser should redirect to app automatically** ✅
5. App should show: `✅ OAuth session established successfully`

---

## 🔧 Troubleshooting

### Issue: "Domain verification state: none"

**Solution:** Check these:

1. **Verify assetlinks.json is accessible:**
   ```bash
   curl https://auth.smartjeb.app/.well-known/assetlinks.json
   ```

2. **Verify JSON is valid:**
   - Must be valid JSON
   - Must have correct package name
   - Must have correct SHA256 fingerprint

3. **Force re-verification:**
   ```bash
   adb shell pm verify-app-links --re-verify com.smartjeb.expensekeeper
   ```

### Issue: "App doesn't open after OAuth"

**Check:**
1. Domain is accessible: `https://auth.smartjeb.app`
2. Supabase redirect URLs match: `https://auth.smartjeb.app/callback`
3. App Links are verified (see test #1 above)

### Issue: "Using debug.keystore, need release fingerprint"

**When you create a release build, get the release certificate fingerprint:**

```bash
keytool -list -v -keystore path/to/your/release.keystore -alias your-alias
```

Then update `public/.well-known/assetlinks.json` with the **release SHA256 fingerprint**.

---

## 📝 Important Notes

### Current Setup (Debug)
- Using **debug.keystore** fingerprint
- Works for testing only
- Must update for Play Store release

### For Production Release
1. Generate release keystore
2. Get release SHA256 fingerprint
3. Update `assetlinks.json` with release fingerprint
4. **Keep both debug AND release fingerprints** during development:
   ```json
   "sha256_cert_fingerprints": [
     "18:25:0B:... (debug)",
     "AB:CD:EF:... (release)"
   ]
   ```

### Domain Options

**Primary (preferred):**
- `https://auth.smartjeb.app/callback`

**Fallback (works now):**
- `https://smartjeb.vercel.app/callback`

Both domains are configured. You can use the Vercel domain immediately while setting up the custom subdomain.

---

## ✅ Verification Checklist

Before testing, confirm:

- [ ] `assetlinks.json` is accessible at `https://smartjeb.vercel.app/.well-known/assetlinks.json`
- [ ] Supabase redirect URLs updated (only 2 URLs: localhost + https callback)
- [ ] AndroidManifest has HTTPS intent filters (no custom schemes)
- [ ] OAuth code uses HTTPS redirect URL
- [ ] App rebuilt and installed
- [ ] App Links verified with `adb shell pm get-app-links`

---

## 🎯 Next Steps

1. **Now:** Deploy to Vercel, test with `smartjeb.vercel.app`
2. **Soon:** Set up `auth.smartjeb.app` subdomain
3. **Before Play Store:** Get release keystore fingerprint and update `assetlinks.json`

---

**Your debug certificate fingerprint:**
```
18:25:0B:F8:1E:93:2F:E5:F3:1F:A0:6F:D8:08:17:78:9E:1E:74:B9:A3:BB:D3:91:FC:0A:E7:CE:99:BC:C0:C6
```

Save this for reference!
