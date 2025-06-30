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
      const newUser = session?.user ?? null;
      const wasGuest = isGuest;
      
      setUser(newUser);
      setIsGuest(false);
      setLoading(false);

      // If user just signed in from guest mode, merge guest data
      if (newUser && wasGuest && event === 'SIGNED_IN') {
        // Wait a bit for user state to be properly set, then merge
        setTimeout(() => mergeGuestDataForUser(newUser), 1000);
      }

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

  // Merge guest data when user signs in
  const mergeGuestDataForUser = async (targetUser) => {
    if (!targetUser || !isSupabaseConfigured || !supabase) return;

    try {
      // Get guest expenses from localStorage
      const guestExpenses = localStorage.getItem('smartjeb-expenses');
      const guestGoals = localStorage.getItem('smartjeb-goals');

      if (guestExpenses) {
        const expenses = JSON.parse(guestExpenses);
        if (expenses.length > 0) {
          // Convert guest expenses to user expenses
          const userExpenses = expenses.map(expense => ({
            user_id: targetUser.id,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: expense.date,
            payment_method: expense.paymentMethod || null,
            notes: expense.note || expense.notes || null,
            receipt_url: expense.receiptUrl || null,
            created_at: expense.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          // Save to Supabase
          const { error } = await supabase
            .from('expenses')
            .insert(userExpenses);

          if (error) {
            console.error('Error merging guest expenses:', error);
          } else {
            console.log(`Merged ${userExpenses.length} guest expenses to user account`);
            toast.success(`Saved ${userExpenses.length} expenses from guest session!`);
          }
        }
      }

      if (guestGoals) {
        const goals = JSON.parse(guestGoals);
        if (goals.length > 0) {
          // Convert guest goals to user goals
          const userGoals = goals.map(goal => ({
            user_id: targetUser.id,
            title: goal.title,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount || 0,
            category: goal.category || null,
            deadline: goal.deadline || null,
            description: goal.description || null,
            is_completed: goal.isCompleted || false,
            created_at: goal.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          // Save to Supabase
          const { error } = await supabase
            .from('goals')
            .insert(userGoals);

          if (error) {
            console.error('Error merging guest goals:', error);
          } else {
            console.log(`Merged ${userGoals.length} guest goals to user account`);
            toast.success(`Saved ${userGoals.length} goals from guest session!`);
          }
        }
      }

      // Clear guest data after successful merge
      localStorage.removeItem('smartjeb-expenses');
      localStorage.removeItem('smartjeb-goals');
      
    } catch (error) {
      console.error('Error merging guest data:', error);
      toast.error('Some guest data could not be saved');
    }
  };

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