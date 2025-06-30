import React, { createContext, useContext, useReducer, useEffect } from 'react';
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
  }
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
        error: null
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
        expense.id === action.payload.id ? action.payload : expense
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

  // Supabase operations
  const loadExpensesFromSupabase = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: ACTIONS.SET_EXPENSES, payload: data || [] });
    } catch (error) {
      console.error('Error loading expenses from Supabase:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load expenses');
    }
  };

  const saveExpenseToSupabase = async (expense) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    try {
      const expenseData = {
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date,
        payment_method: expense.paymentMethod || expense.payment_method || null,
        notes: expense.note || expense.notes || null,
        receipt_url: expense.receipt || expense.receipt_url || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.EXPENSES)
        .insert([expenseData])
        .select()
        .single();

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

  // Load expenses based on auth state
  useEffect(() => {
    const loadExpenses = () => {
      if (user && !isGuest && isSupabaseConfigured) {
        // Load from Supabase for authenticated users
        loadExpensesFromSupabase();
      } else {
        // Load from localStorage for guests or when Supabase not configured
        try {
          const savedExpenses = localStorage.getItem('smartjeb-expenses');
          if (savedExpenses) {
            const expenses = JSON.parse(savedExpenses);
            dispatch({ type: ACTIONS.SET_EXPENSES, payload: expenses });
          }
        } catch (error) {
          console.error('Error loading expenses:', error);
          toast.error('Failed to load expenses');
        }
      }
    };

    loadExpenses();
  }, [user, isGuest]);

  // Helper function to save expenses to localStorage
  const saveToStorage = (expenses) => {
    try {
      localStorage.setItem('smartjeb-expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      toast.error('Failed to save expenses');
    }
  };

  // Add new expense
  const addNewExpense = async (expenseData) => {
    try {
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

      if (user && !isGuest && isSupabaseConfigured) {
        // Save to Supabase for authenticated users
        const savedExpense = await saveExpenseToSupabase(expense);
        dispatch({ type: ACTIONS.ADD_EXPENSE, payload: savedExpense });
      } else {
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

  const value = {
    ...state,
    addExpense: addNewExpense,
    createExpense: addNewExpense, // Alias for compatibility
    updateExpense: updateExistingExpense,
    deleteExpense: deleteExistingExpense,
    setFilter,
    clearFilter,
    getExpensesByDateRange,
    getExpensesInRange: getExpensesByDateRange, // Alias for compatibility
    getExpenseStats
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
