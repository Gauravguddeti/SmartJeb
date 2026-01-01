/**
 * Capacitor Bridge for UPI Notification Listener
 * Connects native Android plugin with React app
 */

import { registerPlugin } from '@capacitor/core';
import { ParsedTransaction, parseUPINotification, isValidTransaction } from './transactionParser';
import { 
  addPendingTransaction, 
  isDuplicateTransaction, 
  isTransactionProcessed,
  addToTransactionHistory 
} from './pendingTransactions';
import { categorizeExpense } from './aiService';

export interface UPINotificationListenerPlugin {
  checkPermission(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<{ opened: boolean }>;
  enableListener(): Promise<{ enabled: boolean }>;
  disableListener(): Promise<{ disabled: boolean }>;
}

const UPIListener = registerPlugin<UPINotificationListenerPlugin>('UPINotificationListener');

// Transaction detection callback
type TransactionCallback = (transaction: ParsedTransaction) => void;
let transactionCallbacks: TransactionCallback[] = [];

/**
 * Check if notification listener permission is granted
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const result = await UPIListener.checkPermission();
    return result.granted;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Request notification listener permission
 * Opens Android settings
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await UPIListener.requestPermission();
    return result.opened;
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
}

/**
 * Enable UPI transaction detection
 */
export async function enableUPIDetection(): Promise<boolean> {
  try {
    const result = await UPIListener.enableListener();
    if (result.enabled) {
      startListeningForTransactions();
    }
    return result.enabled;
  } catch (error) {
    console.error('Error enabling listener:', error);
    return false;
  }
}

/**
 * Disable UPI transaction detection
 */
export async function disableUPIDetection(): Promise<boolean> {
  try {
    const result = await UPIListener.disableListener();
    if (result.disabled) {
      stopListeningForTransactions();
    }
    return result.disabled;
  } catch (error) {
    console.error('Error disabling listener:', error);
    return false;
  }
}

/**
 * Subscribe to transaction detection events
 */
export function onTransactionDetected(callback: TransactionCallback): () => void {
  transactionCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    transactionCallbacks = transactionCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Start listening for UPI transactions from native side
 */
function startListeningForTransactions() {
  // Listen for broadcasts from native Android service
  if (typeof window !== 'undefined' && (window as any).addEventListener) {
    (window as any).addEventListener('UPI_TRANSACTION_DETECTED', handleNativeTransaction);
  }
}

/**
 * Stop listening for transactions
 */
function stopListeningForTransactions() {
  if (typeof window !== 'undefined' && (window as any).removeEventListener) {
    (window as any).removeEventListener('UPI_TRANSACTION_DETECTED', handleNativeTransaction);
  }
}

/**
 * Handle transaction event from native side
 */
async function handleNativeTransaction(event: any) {
  try {
    const data = event.detail || JSON.parse(event.data);
    const { packageName, title, text, timestamp } = data;

    console.log('Received UPI transaction:', { packageName, title, text });

    // Parse the notification
    const parsed = parseUPINotification(title, text, packageName);
    
    if (!isValidTransaction(parsed)) {
      console.log('Invalid transaction, skipping');
      return;
    }

    // Check for duplicates
    if (await isDuplicateTransaction(parsed)) {
      console.log('Duplicate transaction detected, skipping');
      return;
    }

    // Check if already processed
    if (await isTransactionProcessed(parsed.transactionId)) {
      console.log('Transaction already processed, skipping');
      return;
    }

    // Get AI category suggestion
    const suggestedCategory = await categorizeExpense(parsed.merchant);
    const confidence = 85; // TODO: Get actual confidence from AI model

    // Add to pending queue
    const pending = await addPendingTransaction(parsed, suggestedCategory, confidence);

    // Add to history to prevent duplicates
    await addToTransactionHistory(parsed);

    // Notify all subscribers
    transactionCallbacks.forEach(callback => {
      try {
        callback(parsed);
      } catch (error) {
        console.error('Error in transaction callback:', error);
      }
    });

    // Trigger heads-up notification
    await triggerQuickConfirmNotification(pending);

  } catch (error) {
    console.error('Error handling native transaction:', error);
  }
}

/**
 * Trigger heads-up notification for quick confirm
 */
async function triggerQuickConfirmNotification(transaction: any) {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: `₹${transaction.amount} to ${transaction.merchant}`,
          body: `Tap to confirm • ${transaction.suggestedCategory}`,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) },
          sound: 'beep.wav',
          attachments: undefined,
          actionTypeId: 'UPI_TRANSACTION',
          extra: {
            transactionId: transaction.id,
            action: 'confirm'
          }
        }
      ]
    });
  } catch (error) {
    console.error('Error triggering notification:', error);
  }
}

/**
 * Initialize UPI detection system
 */
export async function initializeUPIDetection(): Promise<void> {
  console.log('Initializing UPI detection system...');
  
  // Check if running on Android
  const { Device } = await import('@capacitor/device');
  const info = await Device.getInfo();
  
  if (info.platform !== 'android') {
    console.log('UPI detection only available on Android');
    return;
  }

  // Check if permission is granted
  const hasPermission = await checkNotificationPermission();
  
  if (hasPermission) {
    await enableUPIDetection();
    console.log('UPI detection enabled');
  } else {
    console.log('Notification permission not granted');
  }
}
