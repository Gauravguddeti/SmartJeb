/**
 * Utility functions for formatting currency and other common operations
 */

/**
 * Format amount to Indian Rupees with proper formatting
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = true) => {
  if (amount === 0) return '₹0';
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
  
  // Replace the default INR symbol with ₹
  return formatted.replace('₹', '₹');
};

/**
 * Format amount with Indian number system (lakhs, crores)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount string
 */
export const formatAmountIndian = (amount) => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toFixed(2)}`;
  }
};

/**
 * Get a friendly relative date string
 * @param {string|Date} date - The date to format
 * @returns {string} Friendly date string
 */
export const getRelativeDateString = (date) => {
  const now = new Date();
  const inputDate = new Date(date);
  const diffTime = now - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return inputDate.toLocaleDateString('en-IN');
};
