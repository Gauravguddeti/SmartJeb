import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

// Install the required dependencies
// npm install @supabase/supabase-js @react-native-async-storage/async-storage @react-native-community/netinfo

// Set up env file or app.config.js with your Supabase credentials
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Add this code to your app.config.js
/*
export default {
  expo: {
    // ... other configs
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
*/

// Create a README.md to explain this setup
/*
# Supabase Setup for Mobile App

1. Create a `.env` file in the root of your project with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Install the required packages:
```
npm install @supabase/supabase-js @react-native-async-storage/async-storage @react-native-community/netinfo
```

3. The app uses Expo SecureStore for token storage and NetInfo for connectivity checks.
*/

// When using this example in your app, create an .env file and update app.config.js accordingly
// Do not hardcode credentials in your actual app!

// Create the Supabase client setup
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Example auth functions
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    Alert.alert('Error', error.message);
    return null;
  }
  
  return data.user;
};

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    Alert.alert('Error', error.message);
    return null;
  }
  
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    Alert.alert('Error', error.message);
    return false;
  }
  
  return true;
};

// Example data functions
export const fetchExpenses = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
    
  if (error) {
    Alert.alert('Error', error.message);
    return [];
  }
  
  return data;
};

export const addExpense = async (expense, userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      ...expense,
      user_id: userId,
    })
    .select();
    
  if (error) {
    Alert.alert('Error', error.message);
    return null;
  }
  
  return data[0];
};
