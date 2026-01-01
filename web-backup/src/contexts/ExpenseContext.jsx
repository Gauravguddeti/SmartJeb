/**
 * ExpenseContext - Global state management for SmartJeb
 * Provides expense data and operations to all components
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { expenseDB, categoryDB } from '../services/database';
import toast from 'react-hot-toast';

const ExpenseContext = createContext();

/**
 * Initial state for the expense context
 */
const initialState = {
  expenses: [],
  categories: [],
  loading: false,
  error: null,
  selectedDate: new Date(),
  filters: {
    category: '',
    dateRange: 'today'
  }
};

/**
 * Expense reducer for state management
 * @param {Object} state - Current state
 * @param {Object} action - Action to perform
 * @returns {Object} New state
 */
function expenseReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, loading: false };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'ADD_EXPENSE':
      return { 
        ...state, 
        expenses: [action.payload, ...state.expenses],
        loading: false 
      };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
        loading: false
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        loading: false
      };
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };
    
    default:
      return state;
  }
}

/**
 * ExpenseProvider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  /**
   * Load initial data on component mount
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Load expenses and categories from IndexedDB
   */
  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Initialize default categories if needed
      await categoryDB.initializeDefaults();
      
      // Load categories and expenses
      const [categories, expenses] = await Promise.all([
        categoryDB.getAll(),
        expenseDB.getAll()
      ]);
      
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      dispatch({ type: 'SET_EXPENSES', payload: expenses.reverse() }); // Latest first
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      toast.error('Failed to load expenses');
    }
  };

  /**
   * Add a new expense
   * @param {Object} expenseData - Expense data
   */
  const addExpense = async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const id = await expenseDB.add(expenseData);
      const newExpense = { ...expenseData, id };
      
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      toast.success('Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
      toast.error('Failed to add expense');
    }
  };

  /**
   * Update an existing expense
   * @param {Object} expenseData - Updated expense data
   */
  const updateExpense = async (expenseData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await expenseDB.update(expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: expenseData });
      toast.success('Expense updated successfully!');
    } catch (error) {
      console.error('Failed to update expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
      toast.error('Failed to update expense');
    }
  };

  /**
   * Delete an expense
   * @param {number} expenseId - Expense ID
   */
  const deleteExpense = async (expenseId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await expenseDB.delete(expenseId);
      dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Failed to delete expense:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
    }
  };

  /**
   * Set selected date
   * @param {Date} date - Selected date
   */
  const setSelectedDate = (date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  /**
   * Set filters
   * @param {Object} filters - Filter options
   */
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  /**
   * Get filtered expenses based on current filters
   * @returns {Array} Filtered expenses
   */
  const getFilteredExpenses = () => {
    let filtered = [...state.expenses];
    
    // Filter by category
    if (state.filters.category) {
      filtered = filtered.filter(expense => expense.category === state.filters.category);
    }
    
    // Filter by date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (state.filters.dateRange) {
      case 'today':
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.date);
          expenseDate.setHours(0, 0, 0, 0);
          return expenseDate.getTime() === today.getTime();
        });
        break;
      
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        filtered = filtered.filter(expense => new Date(expense.date) >= weekStart);
        break;
      
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filtered = filtered.filter(expense => new Date(expense.date) >= monthStart);
        break;
      
      default:
        // 'all' - no date filtering
        break;
    }
    
    return filtered;
  };

  /**
   * Get expense statistics
   * @returns {Object} Statistics object
   */
  const getStatistics = () => {
    const filteredExpenses = getFilteredExpenses();
    
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    const averagePerDay = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;
    
    return {
      total,
      count: filteredExpenses.length,
      categoryTotals,
      averagePerDay
    };
  };

  const value = {
    ...state,
    addExpense,
    updateExpense,
    deleteExpense,
    setSelectedDate,
    setFilters,
    getFilteredExpenses,
    getStatistics,
    loadInitialData
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

/**
 * Custom hook to use the expense context
 * @returns {Object} Expense context value
 */
export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
