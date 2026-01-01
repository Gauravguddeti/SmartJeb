/**
 * Expenses context provider
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Expense, DailyExpenseSummary, WeeklyExpenseSummary, MonthlyExpenseSummary, ExpenseFilter } from '../models/Expense';
import { CategoryType } from '../constants/categories';
import * as databaseService from '../services/databaseService';
import { groupBy, formatDate, getDayTimestamps, getWeekTimestamps, getMonthTimestamps } from '../utils/helpers';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  dailySummary: DailyExpenseSummary | null;
  weeklySummary: WeeklyExpenseSummary | null;
  monthlySummary: MonthlyExpenseSummary | null;
  fetchExpenses: () => Promise<void>;
  fetchExpensesByDateRange: (startDate: number, endDate: number) => Promise<Expense[]>;
  fetchExpensesByCategory: (category: CategoryType) => Promise<Expense[]>;
  addExpense: (expense: Expense) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  getDailySummary: (date: Date) => Promise<DailyExpenseSummary>;
  getWeeklySummary: (date: Date) => Promise<WeeklyExpenseSummary>;
  getMonthlySummary: (year: number, month: number) => Promise<MonthlyExpenseSummary>;
  filterExpenses: (filter: ExpenseFilter) => Promise<Expense[]>;
}

const initialState: ExpenseContextType = {
  expenses: [],
  isLoading: true,
  dailySummary: null,
  weeklySummary: null,
  monthlySummary: null,
  fetchExpenses: async () => {},
  fetchExpensesByDateRange: async () => [],
  fetchExpensesByCategory: async () => [],
  addExpense: async () => ({} as Expense),
  updateExpense: async () => ({} as Expense),
  deleteExpense: async () => {},
  getDailySummary: async () => ({} as DailyExpenseSummary),
  getWeeklySummary: async () => ({} as WeeklyExpenseSummary),
  getMonthlySummary: async () => ({} as MonthlyExpenseSummary),
  filterExpenses: async () => [],
};

// Create the context
export const ExpenseContext = createContext<ExpenseContextType>(initialState);

// Expense provider component
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailySummary, setDailySummary] = useState<DailyExpenseSummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyExpenseSummary | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlyExpenseSummary | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  
  // Fetch all expenses
  const fetchExpenses = async (): Promise<void> => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    try {
      const userExpenses = await databaseService.getAllExpenses(user.uid);
      setExpenses(userExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch expenses by date range
  const fetchExpensesByDateRange = async (startDate: number, endDate: number): Promise<Expense[]> => {
    if (!isAuthenticated || !user) return [];
    
    try {
      const rangeExpenses = await databaseService.getExpensesByDateRange(
        startDate,
        endDate,
        user.uid
      );
      return rangeExpenses;
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      return [];
    }
  };
  
  // Fetch expenses by category
  const fetchExpensesByCategory = async (category: CategoryType): Promise<Expense[]> => {
    if (!isAuthenticated || !user) return [];
    
    try {
      const categoryExpenses = await databaseService.getExpensesByCategory(
        category,
        user.uid
      );
      return categoryExpenses;
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      return [];
    }
  };
  
  // Add a new expense
  const addNewExpense = async (expense: Expense): Promise<Expense> => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    
    try {
      const newExpense = await databaseService.addExpense(expense, user.uid);
      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };
  
  // Update an expense
  const updateExistingExpense = async (expense: Expense): Promise<Expense> => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    
    try {
      const updatedExpense = await databaseService.updateExpense(expense, user.uid);
      setExpenses(prevExpenses =>
        prevExpenses.map(exp => (exp.id === expense.id ? updatedExpense : exp))
      );
      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };
  
  // Delete an expense
  const deleteExistingExpense = async (id: string): Promise<void> => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    
    try {
      await databaseService.deleteExpense(id, user.uid);
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };
  
  // Get daily expense summary
  const getDailySummary = async (date: Date): Promise<DailyExpenseSummary> => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    
    try {
      const { start, end } = getDayTimestamps(date);
      const dayExpenses = await fetchExpensesByDateRange(start, end);
      
      const summary: DailyExpenseSummary = {
        date: formatDate(date),
        total: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        expenses: dayExpenses,
      };
      
      setDailySummary(summary);
      return summary;
    } catch (error) {
      console.error('Error getting daily summary:', error);
      throw error;
    }
  };
  
  // Get weekly expense summary
  const getWeeklySummary = async (date: Date): Promise<WeeklyExpenseSummary> => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    
    try {
      const { start, end } = getWeekTimestamps(date);
      const weekExpenses = await fetchExpensesByDateRange(start, end);
      
      // Group by category
      const expensesByCategory = groupBy(weekExpenses, 'category');
      const byCategory: Record<CategoryType, number> = {} as Record<CategoryType, number>;
      
      // Calculate total for each category
      Object.entries(expensesByCategory).forEach(([category, exps]) => {
        byCategory[category as CategoryType] = exps.reduce(
          (sum, exp) => sum + exp.amount,
          0
        );
      });
      
      const summary: WeeklyExpenseSummary = {
        startDate: formatDate(new Date(start)),
        endDate: formatDate(new Date(end)),
        total: weekExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        byCategory,
      };
      
      setWeeklySummary(summary);
      return summary;
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      throw error;
    }
  };
  
  // Get monthly expense summary
  const getMonthlySummary = async (
    year: number,
    month: number
  ): Promise<MonthlyExpenseSummary> => {
    if (!isAuthenticated || !user) throw new Error('User not authenticated');
    
    try {
      const { start, end } = getMonthTimestamps(year, month);
      const monthExpenses = await fetchExpensesByDateRange(start, end);
      
      // Group by category
      const expensesByCategory = groupBy(monthExpenses, 'category');
      const byCategory: Record<CategoryType, number> = {} as Record<CategoryType, number>;
      
      // Calculate total for each category
      Object.entries(expensesByCategory).forEach(([category, exps]) => {
        byCategory[category as CategoryType] = exps.reduce(
          (sum, exp) => sum + exp.amount,
          0
        );
      });
      
      // Group by day
      const byDay: Record<string, number> = {};
      monthExpenses.forEach(expense => {
        const day = new Date(expense.timestamp).getDate().toString();
        byDay[day] = (byDay[day] || 0) + expense.amount;
      });
      
      const summary: MonthlyExpenseSummary = {
        month: month + 1, // 0-indexed to 1-indexed
        year,
        total: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        byCategory,
        byDay,
      };
      
      setMonthlySummary(summary);
      return summary;
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      throw error;
    }
  };
  
  // Filter expenses
  const filterExpenses = async (filter: ExpenseFilter): Promise<Expense[]> => {
    if (!isAuthenticated || !user) return [];
    
    try {
      let filteredExpenses = expenses;
      
      // Apply date range filter
      if (filter.startDate !== undefined && filter.endDate !== undefined) {
        filteredExpenses = filteredExpenses.filter(
          exp => exp.timestamp >= filter.startDate! && exp.timestamp <= filter.endDate!
        );
      }
      
      // Apply category filter
      if (filter.categories && filter.categories.length > 0) {
        filteredExpenses = filteredExpenses.filter(exp =>
          filter.categories!.includes(exp.category)
        );
      }
      
      // Apply amount filter
      if (filter.minAmount !== undefined) {
        filteredExpenses = filteredExpenses.filter(exp => exp.amount >= filter.minAmount!);
      }
      
      if (filter.maxAmount !== undefined) {
        filteredExpenses = filteredExpenses.filter(exp => exp.amount <= filter.maxAmount!);
      }
      
      // Apply search term filter
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filteredExpenses = filteredExpenses.filter(
          exp =>
            exp.merchantName.toLowerCase().includes(term) ||
            (exp.notes && exp.notes.toLowerCase().includes(term))
        );
      }
      
      return filteredExpenses;
    } catch (error) {
      console.error('Error filtering expenses:', error);
      return [];
    }
  };
  
  // Load expenses when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchExpenses();
    } else {
      setExpenses([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);
  
  const value: ExpenseContextType = {
    expenses,
    isLoading,
    dailySummary,
    weeklySummary,
    monthlySummary,
    fetchExpenses,
    fetchExpensesByDateRange,
    fetchExpensesByCategory,
    addExpense: addNewExpense,
    updateExpense: updateExistingExpense,
    deleteExpense: deleteExistingExpense,
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    filterExpenses,
  };
  
  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Hook for consuming the expense context
export const useExpenses = () => useContext(ExpenseContext);

export default ExpenseProvider;
