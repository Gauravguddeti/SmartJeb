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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setIsGuest(false)
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsGuest(false)
      setLoading(false)

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsGuest(false)
      }
    })

    return () => subscription.unsubscribe()
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
          redirectTo: window.location.origin
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
      // Clear all app state flags
      localStorage.removeItem('smartjeb-visited')
      localStorage.removeItem('smartjeb-welcome-seen')
      // Force a page reload to reset app state completely
      window.location.reload()
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setIsGuest(false)
      
      // Clear all app state flags
      localStorage.removeItem('smartjeb-visited')
      localStorage.removeItem('smartjeb-welcome-seen')
      
      // Force a page reload to reset app state completely
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Error signing out')
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
    // Clear any guest data from localStorage
    localStorage.removeItem('expenses')
    localStorage.removeItem('goals')
    localStorage.removeItem('categories')
    localStorage.removeItem('budget')
  }

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