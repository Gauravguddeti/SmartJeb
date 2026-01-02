import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'
import { App } from '@capacitor/app'

// Check if running on Capacitor (mobile app)
const isCapacitorApp = () => {
  try {
    return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

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

  // Handle deep links for OAuth callback on mobile
  useEffect(() => {
    if (!isCapacitorApp() || !isSupabaseConfigured || !supabase) return;

    let appUrlListener = null;

    const setupDeepLinkListener = async () => {
      try {
        // Handle deep links when app is opened from a URL
        appUrlListener = await App.addListener('appUrlOpen', async (event) => {
          console.log('🔗 Deep link received:', event.url);
          
          // Check if this is an OAuth callback from HTTPS App Link
          if (event.url && (event.url.includes('auth.smartjeb.app/callback') || event.url.includes('smartjeb.vercel.app/callback'))) {
            try {
              console.log('🔐 Processing HTTPS App Link OAuth callback...');
              
              // Supabase OAuth tokens can be in hash (#) or query (?)
              let tokenString = '';
              if (event.url.includes('#')) {
                tokenString = event.url.split('#')[1];
              } else if (event.url.includes('?')) {
                // Get everything after the first ?
                const parts = event.url.split('?');
                if (parts.length > 1) {
                  tokenString = parts.slice(1).join('?');
                }
              }
              
              console.log('🔍 Token string:', tokenString ? 'Found' : 'Not found');
              
              if (!tokenString) {
                console.error('❌ No token string found in OAuth callback URL');
                toast.error('OAuth callback failed - no tokens');
                return;
              }
              
              const urlParams = new URLSearchParams(tokenString);
              const accessToken = urlParams.get('access_token');
              const refreshToken = urlParams.get('refresh_token');
              const errorParam = urlParams.get('error');
              const errorDescription = urlParams.get('error_description');
              
              if (errorParam) {
                console.error('❌ OAuth error:', errorParam, errorDescription);
                toast.error(`Sign in failed: ${errorDescription || errorParam}`);
                return;
              }
              
              if (!accessToken) {
                console.error('❌ No access token found in OAuth callback');
                toast.error('OAuth callback failed - no access token');
                return;
              }
              
              console.log('✅ Tokens found, setting session...');
              
              // Set session with validated tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || undefined
              });
              
              if (error) {
                console.error('❌ OAuth session error:', error);
                toast.error('Failed to sign in with Google');
              } else if (data?.session) {
                console.log('✅ OAuth session established successfully');
                toast.success('Signed in with Google!');
                // The onAuthStateChange listener will handle the UI update
              }
            } catch (error) {
              console.error('❌ Error processing OAuth callback:', error);
              toast.error('Sign in failed');
            }
          } else {
            console.log('ℹ️ Deep link is not an OAuth callback:', event.url);
          }
        });

        console.log('✅ Deep link listener registered successfully');
      } catch (error) {
        console.error('❌ Error setting up deep link listener:', error);
      }
    };

    setupDeepLinkListener();

    return () => {
      if (appUrlListener) {
        appUrlListener.remove();
      }
    };
  }, [isSupabaseConfigured, supabase]);

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
      // For Capacitor apps, use HTTPS App Link (production-grade approach)
      const redirectTo = isCapacitorApp() 
        ? 'https://auth.smartjeb.app/callback'
        : `${window.location.origin}/`;

      console.log('OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          },
          skipBrowserRedirect: false // Let Supabase handle browser opening
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