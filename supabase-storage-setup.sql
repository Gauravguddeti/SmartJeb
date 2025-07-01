-- Supabase Storage Setup for Receipt Images
-- Run this in your Supabase SQL Editor

-- 1. Create a storage bucket for receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
);

-- 2. Set up storage policies for receipts bucket

-- Allow authenticated users to upload their own receipts
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own receipts
CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'receipts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to receipt images (for sharing)
CREATE POLICY "Public can view receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts');

-- Allow authenticated users to delete their own receipts
CREATE POLICY "Users can delete their own receipts" ON storage.objects
FOR DELETE USING (
  bucket_id = 'receipts' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Update the expenses table to support receipt URLs
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN expenses.receipt_url IS 'URL to the receipt image stored in Supabase Storage';
