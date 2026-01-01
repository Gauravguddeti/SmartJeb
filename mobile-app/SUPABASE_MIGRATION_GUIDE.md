# PennyLog Mobile App - Supabase Migration Guide

This guide will help you complete the migration from Firebase to Supabase in your PennyLog mobile app.

## Completed Changes

1. Created Supabase client configuration in `mobile-app/src/services/supabase.ts`
2. Replaced Firebase authentication with Supabase in `mobile-app/src/services/authService.ts`
3. Updated `AuthContext.tsx` to use Supabase authentication
4. Started migrating database operations to use Supabase and SQLite for offline support
5. Added helper utility functions for date handling and data formatting
6. Updated package.json to include Supabase dependencies

## Next Steps

### 1. Environment Configuration

Create an `app.config.js` file in your mobile app directory with:

```javascript
export default {
  expo: {
    // ... your existing configs
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
```

Create a `.env` file in your mobile app root with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Additional Dependencies

Run these commands in your mobile app directory:

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage @react-native-community/netinfo
```

### 3. Complete Database Service Implementation

Finish the implementation in `databaseService.ts` by adding these functions:

- `updateExpense`
- `deleteExpense`
- `getAllExpenses`
- `getExpenseById`
- `getExpensesByDateRange`
- `getExpensesByCategory`
- `syncLocalExpensesToSupabase`

### 4. Update ExpenseContext

Update `ExpenseContext.tsx` to use the new Supabase database service.

### 5. Update Screens

Update the login and registration screens to work with Supabase authentication.

### 6. Testing

Test the app thoroughly to ensure all functionality works with Supabase:

- User registration
- User login/logout
- Adding/editing/deleting expenses
- Offline support and syncing
- Data persistence

## Key Differences Between Firebase and Supabase

1. **Authentication:**
   - Supabase uses PostgreSQL RLS (Row Level Security) policies
   - Session management is slightly different
   - OAuth flow uses different redirects

2. **Database:**
   - Supabase uses PostgreSQL instead of NoSQL
   - Use snake_case field names in Supabase tables
   - SQL queries vs Firebase document references

3. **Storage:**
   - Both have similar concepts but different APIs
   - Supabase storage has public and private buckets

## Schema Design

Your Supabase schema should include these tables:

1. `profiles` - User profile information
2. `expenses` - Expense records
3. `goals` - Financial goals

Example schema:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at BIGINT,
  last_login_at BIGINT,
  notification_permission_granted BOOLEAN DEFAULT FALSE,
  dark_mode BOOLEAN DEFAULT FALSE,
  currency TEXT DEFAULT 'INR'
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL NOT NULL,
  merchant_name TEXT NOT NULL,
  category TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  notes TEXT,
  receipt_uri TEXT,
  is_auto_logged BOOLEAN DEFAULT FALSE,
  source_app TEXT
);

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can read their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Users can read their own expenses
CREATE POLICY "Users can read their own expenses" 
  ON expenses FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own expenses
CREATE POLICY "Users can insert their own expenses" 
  ON expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own expenses
CREATE POLICY "Users can update their own expenses" 
  ON expenses FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own expenses
CREATE POLICY "Users can delete their own expenses" 
  ON expenses FOR DELETE 
  USING (auth.uid() = user_id);
```

## Need Help?

Refer to the [Supabase documentation](https://supabase.com/docs) or reach out to the community for assistance.
