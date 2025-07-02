import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // Only initialize auth if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured. Authentication will be limited to guest mode.')
      setLoading(false)
      return
    }

    let isMounted = true; // Prevent memory leaks

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          setUser(session?.user ?? null)
          setIsGuest(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (isMounted) {
          setUser(null)
          setIsGuest(false)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return; // Prevent state updates after unmount
      
      const newUser = session?.user ?? null;
      const wasGuest = isGuest;
      
      console.log('Auth state change:', event, 'User:', newUser?.email, 'Was guest:', wasGuest);
      console.log('Session details:', {
        hasSession: !!session,
        hasUser: !!newUser,
        userEmail: newUser?.email,
        userId: newUser?.id,
        isAnonymous: newUser?.is_anonymous
      });
      
      setUser(newUser);
      setIsGuest(false);
      setLoading(false);

      console.log('🔄 User state updated:', { 
        hasUser: !!newUser, 
        userEmail: newUser?.email,
        isGuest: false, 
        loading: false,
        isAuthenticated: !!newUser
      });

      // Just show success message
      if (newUser && event === 'SIGNED_IN' && session?.access_token) {
        const isCompleteAuth = session.user.email && session.user.id && !session.user.is_anonymous;
        const lastSignInToastTime = localStorage.getItem('smartjeb-last-signin-toast');
        const now = Date.now();
        const oneMinuteAgo = now - (60 * 1000); // 1 minute in milliseconds
        
        // Only show toast if it's a complete auth and we haven't shown it in the last minute
        if (isCompleteAuth && (!lastSignInToastTime || parseInt(lastSignInToastTime) < oneMinuteAgo)) {
          toast.success('Signed in successfully!');
          localStorage.setItem('smartjeb-last-signin-toast', now.toString());
        }
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsGuest(false)
        console.log('User signed out, state reset');
      }

      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    })

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    }
  }, [])

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase not configured. Please set up your environment variables.' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }

  // Sign up with email and password
  const signUpWithEmail = async (email, password, userData = {}) => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase not configured. Please set up your environment variables.' }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase not configured. Please set up your environment variables.' }
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          },
          skipBrowserRedirect: false
        }
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Sign out
  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // For local-only mode, just clear the state
      setUser(null)
      setIsGuest(false)
      // Clear app state flags but keep welcome for guest->auth users
      localStorage.removeItem('smartjeb-visited')
      // Keep welcome-seen flag so users don't see onboarding again
      // localStorage.removeItem('smartjeb-welcome-seen') // Don't clear this
      // Force a page reload to reset app state completely
      window.location.reload()
      return
    }

    try {
      // Check if user is actually signed in before trying to sign out
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('Signing out user with active session')
        // Use global scope to clear all sessions including OAuth
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        if (error) {
          console.error('Supabase signOut error:', error)
          // Don't throw error, just log it and continue with local cleanup
        }
      } else {
        console.log('No active session found, performing local cleanup only')
      }
      
      // Always clear local state regardless of Supabase response
      setUser(null)
      setIsGuest(false)
      
      // Clear app state data but keep welcome/onboarding flags per user
      localStorage.removeItem('smartjeb-visited')
      // Keep welcome-seen flag so users don't see onboarding again
      // localStorage.removeItem('smartjeb-welcome-seen') // Don't clear this
      localStorage.removeItem('smartjeb-expenses')
      sessionStorage.removeItem('smartjeb-guest-expenses')
      sessionStorage.removeItem('smartjeb-guest-goals')
      
      // Clear any Supabase stored session data - more comprehensive cleanup
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase') || key.includes('oauth')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear all session storage
      sessionStorage.clear()
      
      // Clear Google-specific session data
      await clearGoogleSession();
      
      // Clear browser history to remove OAuth redirect state
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
      }
      
      toast.success('Signed out successfully')
      
      // Force a complete page reload to ensure all state is cleared
      setTimeout(() => {
        window.location.href = window.location.origin; // Navigate to root
      }, 500)
    } catch (error) {
      console.error('Error signing out:', error)
      
      // Even if sign out fails, clear local state
      setUser(null)
      setIsGuest(false)
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear Google session on error too
      try {
        await clearGoogleSession();
      } catch (e) {
        console.log('Error clearing Google session on error:', e);
      }
      
      toast.error('Signed out locally (server error)')
      window.location.href = window.location.origin; // Navigate to root
    }
  }

  // Enter guest mode
  const enterGuestMode = () => {
    setUser(null)
    setIsGuest(true)
    setLoading(false)
  }

  // Exit guest mode
  const exitGuestMode = () => {
    setIsGuest(false)
    // Clear any guest data from sessionStorage (guest mode uses sessionStorage)
    sessionStorage.removeItem('smartjeb-guest-expenses')
    sessionStorage.removeItem('smartjeb-guest-goals')
    sessionStorage.removeItem('smartjeb-guest-categories')
    sessionStorage.removeItem('smartjeb-guest-budget')
  }

  // Clean up any leftover migration data on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Always clean up migration data on page unload
      localStorage.removeItem('smartjeb-guest-migration-data');
      localStorage.removeItem('smartjeb-guest-backup');
      localStorage.removeItem('smartjeb-global-migration-lock');
      sessionStorage.removeItem('smartjeb-migration-in-progress');
      console.log('Page unload - cleaned up migration data');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user,
    isSupabaseConfigured,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    enterGuestMode,
    exitGuestMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}