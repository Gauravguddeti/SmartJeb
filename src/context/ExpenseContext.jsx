import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();

  // Load user expenses on auth state change
  useEffect(() => {
    if (!user) {
      // Clear expenses when user logs out
      dispatch({ type: ACTIONS.SET_EXPENSES, payload: [] });
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    // Set up real-time listener for user's expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: ACTIONS.SET_EXPENSES, payload: expenses });
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        toast.error('Failed to load expenses');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add new expense
  const addNewExpense = async (expenseData) => {
    if (!user) {
      toast.error('You must be logged in to add expenses');
      return;
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      // Use AI categorization if category is not provided
      let category = expenseData.category;
      if (!category || category === 'other') {
        category = await categorizeExpense(expenseData.description);
      }

      const expense = {
        ...expenseData,
        category,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'expenses'), expense);
      
      // Train AI with user's categorization
      await trainCategorization(expenseData.description, category);
      
      toast.success('Expense added successfully!');
      return { id: docRef.id, ...expense };
    } catch (error) {
      console.error('Error adding expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to add expense');
      throw error;
    }
  };

  // Update expense
  const updateExistingExpense = async (id, updates) => {
    if (!user) {
      toast.error('You must be logged in to update expenses');
      return;
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const expenseRef = doc(db, 'expenses', id);
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(expenseRef, updatedData);
      
      toast.success('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to update expense');
      throw error;
    }
  };

  // Delete expense
  const deleteExistingExpense = async (id) => {
    if (!user) {
      toast.error('You must be logged in to delete expenses');
      return;
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      await deleteDoc(doc(db, 'expenses', id));
      
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to delete expense');
      throw error;
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
    updateExpense: updateExistingExpense,
    deleteExpense: deleteExistingExpense,
    setFilter,
    clearFilter,
    getExpensesByDateRange,
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
