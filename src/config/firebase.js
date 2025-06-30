import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo379j77KjjE2E5jPB7Uds5Uh3KnLCCtI",
  authDomain: "smartjeb-4b5e1.firebaseapp.com",
  projectId: "smartjeb-4b5e1",
  storageBucket: "smartjeb-4b5e1.firebasestorage.app",
  messagingSenderId: "522476571447",
  appId: "1:522476571447:web:29bb5d327bc90acdcaa8b2",
  measurementId: "G-NGW4Z0WBKZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Google Auth Provider with proper configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
