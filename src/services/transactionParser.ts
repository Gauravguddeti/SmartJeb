/**
 * UPI Transaction Parser
 * Extracts transaction details from notification text
 */

export interface ParsedTransaction {
  amount: number;
  merchant: string;
  transactionId: string;
  timestamp: number;
  raw: string;
  appSource: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'amazonpay' | 'unknown';
}

/**
 * Parse UPI notification text to extract transaction details
 */
export function parseUPINotification(title: string, text: string, packageName: string): ParsedTransaction | null {
  const raw = `${title} ${text}`.toLowerCase();
  
  // Check if this is a payment notification (not received money)
  const paymentKeywords = ['paid', 'sent', 'debited', 'transferred', 'payment'];
  const isPayment = paymentKeywords.some(keyword => raw.includes(keyword));
  
  if (!isPayment) return null;

  // Determine app source
  const appSource = detectAppSource(packageName, title);
  
  // Extract amount
  const amount = extractAmount(text);
  if (!amount || amount <= 0) return null;

  // Extract merchant
  const merchant = extractMerchant(text, appSource);
  if (!merchant) return null;

  // Extract transaction ID
  const transactionId = extractTransactionId(text) || generateFallbackTxnId(amount, merchant);

  return {
    amount,
    merchant,
    transactionId,
    timestamp: Date.now(),
    raw: `${title} - ${text}`,
    appSource
  };
}

/**
 * Detect which UPI app sent the notification
 */
function detectAppSource(packageName: string, title: string): ParsedTransaction['appSource'] {
  const pkg = packageName.toLowerCase();
  const t = title.toLowerCase();
  
  if (pkg.includes('google.android.apps.nbu') || t.includes('google pay') || t.includes('gpay')) {
    return 'gpay';
  }
  if (pkg.includes('phonepe') || t.includes('phonepe')) {
    return 'phonepe';
  }
  if (pkg.includes('paytm') || t.includes('paytm')) {
    return 'paytm';
  }
  if (pkg.includes('bhim') || t.includes('bhim')) {
    return 'bhim';
  }
  if (pkg.includes('amazon') || t.includes('amazon pay')) {
    return 'amazonpay';
  }
  
  return 'unknown';
}

/**
 * Extract amount from notification text
 * Handles formats: ₹350, Rs.350, INR 350, 350.00
 */
function extractAmount(text: string): number | null {
  // Pattern 1: ₹350 or ₹350.00
  const rupeePattern = /₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/;
  let match = text.match(rupeePattern);
  
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  
  // Pattern 2: Rs.350 or Rs 350
  const rsPattern = /Rs\.?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
  match = text.match(rsPattern);
  
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  
  // Pattern 3: INR 350
  const inrPattern = /INR\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
  match = text.match(inrPattern);
  
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  
  return null;
}

/**
 * Extract merchant name from notification text
 */
function extractMerchant(text: string, appSource: string): string | null {
  // GPay format: "You paid ₹350 to Zomato"
  if (appSource === 'gpay') {
    const match = text.match(/(?:paid|sent).*?to\s+([A-Za-z0-9\s&-]+?)(?:\.|$|for|via|upi)/i);
    if (match) return normalizeMerchant(match[1].trim());
  }
  
  // PhonePe format: "Payment of ₹350 to ZOMATO successful"
  if (appSource === 'phonepe') {
    const match = text.match(/(?:payment|paid).*?to\s+([A-Za-z0-9\s&-]+?)(?:\s+successful|$)/i);
    if (match) return normalizeMerchant(match[1].trim());
  }
  
  // Paytm format: "₹350 paid to Zomato"
  if (appSource === 'paytm') {
    const match = text.match(/paid to\s+([A-Za-z0-9\s&-]+?)(?:\.|$)/i);
    if (match) return normalizeMerchant(match[1].trim());
  }
  
  // Generic pattern: find capitalized words after "to"
  const genericMatch = text.match(/to\s+([A-Z][A-Za-z0-9\s&-]+?)(?:\.|$|via|upi|for)/);
  if (genericMatch) return normalizeMerchant(genericMatch[1].trim());
  
  return null;
}

/**
 * Extract transaction ID from notification text
 */
function extractTransactionId(text: string): string | null {
  // Pattern 1: UPI Ref/ID: 402394729384
  const upiPattern = /(?:UPI|Ref|ID|Transaction)[\s:]+([A-Z0-9]{12,20})/i;
  let match = text.match(upiPattern);
  
  if (match) return match[1];
  
  // Pattern 2: Txn ID 402394729384
  const txnPattern = /Txn\s+(?:ID|Ref)[\s:]+([A-Z0-9]{12,20})/i;
  match = text.match(txnPattern);
  
  if (match) return match[1];
  
  return null;
}

/**
 * Generate fallback transaction ID if not found in text
 */
function generateFallbackTxnId(amount: number, merchant: string): string {
  const timestamp = Date.now();
  const hash = `${amount}${merchant}${timestamp}`.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `TXN${Math.abs(hash).toString().substring(0, 12)}`;
}

/**
 * Normalize merchant names
 * "ZOMATO BANGALORE" -> "Zomato"
 */
function normalizeMerchant(raw: string): string {
  // Remove common suffixes
  let clean = raw
    .replace(/\s+(LTD|PVT|PRIVATE|LIMITED|INDIA|PTE|BANGALORE|MUMBAI|DELHI|PUNE|INC)$/i, '')
    .replace(/\s+(ONLINE|SERVICES|TECHNOLOGIES|TECH|PAY|PAYMENTS)$/i, '')
    .trim();
  
  // Known merchant mappings
  const merchantMap: Record<string, string> = {
    'ZOMATO': 'Zomato',
    'SWIGGY': 'Swiggy',
    'SWGY': 'Swiggy',
    'AMAZON': 'Amazon',
    'AMZN': 'Amazon',
    'FLIPKART': 'Flipkart',
    'UBER': 'Uber',
    'OLA': 'Ola',
    'RAPIDO': 'Rapido',
    'BIG BASKET': 'BigBasket',
    'BIGBASKET': 'BigBasket',
    'GROFERS': 'Blinkit',
    'BLINKIT': 'Blinkit',
    'DUNZO': 'Dunzo',
    'ZEPTO': 'Zepto',
    'MYNTRA': 'Myntra',
    'AJIO': 'Ajio',
    'NYKAA': 'Nykaa',
    'PAYTM MALL': 'Paytm',
    'BOOKMYSHOW': 'BookMyShow',
    'IRCTC': 'IRCTC',
    'MAKEMYTRIP': 'MakeMyTrip',
    'GOIBIBO': 'Goibibo',
    'REDBUS': 'RedBus',
  };
  
  const normalized = merchantMap[clean.toUpperCase()];
  if (normalized) return normalized;
  
  // Title case
  return toTitleCase(clean);
}

/**
 * Convert string to Title Case
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if notification is a refund/reversal
 */
export function isRefundNotification(title: string, text: string): boolean {
  const combined = `${title} ${text}`.toLowerCase();
  const refundKeywords = ['refund', 'reversed', 'credited', 'credited back', 'failed'];
  return refundKeywords.some(keyword => combined.includes(keyword));
}

/**
 * Validate parsed transaction
 */
export function isValidTransaction(txn: ParsedTransaction | null): txn is ParsedTransaction {
  if (!txn) return false;
  return (
    txn.amount > 0 &&
    txn.amount < 100000 && // Sanity check: < 1 lakh
    txn.merchant.length > 0 &&
    txn.merchant.length < 100 &&
    txn.transactionId.length > 0
  );
}
