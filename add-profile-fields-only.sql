-- Add missing profile fields to existing profiles table
-- Run this in Supabase SQL Editor if you only want to add the new fields

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- The table should now have these fields:
-- id, email, name, avatar_url, bio, phone, location, created_at, updated_at
