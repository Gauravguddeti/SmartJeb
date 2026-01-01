/**
 * Database service using Supabase and local SQLite for offline support
 */
import * as SQLite from 'expo-sqlite';
import { supabase, TABLES } from './supabase';
import { Expense } from '../models/Expense';
import { CategoryType } from '../constants/categories';
import { uuid } from '../utils/helpers';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

// SQLite Database name
const DB_NAME = 'expense_tracker.db';

// For sync queue tracking
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

// Initialize SQLite database for offline support
export const initDatabase = (): SQLite.SQLiteDatabase => {
  const db = SQLite.openDatabase(DB_NAME);
  
  // Create tables if they don't exist
  db.transaction(tx => {
    // Expenses table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        merchant_name TEXT NOT NULL,
        category TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        notes TEXT,
        receipt_uri TEXT,
        is_auto_logged INTEGER NOT NULL,
        source_app TEXT,
        user_id TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0
      );`
    );
    
    // Sync queue table for tracking changes that need to be synced
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );`
    );
    
    // Create indexes for faster queries
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_expenses_timestamp ON expenses (timestamp);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_expenses_userId ON expenses (user_id);');
    tx.executeSql('CREATE INDEX IF NOT EXISTS idx_expenses_synced ON expenses (is_synced);');
  });
  
  return db;
};

// Database singleton instance
let database: SQLite.SQLiteDatabase | null = null;

// Get database instance
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!database) {
    database = initDatabase();
  }
  return database;
};

// Helper function to store expense in SQLite
const storeExpenseLocally = async (expense: any, isSynced: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO expenses 
         (id, amount, merchant_name, category, timestamp, notes, receipt_uri, is_auto_logged, source_app, user_id, is_synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          expense.id,
          expense.amount,
          expense.merchant_name,
          expense.category,
          expense.timestamp,
          expense.notes || null,
          expense.receipt_uri || null,
          expense.is_auto_logged ? 1 : 0,
          expense.source_app || null,
          expense.user_id,
          isSynced ? 1 : 0
        ],
        (_, result) => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Helper function to add operation to sync queue
const addToSyncQueue = async (operation: 'create' | 'update' | 'delete', table: string, data: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const timestamp = Date.now();
    const id = uuid();
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO sync_queue (id, operation, table_name, data, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          operation,
          table,
          JSON.stringify(data),
          timestamp
        ],
        (_, result) => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Add a new expense (stores in both Supabase and local SQLite)
export const addExpense = async (expense: Expense, userId: string): Promise<Expense> => {
  // If expense doesn't have an ID, generate one
  const expenseWithId = expense.id ? expense : { ...expense, id: uuid() };
  
  try {
    // Check if we're online
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected && netInfo.isInternetReachable;
    
    // Format for database storage (snake_case)
    const dbExpense = {
      id: expenseWithId.id,
      amount: expenseWithId.amount,
      merchant_name: expenseWithId.merchantName,
      category: expenseWithId.category,
      timestamp: expenseWithId.timestamp,
      notes: expenseWithId.notes || null,
      receipt_uri: expenseWithId.receiptUri || null,
      is_auto_logged: expenseWithId.isAutoLogged,
      source_app: expenseWithId.sourceApp || null,
      user_id: userId
    };
    
    if (isConnected) {
      // Store in Supabase
      const { error } = await supabase
        .from(TABLES.EXPENSES)
        .insert(dbExpense);
      
      if (error) throw error;
      
      // Also store locally with synced flag
      await storeExpenseLocally(dbExpense, true);
    } else {
      // Store locally only with not-synced flag
      await storeExpenseLocally(dbExpense, false);
      
      // Add to sync queue
      await addToSyncQueue('create', TABLES.EXPENSES, dbExpense);
    }
    
    return expenseWithId;
  } catch (error) {
    console.error('Error adding expense:', error);
    
    // Fall back to local-only storage if Supabase fails
    try {
      const dbExpense = {
        id: expenseWithId.id,
        amount: expenseWithId.amount,
        merchant_name: expenseWithId.merchantName,
        category: expenseWithId.category,
        timestamp: expenseWithId.timestamp,
        notes: expenseWithId.notes || null,
        receipt_uri: expenseWithId.receiptUri || null,
        is_auto_logged: expenseWithId.isAutoLogged,
        source_app: expenseWithId.sourceApp || null,
        user_id: userId,
        is_synced: 0
      };
      
      await storeExpenseLocally(dbExpense, false);
      await addToSyncQueue('create', TABLES.EXPENSES, dbExpense);
      
      return expenseWithId;
    } catch (localError) {
      console.error('Error adding expense locally:', localError);
      throw localError;
    }
  }
};

// Update an expense
export const updateExpense = (expense: Expense, userId: string): Promise<Expense> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE expenses
         SET amount = ?, merchantName = ?, category = ?, timestamp = ?, notes = ?, receiptUri = ?
         WHERE id = ? AND userId = ?`,
        [
          expense.amount,
          expense.merchantName,
          expense.category,
          expense.timestamp,
          expense.notes || null,
          expense.receiptUri || null,
          expense.id,
          userId
        ],
        (_, result) => {
          if (result.rowsAffected > 0) {
            resolve(expense);
          } else {
            reject(new Error('No expense found with that ID'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Delete an expense
export const deleteExpense = (id: string, userId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM expenses WHERE id = ? AND userId = ?',
        [id, userId],
        (_, result) => {
          if (result.rowsAffected > 0) {
            resolve();
          } else {
            reject(new Error('No expense found with that ID'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get an expense by ID
export const getExpenseById = (id: string, userId: string): Promise<Expense | null> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE id = ? AND userId = ?',
        [id, userId],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              id: row.id,
              amount: row.amount,
              merchantName: row.merchantName,
              category: row.category as CategoryType,
              timestamp: row.timestamp,
              notes: row.notes,
              receiptUri: row.receiptUri,
              isAutoLogged: Boolean(row.isAutoLogged),
              sourceApp: row.sourceApp
            });
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get all expenses for a user
export const getAllExpenses = (userId: string): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE userId = ? ORDER BY timestamp DESC',
        [userId],
        (_, result) => {
          const expenses: Expense[] = [];
          
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            expenses.push({
              id: row.id,
              amount: row.amount,
              merchantName: row.merchantName,
              category: row.category as CategoryType,
              timestamp: row.timestamp,
              notes: row.notes,
              receiptUri: row.receiptUri,
              isAutoLogged: Boolean(row.isAutoLogged),
              sourceApp: row.sourceApp
            });
          }
          
          resolve(expenses);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get expenses within a date range
export const getExpensesByDateRange = (
  startDate: number,
  endDate: number,
  userId: string
): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE timestamp >= ? AND timestamp <= ? AND userId = ? ORDER BY timestamp DESC',
        [startDate, endDate, userId],
        (_, result) => {
          const expenses: Expense[] = [];
          
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            expenses.push({
              id: row.id,
              amount: row.amount,
              merchantName: row.merchantName,
              category: row.category as CategoryType,
              timestamp: row.timestamp,
              notes: row.notes,
              receiptUri: row.receiptUri,
              isAutoLogged: Boolean(row.isAutoLogged),
              sourceApp: row.sourceApp
            });
          }
          
          resolve(expenses);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get expenses by category
export const getExpensesByCategory = (
  category: CategoryType,
  userId: string
): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE category = ? AND userId = ? ORDER BY timestamp DESC',
        [category, userId],
        (_, result) => {
          const expenses: Expense[] = [];
          
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            expenses.push({
              id: row.id,
              amount: row.amount,
              merchantName: row.merchantName,
              category: row.category as CategoryType,
              timestamp: row.timestamp,
              notes: row.notes,
              receiptUri: row.receiptUri,
              isAutoLogged: Boolean(row.isAutoLogged),
              sourceApp: row.sourceApp
            });
          }
          
          resolve(expenses);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export default {
  initDatabase,
  getDatabase,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseById,
  getAllExpenses,
  getExpensesByDateRange,
  getExpensesByCategory
};
