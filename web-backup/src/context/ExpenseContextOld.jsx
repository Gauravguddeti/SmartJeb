import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getAllExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  getExpensesByDateRange 
} from '../services/database.js';
import { categorizeExpense, trainCategorization } from '../services/aiService.js';
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
      const newExpenses = [...state.expenses, action.payload];
      return {
        ...state,
        expenses: newExpenses,
        filteredExpenses: applyFilters(newExpenses, state.filter),
        loading: false
      };
    
    case ACTIONS.UPDATE_EXPENSE:
      const updatedExpenses = state.expenses.map(expense =>
        expense.id === action.payload.id ? action.payload : expense
      );
      return {
        ...state,
        expenses: updatedExpenses,
        filteredExpenses: applyFilters(updatedExpenses, state.filter),
        loading: false
      };
    
    case ACTIONS.DELETE_EXPENSE:
      const remainingExpenses = state.expenses.filter(expense => expense.id !== action.payload);
      return {
        ...state,
        expenses: remainingExpenses,
        filteredExpenses: applyFilters(remainingExpenses, state.filter),
        loading: false
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
 * Apply filters to expenses
 * @param {Array} expenses - All expenses
 * @param {Object} filter - Filter object
 * @returns {Array} Filtered expenses
 */
const applyFilters = (expenses, filter) => {
  let filtered = [...expenses];
  
  // Category filter
  if (filter.category && filter.category !== 'all') {
    filtered = filtered.filter(expense => expense.category === filter.category);
  }
  
  // Search term filter
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase();
    filtered = filtered.filter(expense =>
      expense.description.toLowerCase().includes(term) ||
      (expense.note && expense.note.toLowerCase().includes(term))
    );
  }
  
  // Date range filter
  if (filter.dateRange && filter.dateRange !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (filter.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    filtered = filtered.filter(expense => new Date(expense.date) >= startDate);
  }
  
  // Sort by date (newest first)
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Expense Context Provider
 */
export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  /**
   * Load all expenses from database
   */
  const loadExpenses = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const expenses = await getAllExpenses();
      dispatch({ type: ACTIONS.SET_EXPENSES, payload: expenses });
    } catch (error) {
      console.error('Failed to load expenses:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load expenses' });
      toast.error('Failed to load expenses');
    }
  };

  /**
   * Add a new expense
   * @param {Object} expenseData - Expense data
   */
  const createExpense = async (expenseData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      // Auto-categorize if no category provided
      let category = expenseData.category;
      if (!category || category === 'Other') {
        category = await categorizeExpense(expenseData.description, expenseData.note);
      }
      
      const expense = {
        ...expenseData,
        category,
        amount: parseFloat(expenseData.amount)
      };
      
      const id = await addExpense(expense);
      const newExpense = { ...expense, id };
      
      dispatch({ type: ACTIONS.ADD_EXPENSE, payload: newExpense });
      
      // Train categorization model
      if (expenseData.category && expenseData.category !== category) {
        await trainCategorization(expenseData.description, expenseData.category);
      }
      
      toast.success('Expense added successfully!');
      return newExpense;
    } catch (error) {
      console.error('Failed to add expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to add expense' });
      toast.error('Failed to add expense');
      throw error;
    }
  };

  /**
   * Update an existing expense
   * @param {Object} expenseData - Updated expense data
   */
  const modifyExpense = async (expenseData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const expense = {
        ...expenseData,
        amount: parseFloat(expenseData.amount)
      };
      
      await updateExpense(expense);
      dispatch({ type: ACTIONS.UPDATE_EXPENSE, payload: expense });
      
      // Train categorization model with user correction
      await trainCategorization(expense.description, expense.category);
      
      toast.success('Expense updated successfully!');
      return expense;
    } catch (error) {
      console.error('Failed to update expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to update expense' });
      toast.error('Failed to update expense');
      throw error;
    }
  };

  /**
   * Remove an expense
   * @param {number} id - Expense ID
   */
  const removeExpense = async (id) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      await deleteExpense(id);
      dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: id });
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Failed to delete expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
    }
  };

  /**
   * Update filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = (newFilters) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: newFilters });
  };

  /**
   * Get expenses for specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Expenses in date range
   */
  const getExpensesInRange = async (startDate, endDate) => {
    try {
      return await getExpensesByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Failed to get expenses in range:', error);
      toast.error('Failed to load expenses for date range');
      return [];
    }
  };

  const value = {
    // State
    expenses: state.expenses,
    filteredExpenses: state.filteredExpenses,
    loading: state.loading,
    error: state.error,
    filter: state.filter,
    
    // Actions
    createExpense,
    modifyExpense,
    removeExpense,
    updateFilters,
    loadExpenses,
    getExpensesInRange
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

/**
 * Hook to use expense context
 * @returns {Object} Expense context value
 */
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
