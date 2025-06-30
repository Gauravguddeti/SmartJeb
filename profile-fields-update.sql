-- Add new profile fields to existing profiles table
-- Run this in Supabase SQL Editor after the main schema

-- Add new columns to profiles table (will be ignored if they already exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Update the handle_new_user function to include the new fields (optional)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, bio, phone, location)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        '',
        '',
        ''
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
