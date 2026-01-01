/**
 * Pending Transactions Queue
 * Manages unconfirmed UPI transactions
 */

import { ParsedTransaction } from './transactionParser';

export interface PendingTransaction extends ParsedTransaction {
  id: string;
  detectedAt: number;
  expiresAt: number;
  dismissed: boolean;
  suggestedCategory?: string;
  confidence?: number;
}

const STORAGE_KEY = 'smartjeb_pending_transactions';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Add transaction to pending queue
 */
export async function addPendingTransaction(
  txn: ParsedTransaction,
  suggestedCategory?: string,
  confidence?: number
): Promise<PendingTransaction> {
  const pending: PendingTransaction = {
    ...txn,
    id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    detectedAt: Date.now(),
    expiresAt: Date.now() + EXPIRY_TIME,
    dismissed: false,
    suggestedCategory,
    confidence
  };

  const queue = await getPendingTransactions();
  queue.push(pending);
  await savePendingTransactions(queue);

  return pending;
}

/**
 * Get all pending transactions (not dismissed, not expired)
 */
export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const queue: PendingTransaction[] = JSON.parse(stored);
    const now = Date.now();

    // Filter out expired and dismissed
    const active = queue.filter(txn => 
      !txn.dismissed && txn.expiresAt > now
    );

    // Save cleaned queue
    await savePendingTransactions(active);
    return active;
  } catch (error) {
    console.error('Error loading pending transactions:', error);
    return [];
  }
}

/**
 * Get pending transaction by ID
 */
export async function getPendingTransactionById(id: string): Promise<PendingTransaction | null> {
  const queue = await getPendingTransactions();
  return queue.find(txn => txn.id === id) || null;
}

/**
 * Mark transaction as dismissed
 */
export async function dismissPendingTransaction(id: string): Promise<void> {
  const queue = await getPendingTransactions();
  const txn = queue.find(t => t.id === id);
  if (txn) {
    txn.dismissed = true;
  }
  await savePendingTransactions(queue);
}

/**
 * Remove transaction from queue (after confirmation)
 */
export async function removePendingTransaction(id: string): Promise<void> {
  const queue = await getPendingTransactions();
  const filtered = queue.filter(txn => txn.id !== id);
  await savePendingTransactions(filtered);
}

/**
 * Clear all pending transactions
 */
export async function clearPendingTransactions(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get count of active pending transactions
 */
export async function getPendingTransactionCount(): Promise<number> {
  const queue = await getPendingTransactions();
  return queue.length;
}

/**
 * Check if transaction already exists (duplicate detection)
 */
export async function isDuplicateTransaction(
  txn: ParsedTransaction,
  thresholdMinutes: number = 2
): Promise<boolean> {
  const queue = await getPendingTransactions();
  const threshold = Date.now() - (thresholdMinutes * 60 * 1000);

  return queue.some(pending => 
    pending.amount === txn.amount &&
    pending.merchant.toLowerCase() === txn.merchant.toLowerCase() &&
    pending.timestamp > threshold
  );
}

/**
 * Save pending transactions to storage
 */
async function savePendingTransactions(queue: PendingTransaction[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving pending transactions:', error);
  }
}

/**
 * Get transaction history for duplicate detection
 */
const HISTORY_KEY = 'smartjeb_transaction_history';
const HISTORY_SIZE = 100;

interface TransactionHistory {
  transactionId: string;
  amount: number;
  merchant: string;
  timestamp: number;
  processed: boolean;
}

/**
 * Add to transaction history
 */
export async function addToTransactionHistory(txn: ParsedTransaction): Promise<void> {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    let history: TransactionHistory[] = stored ? JSON.parse(stored) : [];

    // Add new entry
    history.push({
      transactionId: txn.transactionId,
      amount: txn.amount,
      merchant: txn.merchant,
      timestamp: txn.timestamp,
      processed: true
    });

    // Keep only last N transactions
    if (history.length > HISTORY_SIZE) {
      history = history.slice(-HISTORY_SIZE);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to transaction history:', error);
  }
}

/**
 * Check if transaction ID was already processed
 */
export async function isTransactionProcessed(transactionId: string): Promise<boolean> {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return false;

    const history: TransactionHistory[] = JSON.parse(stored);
    return history.some(h => h.transactionId === transactionId && h.processed);
  } catch (error) {
    console.error('Error checking transaction history:', error);
    return false;
  }
}
