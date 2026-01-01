import { createClient } from '@supabase/supabase-js'

// Get environment variables with proper validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.startsWith('eyJ') && // JWT tokens start with 'eyJ'
  supabaseUrl !== 'your-supabase-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key'
)

let supabase = null

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'pennylog-auth-token',
        storage: {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          },
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'pennylog-expense-tracker'
        }
      }
    })
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    supabase = null
  }
} else {
  console.warn('Supabase not configured. Please set up your environment variables. See SUPABASE_SETUP.md for instructions.')
}

export { supabase, isSupabaseConfigured }

// Database table names
export const TABLES = {
  EXPENSES: 'expenses',
  GOALS: 'goals',
  PROFILES: 'profiles'
}

// Helper functions for Supabase operations
export const supabaseHelpers = {
  // Get current user
  getCurrentUser: () => supabase.auth.getUser(),
  
  // Sign out
  signOut: () => supabase.auth.signOut(),
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  },
  
  // Get user profile
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Create or update user profile
  upsertUserProfile: async (profile) => {
    const { error } = await supabase
      .from(TABLES.PROFILES)
      .upsert(profile)
    
    if (error) throw error
  }
}
