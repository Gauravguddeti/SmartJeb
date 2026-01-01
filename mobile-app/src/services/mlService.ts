/**
 * ML service for expense categorization using TensorFlow.js
 */
import * as tf from '@tensorflow/tfjs';
import { CategoryType, CATEGORIES } from '../constants/categories';

/**
 * Simple NLP utility for matching text against category keywords
 * @param text - Text to categorize
 * @returns CategoryType - Matched category
 */
export const categorizeText = (text: string): CategoryType => {
  // Convert text to lowercase for case-insensitive matching
  const lowercaseText = text.toLowerCase();
  
  // Check each category's keywords for matches
  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      if (lowercaseText.includes(keyword.toLowerCase())) {
        return category.id;
      }
    }
  }
  
  // Default to 'others' if no match is found
  return 'others';
};

/**
 * Extract transaction details from notification text
 * @param notificationText - Text from notification
 * @returns Object containing amount, merchant name, and timestamp
 */
export const extractTransactionDetails = (notificationText: string): {
  amount: number | null;
  merchantName: string | null;
  timestamp: number;
} => {
  // Default result
  const result = {
    amount: null,
    merchantName: null,
    timestamp: Date.now(),
  };
  
  // Extract amount (looking for ₹ followed by digits)
  // Match ₹ or Rs or Rs. followed by digits (with optional commas and decimal places)
  const amountRegex = /(?:₹|Rs\.?|INR)\s*([0-9,]+(\.[0-9]+)?)/i;
  const amountMatch = notificationText.match(amountRegex);
  
  if (amountMatch && amountMatch[1]) {
    // Remove commas from the number string
    const cleanAmount = amountMatch[1].replace(/,/g, '');
    result.amount = parseFloat(cleanAmount);
  }
  
  // Extract merchant name (different patterns based on common notification formats)
  // Common patterns: "paid to [merchant]", "payment to [merchant]", "spent at [merchant]"
  const merchantPatterns = [
    /(?:paid|payment|transferred|sent)(?:\s+to|\s+at)?\s+([A-Za-z0-9\s&\-.']+)(?:\s+for|\s+on|\s+via|\.|$)/i,
    /(?:at|from|to)\s+([A-Za-z0-9\s&\-.']+)(?:\s+for|\s+on|\s+via|\s+using|\s+with|\.|$)/i,
    /(?:purchase|transaction|payment)\s+(?:at|from|with)\s+([A-Za-z0-9\s&\-.']+)/i,
  ];
  
  // Try each pattern until we find a match
  for (const pattern of merchantPatterns) {
    const merchantMatch = notificationText.match(pattern);
    if (merchantMatch && merchantMatch[1]) {
      result.merchantName = merchantMatch[1].trim();
      break;
    }
  }
  
  return result;
};

/**
 * Determine if a notification is a transaction notification
 * @param notificationTitle - Title of notification
 * @param notificationText - Text from notification
 * @returns Boolean indicating if this is a payment notification
 */
export const isPaymentNotification = (
  notificationTitle: string,
  notificationText: string
): boolean => {
  const paymentKeywords = [
    'payment',
    'transaction',
    'spent',
    'purchased',
    'paid',
    'debited',
    'charged',
    'transferred',
    'upi',
  ];
  
  const paymentApps = [
    'gpay',
    'google pay',
    'phonepe',
    'paytm',
    'amazon pay',
    'icici',
    'hdfc',
    'sbi',
    'axis',
    'bank',
  ];
  
  const lowercaseTitle = notificationTitle.toLowerCase();
  const lowercaseText = notificationText.toLowerCase();
  
  // Check if notification is from a payment app
  const isFromPaymentApp = paymentApps.some(app => 
    lowercaseTitle.includes(app)
  );
  
  // Check if text contains payment-related keywords
  const hasPaymentKeyword = paymentKeywords.some(keyword => 
    lowercaseText.includes(keyword)
  );
  
  // Check for amount patterns (₹, Rs, INR)
  const hasAmountPattern = /(?:₹|rs\.?|inr)\s*[0-9,.]+/i.test(lowercaseText);
  
  return (isFromPaymentApp || hasPaymentKeyword) && hasAmountPattern;
};

// Initialize the TensorFlow.js model
export const initTensorFlow = async (): Promise<void> => {
  try {
    // Initialize TensorFlow.js
    await tf.ready();
    console.log('TensorFlow.js is ready');
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
  }
};

export default {
  categorizeText,
  extractTransactionDetails,
  isPaymentNotification,
  initTensorFlow,
};
