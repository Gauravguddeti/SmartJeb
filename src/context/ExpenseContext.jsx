import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { categorizeExpense, trainCategorization } from '../services/aiService.js';
import { useAuth } from './AuthContext';
import { supabase, TABLES, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

const ExpenseContext = createContext();

// Action types
const ACTIONS = {
  SET_EXPENSES: 'SET_EXPENSES',
  ADD_EXPENSE: 'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_FILTER: 'SET_FILTER'
};

// Initial state
const initialState = {
  expenses: [],
  filteredExpenses: [],
  loading: false,
  error: null,
  filter: {
    category: 'all',
    dateRange: 'all',
    searchTerm: ''
  },
  expensesLoaded: false // Add this flag to track if expenses have been loaded
};

// Apply filters to expenses
const applyFilters = (expenses, filter) => {
  let filtered = [...expenses];

  // Filter by category
  if (filter.category !== 'all') {
    filtered = filtered.filter(expense => expense.category === filter.category);
  }

  // Filter by search term
  if (filter.searchTerm) {
    const searchLower = filter.searchTerm.toLowerCase();
    filtered = filtered.filter(expense => 
      expense.description.toLowerCase().includes(searchLower) ||
      expense.category.toLowerCase().includes(searchLower) ||
      (expense.note && expense.note.toLowerCase().includes(searchLower))
    );
  }

  // Filter by date range
  if (filter.dateRange !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter.dateRange) {
      case 'today':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= today;
        });
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthAgo;
        });
        break;
      default:
        break;
    }
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Reducer function
const expenseReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_EXPENSES:
      return {
        ...state,
        expenses: action.payload,
        filteredExpenses: applyFilters(action.payload, state.filter),
        loading: false,
        error: null,
        expensesLoaded: true // Set flag to true when expenses are loaded
      };
    
    case ACTIONS.ADD_EXPENSE:
      const newExpenses = [action.payload, ...state.expenses];
      return {
        ...state,
        expenses: newExpenses,
        filteredExpenses: applyFilters(newExpenses, state.filter),
        loading: false,
        error: null
      };
    
    case ACTIONS.UPDATE_EXPENSE:
      const updatedExpenses = state.expenses.map(expense =>
        expense.id === action.payload.id ? { ...expense, ...action.payload.updates } : expense
      );
      return {
        ...state,
        expenses: updatedExpenses,
        filteredExpenses: applyFilters(updatedExpenses, state.filter),
        loading: false,
        error: null
      };
    
    case ACTIONS.DELETE_EXPENSE:
      const remainingExpenses = state.expenses.filter(expense => expense.id !== action.payload);
      return {
        ...state,
        expenses: remainingExpenses,
        filteredExpenses: applyFilters(remainingExpenses, state.filter),
        loading: false,
        error: null
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: { ...state.filter, ...action.payload },
        filteredExpenses: applyFilters(state.expenses, { ...state.filter, ...action.payload })
      };
    
    default:
      return state;
  }
};

/**
 * Expense Provider Component
 */
export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { user, isGuest } = useAuth();
  const isMounted = useRef(true);

  // Supabase operations
  const loadExpensesFromSupabase = async () => {
    console.log('📊 loadExpensesFromSupabase called for user:', user?.email);
    if (!user || !isSupabaseConfigured || !supabase) {
      console.log('❌ Cannot load from Supabase:', { user: !!user, isSupabaseConfigured, supabase: !!supabase });
      return;
    }
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      console.log('🔍 Fetching expenses for user:', user.id);
      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📋 Supabase query result:', { 
        expenseCount: data?.length || 0, 
        error: error?.message,
        hasData: !!data 
      });

      if (error) throw error;
      
      // Map Supabase fields to frontend format
      const expenses = (data || []).map(expense => ({
        ...expense,
        receiptUrl: expense.receipt_url || null, // Map receipt_url to receiptUrl
        paymentMethod: expense.payment_method || null, // Map payment_method to paymentMethod
        note: expense.notes || expense.note || null // Map notes to note
      }));
      
      console.log('📋 Mapped expenses with receipts:', expenses.map(e => ({ 
        id: e.id, 
        description: e.description, 
        hasReceipt: !!e.receiptUrl,
        receiptUrl: e.receiptUrl?.substring(0, 50) + '...' // Show first 50 chars
      })));
      
      dispatch({ type: ACTIONS.SET_EXPENSES, payload: expenses });
      
      if (expenses.length > 0) {
        console.log(`✅ Loaded ${expenses.length} expenses from Supabase`);
        // Only show toast for initial loads on first visit
        const hasShownLoadToast = localStorage.getItem('smartjeb-load-toast-shown');
        const currentDate = new Date().toDateString();
        const lastToastDate = localStorage.getItem('smartjeb-load-toast-date');
        
        // Only show load toast once per day
        if (!hasShownLoadToast || lastToastDate !== currentDate) {
          toast.success(`Loaded ${expenses.length} expenses`);
          localStorage.setItem('smartjeb-load-toast-shown', 'true');
          localStorage.setItem('smartjeb-load-toast-date', currentDate);
        }
      } else {
        console.log('📭 No expenses found in Supabase for this user');
      }
    } catch (error) {
      console.error('❌ Error loading expenses from Supabase:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load expenses');
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const saveExpenseToSupabase = async (expense) => {
    console.log('saveExpenseToSupabase called with:', expense);
    console.log('User check:', !!user, 'Supabase configured:', isSupabaseConfigured, 'Supabase client:', !!supabase);
    
    if (!user || !isSupabaseConfigured || !supabase) {
      console.log('Conditions not met for Supabase save');
      return;
    }
    
    try {
      const expenseData = {
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date,
        payment_method: expense.paymentMethod || expense.payment_method || null,
        notes: expense.note || expense.notes || null,
        receipt_url: expense.receiptUrl || expense.receipt_url || expense.receipt || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Prepared expense data for Supabase:', expenseData);

      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .insert([expenseData])
        .select()
        .single();

      console.log('Supabase insert result:', { data, error });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving expense to Supabase:', error);
      throw error;
    }
  };

  const updateExpenseInSupabase = async (id, updates) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    try {
      // Map frontend fields to database fields
      const updateData = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
      if (updates.note !== undefined) updateData.notes = updates.note;
      if (updates.receiptUrl !== undefined) updateData.receipt_url = updates.receiptUrl;
      if (updates.receipt !== undefined) updateData.receipt_url = updates.receipt;
      
      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expense in Supabase:', error);
      throw error;
    }
  };

  const deleteExpenseFromSupabase = async (id) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    try {
      const { error } = await supabase
        .from(TABLES.EXPENSES)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting expense from Supabase:', error);
      throw error;
    }
  };

  // Guest data migration is completely disabled
  // Guest data stays in guest mode only, no migration to authenticated accounts
  const migrateGuestData = async () => {
    console.log('🚫 Guest data migration is disabled - guest data stays separate');
    
    // Clean up any existing migration data
    localStorage.removeItem('smartjeb-guest-migration-data');
    localStorage.removeItem('smartjeb-guest-backup');
    localStorage.removeItem('smartjeb-global-migration-lock');
    sessionStorage.removeItem('smartjeb-migration-in-progress');
    
    // Clean up any old migration completion tracking
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('smartjeb-migration-completed-')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Cleaned up all migration-related data');
    return;
  };

  // Function to clear guest data when user is authenticated
  const clearGuestDataIfNotMigrating = () => {
    try {
      // If we're authenticated (not in guest mode), clear guest session data
      if (!isGuest && user) {
        sessionStorage.removeItem('smartjeb-guest-expenses');
        sessionStorage.removeItem('smartjeb-guest-goals');
        console.log('Cleared guest session data - user is authenticated');
      }
    } catch (error) {
      console.error('Error clearing guest data:', error);
    }
  };

  // Load expenses based on auth state
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounted
    
    const loadExpenses = async () => {
      console.log('🔄 loadExpenses effect triggered:', { 
        hasUser: !!user, 
        userEmail: user?.email,
        isGuest, 
        isSupabaseConfigured,
        isMounted,
        expensesLoaded: state.expensesLoaded
      });
      
      if (!isMounted) return; // Exit if component unmounted
      
      // Skip loading if expenses are already loaded
      if (state.expensesLoaded) {
        console.log('✅ Expenses already loaded, skipping fetch');
        return;
      }
      
      // Add small delay to ensure auth state is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear guest data if user is authenticated
      clearGuestDataIfNotMigrating();
      
      if (user && !isGuest && isSupabaseConfigured) {
        console.log('👤 Loading expenses for authenticated user:', user.email);
        console.log(' Loading expenses from Supabase');
        loadExpensesFromSupabase();
      } else {
        console.log('Loading expenses from storage (guest mode or no Supabase)');
        // Load from storage for guests or when Supabase not configured
        try {
          const expenses = loadFromStorage();
          console.log('Loaded expenses from storage:', expenses.length);
          if (isMounted) {
            dispatch({ type: ACTIONS.SET_EXPENSES, payload: expenses });
          }
        } catch (error) {
          console.error('Error loading expenses:', error);
          if (isMounted) {
            toast.error('Failed to load expenses');
          }
        }
      }
    };

    loadExpenses();
    
    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [user, isGuest]);

  // Helper function to save expenses to localStorage/sessionStorage
  const saveToStorage = (expenses) => {
    try {
      console.log('saveToStorage called with:', { expenseCount: expenses.length, isGuest, user: !!user });
      
      if (isGuest) {
        // Use sessionStorage for guest mode - data won't persist after browser close
        sessionStorage.setItem('smartjeb-guest-expenses', JSON.stringify(expenses));
        console.log('Saved to sessionStorage for guest mode');
      } else {
        // Use localStorage for persistence when not authenticated but not in guest mode
        localStorage.setItem('smartjeb-expenses', JSON.stringify(expenses));
        console.log('Saved to localStorage for non-guest mode');
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
      toast.error('Failed to save expenses');
    }
  };

  // Helper function to load expenses from storage
  const loadFromStorage = () => {
    try {
      console.log('loadFromStorage called with:', { isGuest, user: !!user });
      
      if (isGuest) {
        // Load from sessionStorage for guest mode
        const savedExpenses = sessionStorage.getItem('smartjeb-guest-expenses');
        const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
        console.log('Loaded from sessionStorage for guest mode:', expenses.length);
        return expenses;
      } else {
        // Load from localStorage for regular users
        const savedExpenses = localStorage.getItem('smartjeb-expenses');
        const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
        console.log('Loaded from localStorage for non-guest mode:', expenses.length);
        return expenses;
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      return [];
    }
  };

  // Add new expense
  const addNewExpense = async (expenseData) => {
    try {
      console.log('addNewExpense called with:', expenseData);
      console.log('Current user:', user);
      console.log('Is guest:', isGuest);
      console.log('Supabase configured:', isSupabaseConfigured);
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      // Use AI categorization if category is not provided
      let category = expenseData.category;
      if (!category || category === 'other') {
        category = await categorizeExpense(expenseData.description);
      }

      const expense = {
        ...expenseData,
        id: user && !isGuest ? undefined : Date.now().toString(), // Let Supabase generate ID for authenticated users
        category,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Prepared expense object:', expense);

      if (user && !isGuest && isSupabaseConfigured) {
        console.log('Saving to Supabase for authenticated user');
        // Save to Supabase for authenticated users
        const savedExpense = await saveExpenseToSupabase(expense);
        console.log('Saved expense from Supabase:', savedExpense);
        dispatch({ type: ACTIONS.ADD_EXPENSE, payload: savedExpense });
      } else {
        console.log('Saving to localStorage for guest user');
        
        // Check for duplicates in existing expenses before adding
        const existingExpenses = state.expenses || [];
        const isDuplicate = existingExpenses.some(existing => 
          existing.description.trim().toLowerCase() === expenseData.description.trim().toLowerCase() &&
          Math.abs(existing.amount - parseFloat(expenseData.amount)) < 0.01 &&
          existing.date === expenseData.date
        );
        
        if (isDuplicate) {
          console.log('⚠️ Duplicate expense detected, not adding:', expenseData.description);
          toast.warning('This expense already exists!');
          return null;
        }
        
        // Save to localStorage for guests or when Supabase not configured
        expense.id = Date.now().toString();
        const newExpenses = [expense, ...state.expenses];
        dispatch({ type: ACTIONS.ADD_EXPENSE, payload: expense });
        saveToStorage(newExpenses);
      }
      
      // Train AI with user's categorization
      await trainCategorization(expenseData.description, category);
      
      toast.success('Expense added successfully!');
      return expense;
    } catch (error) {
      console.error('Error adding expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to add expense');
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update expense
  const updateExistingExpense = async (id, updates) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      if (user && !isGuest && isSupabaseConfigured) {
        // Update in Supabase for authenticated users
        const updatedExpense = await updateExpenseInSupabase(id, updatedData);
        dispatch({ type: ACTIONS.UPDATE_EXPENSE, payload: { id, updates: updatedExpense } });
      } else {
        // Update in localStorage for guests or when Supabase not configured
        const updatedExpenses = state.expenses.map(expense => 
          expense.id === id ? { ...expense, ...updatedData } : expense
        );
        dispatch({ type: ACTIONS.UPDATE_EXPENSE, payload: { id, updates: updatedData } });
        saveToStorage(updatedExpenses);
      }
      
      toast.success('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to update expense');
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Delete expense
  const deleteExistingExpense = async (id) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      if (user && !isGuest && isSupabaseConfigured) {
        // Delete from Supabase for authenticated users
        await deleteExpenseFromSupabase(id);
        dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: id });
      } else {
        // Delete from localStorage for guests or when Supabase not configured
        const updatedExpenses = state.expenses.filter(expense => expense.id !== id);
        dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: id });
        saveToStorage(updatedExpenses);
      }
      
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to delete expense');
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Set filter
  const setFilter = (newFilter) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: newFilter });
  };

  // Update filters (partial update)
  const updateFilters = (partialFilter) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: partialFilter });
  };

  // Clear filter
  const clearFilter = () => {
    dispatch({ 
      type: ACTIONS.SET_FILTER, 
      payload: { 
        category: 'all', 
        dateRange: 'all', 
        searchTerm: '' 
      } 
    });
  };

  // Get expenses by date range
  const getExpensesByDateRange = (startDate, endDate) => {
    return state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  // Get expense statistics
  const getExpenseStats = () => {
    const { expenses } = state;
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      thisMonth: expenses
        .filter(expense => new Date(expense.date) >= thisMonth)
        .reduce((sum, expense) => sum + expense.amount, 0),
      thisWeek: expenses
        .filter(expense => new Date(expense.date) >= thisWeek)
        .reduce((sum, expense) => sum + expense.amount, 0),
      count: expenses.length,
      categories: expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {})
    };

    return stats;
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      if (user && !isGuest && isSupabaseConfigured) {
        // Delete all user expenses from Supabase
        const { error } = await supabase
          .from(TABLES.EXPENSES)
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Clear local data
      dispatch({ type: ACTIONS.SET_EXPENSES, payload: [] });
      saveToStorage([]);
      
      toast.success('All data cleared successfully!');
    } catch (error) {
      console.error('Error clearing data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to clear data');
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Export data to JSON
  const exportData = () => {
    const dataToExport = {
      expenses: state.expenses,
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalExpenses: state.expenses.length,
      includesReceipts: state.expenses.some(exp => exp.receiptUrl || exp.receipt)
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartjeb-expenses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    // Show helpful message for guest users
    if (isGuest) {
      toast.success(`📁 Exported ${state.expenses.length} expenses with all data including receipts! You can import this file after signing up.`);
    } else {
      toast.success(`📁 Exported ${state.expenses.length} expenses successfully!`);
    }
  };

  // Import data from JSON
  const importData = async (data) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      let expenses = [];
      if (data.expenses && Array.isArray(data.expenses)) {
        expenses = data.expenses;
      } else if (Array.isArray(data)) {
        expenses = data;
      } else {
        throw new Error('Invalid data format');
      }

      // Validate and process expenses
      const processedExpenses = expenses.map(expense => ({
        id: expense.id || Math.random().toString(36).substr(2, 9),
        amount: parseFloat(expense.amount) || 0,
        description: expense.description || 'Imported expense',
        category: expense.category || 'Other',
        date: expense.date || new Date().toISOString().split('T')[0],
        note: expense.note || expense.notes || '',
        receiptUrl: expense.receiptUrl || expense.receipt || null,
        createdAt: expense.createdAt || new Date().toISOString()
      }));

      if (user && !isGuest && isSupabaseConfigured) {
        // Import to Supabase for authenticated users
        const userExpenses = processedExpenses.map(expense => ({
          user_id: user.id,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
          notes: expense.note,
          receipt_url: expense.receiptUrl,
          created_at: expense.createdAt,
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from(TABLES.EXPENSES)
          .insert(userExpenses);

        if (error) throw error;
        
        // Reload data from Supabase
        await loadExpensesFromSupabase();
      } else {
        // Import to local storage for guests
        const currentExpenses = state.expenses;
        const mergedExpenses = [...currentExpenses, ...processedExpenses];
        dispatch({ type: ACTIONS.SET_EXPENSES, payload: mergedExpenses });
        saveToStorage(mergedExpenses);
      }

      toast.success(`Imported ${processedExpenses.length} expenses successfully!`);
    } catch (error) {
      console.error('Error importing data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to import data: ' + error.message);
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Function to remove duplicate expenses (for cleanup)
  const removeDuplicateExpenses = async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      toast.error('Cannot remove duplicates - not authenticated or Supabase not configured');
      return;
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Get all expenses for the user
      const { data: allExpenses, error } = await supabase
        .from(TABLES.EXPENSES)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }); // Keep oldest duplicates

      if (error) throw error;

      if (!allExpenses || allExpenses.length === 0) {
        toast.info('No expenses found to check for duplicates');
        return;
      }

      // Find duplicates
      const seen = new Map();
      const duplicatesToDelete = [];

      for (const expense of allExpenses) {
        const key = `${expense.description.trim().toLowerCase()}-${expense.amount}-${expense.date}`;
        
        if (seen.has(key)) {
          // This is a duplicate - add to deletion list
          duplicatesToDelete.push(expense.id);
          console.log(`🗑️ Found duplicate expense to delete: ${expense.description} (₹${expense.amount}) - ID: ${expense.id}`);
        } else {
          // First occurrence - keep it
          seen.set(key, expense.id);
        }
      }

      if (duplicatesToDelete.length === 0) {
        toast.success('No duplicate expenses found');
        return;
      }

      console.log(`🧹 Removing ${duplicatesToDelete.length} duplicate expenses...`);

      // Delete duplicates
      for (const duplicateId of duplicatesToDelete) {
        const { error: deleteError } = await supabase
          .from(TABLES.EXPENSES)
          .delete()
          .eq('id', duplicateId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error(`❌ Error deleting duplicate expense ${duplicateId}:`, deleteError);
        } else {
          console.log(`✅ Deleted duplicate expense ${duplicateId}`);
        }
      }

      // Reload expenses after cleanup
      await loadExpensesFromSupabase();
      
      toast.success(`🎉 Removed ${duplicatesToDelete.length} duplicate expenses!`);
    } catch (error) {
      console.error('Error removing duplicate expenses:', error);
      toast.error('Failed to remove duplicate expenses');
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    addExpense: addNewExpense,
    createExpense: addNewExpense, // Alias for compatibility
    updateExpense: updateExistingExpense,
    deleteExpense: deleteExistingExpense,
    clearAllData,
    exportData,
    importData,
    setFilter,
    updateFilters,
    clearFilter,
    getExpensesByDateRange,
    getExpensesInRange: getExpensesByDateRange, // Alias for compatibility
    getExpenseStats,
    removeDuplicateExpenses // Expose the removeDuplicateExpenses function
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

/**
 * Custom hook to use expense context
 */
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;
