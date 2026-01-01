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
  const [isGuest, setIsGuest] = useState(() => {
    // Initialize from localStorage to persist guest mode across refreshes
    return localStorage.getItem('smartjeb-guest-mode') === 'true'
  })

  useEffect(() => {
    // Only initialize auth if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase not configured. Authentication will be limited to guest mode.')
      // Check if user was in guest mode
      const wasGuestMode = localStorage.getItem('smartjeb-guest-mode') === 'true'
      if (wasGuestMode) {
        setIsGuest(true)
      }
      setLoading(false)
      return
    }

    let isMounted = true; // Prevent memory leaks

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check for guest mode first
        const isGuestMode = localStorage.getItem('smartjeb-guest-mode') === 'true'
        if (isGuestMode && isMounted) {
          console.log('Guest mode detected from localStorage')
          setIsGuest(true)
          setUser(null)
          setLoading(false)
          return
        }
        
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

    // Listen for auth changes with improved handling to prevent duplicate toasts
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return; // Prevent state updates after unmount
      
      // Get last event to detect duplicates
      const lastEvent = localStorage.getItem('smartjeb-last-auth-event');
      const lastTime = localStorage.getItem('smartjeb-last-auth-time');
      const now = Date.now();
      const debounceTime = 2000; // 2 seconds debounce
      
      console.log(`Auth event: ${event}, Last event: ${lastEvent}, Time since last: ${lastTime ? now - parseInt(lastTime) : 'n/a'}ms`);
      
      // Prevent duplicate events within debounce time
      if (lastEvent === event && lastTime && (now - parseInt(lastTime) < debounceTime)) {
        console.log(`Ignoring duplicate ${event} event within debounce time`);
        return;
      }
      
      // Update last event tracking
      localStorage.setItem('smartjeb-last-auth-event', event);
      localStorage.setItem('smartjeb-last-auth-time', now.toString());
      
      const newUser = session?.user ?? null;
      
      // Log only the important details to keep console clean
      console.log('Auth state change:', event, 'User:', newUser?.email);
      
      // Special handling for different event types
      switch (event) {
        case 'SIGNED_IN': {
          setUser(newUser);
          setIsGuest(false);
          setLoading(false);
          
          // Show toast only for true user sign-ins with email (not token refreshes)
          if (newUser?.email && !newUser.is_anonymous) {
            const signInKey = `signin-${newUser.id}-${new Date().toDateString()}`;
            const hasShownToday = localStorage.getItem(signInKey);
            
            if (!hasShownToday) {
              toast.success('Signed in successfully!');
              localStorage.setItem(signInKey, 'true');
            }
          }
          break;
        }
        
        case 'SIGNED_OUT': {
          setUser(null);
          setIsGuest(false);
          console.log('User signed out, state reset');
          break;
        }
        
        case 'TOKEN_REFRESHED': {
          // Don't update UI state for token refreshes
          console.log('Token refreshed - ignoring');
          return;
        }
        
        default: {
          // For any other events, just update the state without toasts
          setUser(newUser);
          setIsGuest(false);
          setLoading(false);
        }
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
      localStorage.removeItem('smartjeb-guest-mode')
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
      localStorage.removeItem('smartjeb-guest-mode')
      
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
    // Persist guest mode state across refreshes
    localStorage.setItem('smartjeb-guest-mode', 'true')
    localStorage.setItem('smartjeb-visited', 'true')
  }

  // Exit guest mode
  const exitGuestMode = () => {
    setIsGuest(false)
    // Clear guest mode state from localStorage
    localStorage.removeItem('smartjeb-guest-mode')
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