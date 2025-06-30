import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Create user document in Firestore if it doesn't exist
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: new Date(),
              settings: {
                darkMode: false,
                notifications: true,
                currency: 'INR'
              }
            });
          }
          
          setUser(user);
        } catch (error) {
          console.error('Error handling user authentication:', error);
          toast.error('Failed to set up user account. Please try again.');
          // Sign out the user if there's an error setting up their account
          await signOut(auth);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check for redirect result on page load
    const checkRedirectResult = async () => {
      try {
        console.log('Checking for redirect result...');
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect result found:', result.user?.email);
          toast.success('Signed in with Google!');
        } else {
          console.log('No redirect result found');
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
        console.error('Redirect error details:', {
          code: error.code,
          message: error.message,
          customData: error.customData
        });
        
        if (error.code === 'auth/network-request-failed') {
          toast.error('Network error during sign-in. Please try again.');
        } else {
          toast.error(`Google sign-in failed: ${error.message}`);
        }
      }
    };

    checkRedirectResult();
    return unsubscribe;
  }, []);

  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: displayName
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        displayName: displayName,
        photoURL: null,
        createdAt: new Date(),
        settings: {
          darkMode: false,
          notifications: true,
          currency: 'INR'
        }
      });

      toast.success('Account created successfully!');
      return result.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return result.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (forceRedirect = false) => {
    try {
      setLoading(true);
      
      // Always use redirect in production environment
      const isProduction = window.location.hostname !== 'localhost';
      const shouldUseRedirect = forceRedirect || isProduction;
      
      console.log('Google Sign-In Environment:', {
        hostname: window.location.hostname,
        isProduction,
        shouldUseRedirect
      });
      
      if (shouldUseRedirect) {
        console.log('Using redirect method for Google Sign-In');
        // Use redirect method for production or when explicitly requested
        await signInWithRedirect(auth, googleProvider);
        // Note: User will be redirected and page will reload
        // The redirect result will be handled in useEffect
        return;
      } else {
        console.log('Using popup method for Google Sign-In');
        // Try popup method for localhost only
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup sign-in successful:', result.user?.email);
        toast.success('Signed in with Google!');
        return result.user;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        customData: error.customData
      });
      
      // Handle specific error cases
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        toast.error('Popup blocked! Trying redirect method...');
        // Retry with redirect
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('Redirect sign-in error:', redirectError);
          toast.error('Google sign-in failed. Please try again.');
          throw redirectError;
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled by user');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Google sign-in. Please contact support.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google sign-in is not enabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(`Google sign-in failed: ${error.message}`);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
