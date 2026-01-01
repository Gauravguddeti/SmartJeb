/**
 * Authentication context provider using Supabase
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';
import * as authService from '../services/authService';
import UserProfile from '../models/User';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (userId: string, profile: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const initialState: AuthContextType = {
  user: null,
  session: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => null,
};

// Create the context
export const AuthContext = createContext<AuthContextType>(initialState);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthContextType>({
    ...initialState,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signOut: handleSignOut,
    signInWithGoogle: handleSignInWithGoogle,
    resetPassword: handleResetPassword,
    updateUserProfile: handleUpdateUserProfile,
  });

  // Sign in with email and password
  async function signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.signInWithEmail(email, password);
      
      if (user) {
        const userProfile = await authService.getUserProfile(user.id);
        setState(prev => ({ 
          ...prev, 
          user, 
          userProfile, 
          isAuthenticated: true 
        }));
      }
      
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }

  // Sign up with email and password
  async function signUpWithEmail(email: string, password: string): Promise<User | null> {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.registerWithEmail(email, password);
      
      if (user) {
        const userProfile = await authService.getUserProfile(user.id);
        setState(prev => ({ 
          ...prev, 
          user, 
          userProfile, 
          isAuthenticated: true 
        }));
      }
      
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }

  // Sign in with Google
  async function handleSignInWithGoogle(): Promise<void> {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authService.signInWithOAuth('google');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }

  // Sign out
  async function handleSignOut(): Promise<void> {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authService.signOut();
      
      setState({
        ...initialState,
        isLoading: false,
        signIn: signInWithEmail,
        signUp: signUpWithEmail,
        signOut: handleSignOut,
        signInWithGoogle: handleSignInWithGoogle,
        resetPassword: handleResetPassword,
        updateUserProfile: handleUpdateUserProfile,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }

  // Reset password
  async function handleResetPassword(email: string): Promise<void> {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }

  // Update user profile
  async function handleUpdateUserProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const updatedProfile = await authService.updateUserProfile(userId, profile);
      
      if (updatedProfile) {
        setState(prev => ({ 
          ...prev, 
          userProfile: updatedProfile
        }));
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }

  // Effect to check authentication state on app start
  useEffect(() => {
    // Set up the Supabase auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === 'SIGNED_IN' && session) {
          // User has signed in
          const { user } = session;
          
          // Get user profile
          const userProfile = await authService.getUserProfile(user.id);
          
          setState(prev => ({
            ...prev,
            user,
            session,
            userProfile,
            isLoading: false,
            isAuthenticated: true,
          }));
        } else if (event === 'SIGNED_OUT') {
          // User has signed out
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            userProfile: null,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user } = session;
          const userProfile = await authService.getUserProfile(user.id);
          
          setState(prev => ({
            ...prev,
            user,
            session,
            userProfile,
            isLoading: false,
            isAuthenticated: true,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };
    
    checkSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
