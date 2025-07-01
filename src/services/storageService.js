import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Storage service for handling file uploads to Supabase Storage
 */

/**
 * Upload a receipt image to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} userId - The user ID for folder organization
 * @returns {Promise<{url: string | null, error: string | null}>}
 */
export const uploadReceipt = async (file, userId) => {
  console.log('uploadReceipt called with:', { fileName: file.name, fileSize: file.size, userId });
  console.log('Supabase configured:', isSupabaseConfigured, 'Supabase client:', !!supabase);
  
  // Always use data URL approach for now to ensure receipt uploads work
  // TODO: Re-enable Supabase storage once storage bucket is properly configured
  console.log('Using data URL approach for receipt storage');
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('Data URL created successfully, length:', e.target.result.length);
      resolve({ url: e.target.result, error: null });
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      resolve({ url: null, error: 'Failed to read file' });
    };
    reader.readAsDataURL(file);
  });
  
  /* DISABLED - Supabase storage approach - enable when storage bucket is configured
  if (!isSupabaseConfigured || !supabase) {
    console.log('Using guest mode - converting to data URL');
    // For guest mode or when Supabase is not configured, convert to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Data URL created successfully');
        resolve({ url: e.target.result, error: null });
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        resolve({ url: null, error: 'Failed to read file' });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    console.log('Uploading to Supabase with filename:', fileName);

    // Upload the file
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      // Fallback to data URL if Supabase upload fails
      console.log('Falling back to data URL due to Supabase error');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          console.log('Fallback data URL created successfully');
          resolve({ url: e.target.result, error: null });
        };
        reader.onerror = () => {
          resolve({ url: null, error: 'Both Supabase upload and file reading failed' });
        };
        reader.readAsDataURL(file);
      });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    console.log('Supabase upload successful, public URL:', publicUrl);
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload failed with exception:', error);
    // Fallback to data URL for any other errors
    console.log('Falling back to data URL due to exception');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Exception fallback data URL created successfully');
        resolve({ url: e.target.result, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: `Upload failed: ${error.message}` });
      };
      reader.readAsDataURL(file);
    });
  }
  */
};

/**
 * Delete a receipt from Supabase Storage
 * @param {string} url - The URL of the file to delete
 * @param {string} userId - The user ID for verification
 * @returns {Promise<{success: boolean, error: string | null}>}
 */
export const deleteReceipt = async (url, userId) => {
  if (!isSupabaseConfigured || !supabase || !url) {
    return { success: true, error: null };
  }

  try {
    // Extract file path from URL
    const urlParts = url.split('/storage/v1/object/public/receipts/');
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid receipt URL' };
    }

    const filePath = urlParts[1];

    // Verify the file belongs to the user
    if (!filePath.startsWith(userId + '/')) {
      return { success: false, error: 'Unauthorized to delete this receipt' };
    }

    const { error } = await supabase.storage
      .from('receipts')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the display URL for a receipt (handles both data URLs and Supabase URLs)
 * @param {string} url - The receipt URL
 * @returns {string} - The URL to display
 */
export const getReceiptDisplayUrl = (url) => {
  if (!url) return null;
  
  // If it's already a data URL or full URL, return as is
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative Supabase path, construct the full URL
  if (isSupabaseConfigured && supabase) {
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(url);
    return publicUrl;
  }
  
  return url;
};
