/**
 * Expense data model
 */
import { CategoryType } from '../constants/categories';

export interface Expense {
  id: string;
  amount: number;
  merchantName: string;
  category: CategoryType;
  timestamp: number; // Unix timestamp
  notes?: string;
  receiptUri?: string; // Optional URI to a receipt image
  isAutoLogged: boolean; // Whether it was automatically logged from a notification
  sourceApp?: string; // Source app for auto-logged expenses (e.g., "Google Pay", "HDFC Bank")
}

export interface DailyExpenseSummary {
  date: string; // Format: YYYY-MM-DD
  total: number;
  expenses: Expense[];
}

export interface WeeklyExpenseSummary {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
  total: number;
  byCategory: Record<CategoryType, number>;
}

export interface MonthlyExpenseSummary {
  month: number; // 1-12
  year: number;
  total: number;
  byCategory: Record<CategoryType, number>;
  byDay: Record<string, number>; // Key: day of month (1-31), Value: amount
}

export interface ExpenseFilter {
  startDate?: number;
  endDate?: number;
  categories?: CategoryType[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export default Expense;
