/**
 * Email Service - Handle sending emails directly
 */

/**
 * Send review email using FormSubmit.co (free service)
 * @param {string} email - User's email
 * @param {string} review - Review message
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendEmailViaFormSubmit = async (email, review) => {
  try {
    const formData = new FormData();
    formData.append('_to', 'guddetigaurav1@gmail.com');
    formData.append('_subject', 'SmartJeb Review');
    formData.append('_captcha', 'false');
    formData.append('_template', 'box');
    formData.append('email', email);
    formData.append('review', review);
    formData.append('_next', window.location.origin + '/thank-you');

    const response = await fetch('https://formsubmit.co/guddetigaurav1@gmail.com', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      return { success: true, method: 'formsubmit' };
    } else {
      throw new Error('Failed to send email via FormSubmit');
    }
  } catch (error) {
    console.error('FormSubmit error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Alternative: Send using Netlify Forms (if hosted on Netlify)
 */
export const sendEmailViaNetlify = async (email, review) => {
  try {
    const formData = new FormData();
    formData.append('form-name', 'review');
    formData.append('email', email);
    formData.append('review', review);

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });

    if (response.ok) {
      return { success: true, method: 'netlify' };
    } else {
      throw new Error('Failed to send email via Netlify');
    }
  } catch (error) {
    console.error('Netlify forms error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Main function to send review (tries multiple methods)
 * @param {string} email - User's email
 * @param {string} review - Review message
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendReviewEmail = async (email, review) => {
  // Try FormSubmit first
  let result = await sendEmailViaFormSubmit(email, review);
  
  if (result.success) {
    return result;
  }
  
  // If FormSubmit fails, fallback to mailto
  console.warn('Direct email methods failed, falling back to mailto');
  
  const subject = encodeURIComponent('SmartJeb Review');
  const body = encodeURIComponent(`Review from: ${email}\n\nReview:\n${review}`);
  const mailtoLink = `mailto:guddetigaurav1@gmail.com?subject=${subject}&body=${body}`;
  
  window.open(mailtoLink, '_blank');
  return { success: true, method: 'mailto' };
};
