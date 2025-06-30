import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Comprehensive Firebase hosting detection prevention
if (typeof window !== 'undefined') {
  // Prevent all Firebase hosting-related requests
  window.__firebase_hosting_disabled = true;
  window.__firebase_hosting_domain = false;
  
  // Intercept and block the problematic init.json request
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('firebase/init.json')) {
      console.log('Blocked Firebase hosting init request:', url);
      return Promise.reject(new Error('Firebase hosting disabled'));
    }
    return originalFetch.apply(this, args);
  };
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBo379j77KjjE2E5jPB7Uds5Uh3KnLCCtI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartjeb-4b5e1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartjeb-4b5e1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartjeb-4b5e1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "522476571447",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:522476571447:web:29bb5d327bc90acdcaa8b2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NGW4Z0WBKZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set auth language (optional)
auth.languageCode = 'en';

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider with proper configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Log successful initialization
console.log('Firebase initialized successfully for production');
console.log('Auth domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);

export default app;
