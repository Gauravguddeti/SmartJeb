import { openDB } from 'idb';

const DB_NAME = 'PennyLogDB';
const DB_VERSION = 1;

// Expense categories
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Personal Care',
  'Household',
  'Other'
];

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Expenses store
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        expenseStore.createIndex('date', 'date');
        expenseStore.createIndex('category', 'category');
        expenseStore.createIndex('amount', 'amount');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // AI categorization training data
      if (!db.objectStoreNames.contains('categorization_data')) {
        db.createObjectStore('categorization_data', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
    },
  });
};

/**
 * Add a new expense
 * @param {Object} expense - Expense object
 * @returns {Promise<number>} Expense ID
 */
export const addExpense = async (expense) => {
  const db = await initDB();
  const expenseWithTimestamp = {
    ...expense,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return db.add('expenses', expenseWithTimestamp);
};

/**
 * Get all expenses
 * @returns {Promise<Array>} Array of expenses
 */
export const getAllExpenses = async () => {
  const db = await initDB();
  return db.getAll('expenses');
};

/**
 * Get expenses for a specific date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of expenses
 */
export const getExpensesByDateRange = async (startDate, endDate) => {
  const db = await initDB();
  const allExpenses = await db.getAll('expenses');
  
  return allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * Update an expense
 * @param {Object} expense - Updated expense object
 * @returns {Promise<void>}
 */
export const updateExpense = async (expense) => {
  const db = await initDB();
  const updatedExpense = {
    ...expense,
    updatedAt: new Date().toISOString()
  };
  return db.put('expenses', updatedExpense);
};

/**
 * Delete an expense
 * @param {number} id - Expense ID
 * @returns {Promise<void>}
 */
export const deleteExpense = async (id) => {
  const db = await initDB();
  return db.delete('expenses', id);
};

/**
 * Get expenses by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of expenses
 */
export const getExpensesByCategory = async (category) => {
  const db = await initDB();
  return db.getAllFromIndex('expenses', 'category', category);
};

/**
 * Save user settings
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<void>}
 */
export const saveSetting = async (key, value) => {
  const db = await initDB();
  return db.put('settings', { key, value });
};

/**
 * Get user setting
 * @param {string} key - Setting key
 * @returns {Promise<any>} Setting value
 */
export const getSetting = async (key) => {
  const db = await initDB();
  const result = await db.get('settings', key);
  return result?.value;
};

/**
 * Add categorization training data
 * @param {string} description - Expense description
 * @param {string} category - Assigned category
 * @returns {Promise<void>}
 */
export const addCategorizationData = async (description, category) => {
  const db = await initDB();
  return db.add('categorization_data', { 
    description: description.toLowerCase(), 
    category,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get all categorization training data
 * @returns {Promise<Array>} Array of training data
 */
export const getCategorizationData = async () => {
  const db = await initDB();
  return db.getAll('categorization_data');
};
