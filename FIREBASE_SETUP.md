# 🔥 Firebase Setup Guide for SmartJeb

This guide will help you set up Firebase authentication and database for SmartJeb.

## Prerequisites

- A Google account
- SmartJeb project cloned and dependencies installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "smartjeb-expenses")
4. Enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Toggle to enable
   - **Google**: Toggle to enable, then click "Save"

### Configure Google Sign-In
1. Click on Google provider
2. Add your project support email
3. Add authorized domains:
   - `localhost` (for development)
   - Your production domain (e.g., `smartjeb.vercel.app`)

> **Important**: Make sure to add `localhost` to authorized domains for local development!

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Register app:
   - App nickname: "SmartJeb Web"
   - Check "Set up Firebase Hosting" (optional)
   - Click "Register app"
5. Copy the configuration object

## Step 5: Update Your Project

1. Open `src/config/firebase.js`
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 6: Set Up Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to access their own data only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /goals/{goalId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## Step 7: Test Your Setup

1. Run your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173`
3. Try to sign up with email or Google
4. Check Firebase Console to see if user appears in Authentication

## Optional: Environment Variables

For better security, you can use environment variables:

1. Create `.env` file in project root:
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

2. Update `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## ✅ Setup Complete!

Your Firebase configuration has been updated with real credentials. The Google Sign-In should now work properly.

## Troubleshooting

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Authentication settings
   - For development: Add `localhost` 
   - For production: Add your actual domain

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Make sure user is authenticated

3. **"Configuration object is invalid"**
   - Verify all config values are correct
   - Check for typos in environment variables
   - Make sure you're using the Web app config (not Android/iOS)

4. **Google Sign-In button doesn't work**
   - Check browser console for errors
   - Verify Firebase configuration is properly loaded
   - Try in incognito mode to rule out extension conflicts
   - Clear browser cache and cookies for the site

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth/web/start)

## Next Steps

1. **Deploy to Production**: Set up hosting (Vercel, Netlify, etc.)
2. **Add Analytics**: Track user behavior with Firebase Analytics
3. **Set Up Monitoring**: Use Firebase Performance Monitoring
4. **Backup Strategy**: Set up automated Firestore backups

---

🎉 You're all set! Your SmartJeb app now has secure authentication and database storage.
