/**
 * Authentication services using Supabase
 */
import { supabase, TABLES } from './supabase';
import UserProfile from '../models/User';
import * as SecureStore from 'expo-secure-store';
import { Session, AuthError, User, AuthResponse } from '@supabase/supabase-js';

// Register with email and password
export const registerWithEmail = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    
    if (data?.user) {
      await createUserProfile(data.user);
    }
    
    return data?.user || null;
  } catch (error) {
    console.error('Error registering with email:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data?.user) {
      await updateLastLogin(data.user.id);
    }
    
    return data?.user || null;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Sign in with OAuth provider (Google, Apple, etc.)
export const signInWithOAuth = async (provider: 'google' | 'apple'): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider,
      options: {
        redirectTo: 'exp://localhost:19000/auth/callback'
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clean up local storage
    await SecureStore.deleteItemAsync('supabase.auth.token');
    await SecureStore.deleteItemAsync('userProfile');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Update user profile
// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://localhost:19000/reset-password'
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Update user password
export const updatePassword = async (password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return data?.session || null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return data?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Create user profile in database
export const createUserProfile = async (user: User): Promise<void> => {
  const createdAt = new Date().getTime();
  
  try {
    const { error } = await supabase.from(TABLES.PROFILES).upsert({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: createdAt,
      last_login_at: createdAt,
      notification_permission_granted: false,
      dark_mode: false,
      currency: 'INR'
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Update last login timestamp
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.PROFILES)
      .update({ last_login_at: new Date().getTime() })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Format the data to match our User model
    if (data) {
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.avatar_url,
        createdAt: data.created_at,
        lastLoginAt: data.last_login_at,
        notificationPermissionGranted: data.notification_permission_granted,
        darkMode: data.dark_mode,
        currency: data.currency
      };
      
      // Cache the profile
      await SecureStore.setItemAsync('userProfile', JSON.stringify(userProfile));
      
      return userProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Transform our model fields to match the database column names
    const dbProfile: Record<string, any> = {};
    
    if (profile.displayName !== undefined) dbProfile.display_name = profile.displayName;
    if (profile.photoURL !== undefined) dbProfile.avatar_url = profile.photoURL;
    if (profile.notificationPermissionGranted !== undefined) dbProfile.notification_permission_granted = profile.notificationPermissionGranted;
    if (profile.darkMode !== undefined) dbProfile.dark_mode = profile.darkMode;
    if (profile.currency !== undefined) dbProfile.currency = profile.currency;
    
    const { error } = await supabase
      .from(TABLES.PROFILES)
      .update(dbProfile)
      .eq('id', userId);
    
    if (error) throw error;
    
    // Get the updated profile
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Update user settings - convenience method that works with our User model directly
export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserProfile>
): Promise<UserProfile | null> => {
  return await updateUserProfile(userId, settings);
};

export default {
  registerWithEmail,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateUserSettings
};
