import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Target,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { generateSpendingInsights, generateWeeklySummary } from '../services/aiService';
import { formatCurrency } from '../utils/formatters';
import QuickStats from './QuickStats';
import SmartTips from './SmartTips';
import Achievements from './Achievements';

/**
 * Dashboard Component - Overview of expenses and insights
 * Features beautiful animations and modern card-based design
 */
const Dashboard = () => {
  const { expenses, getExpensesInRange } = useExpenses();
  const [insights, setInsights] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateDashboardData();
  }, [expenses]);

  const calculateDashboardData = async () => {
    setIsLoading(true);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    // Today's expenses
    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfToday && expenseDate < endOfToday;
    });
    const todaySum = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTodayTotal(todaySum);

    // This month's expenses
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthExpenses = await getExpensesInRange(monthStart, monthEnd);
    const monthSum = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setMonthlyTotal(monthSum);

    // Generate insights for all expenses
    const allInsights = generateSpendingInsights(expenses);
    setInsights(allInsights);

    // Weekly summary
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const thisWeekExpenses = await getExpensesInRange(weekStart, weekEnd);
    
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekExpenses = await getExpensesInRange(lastWeekStart, lastWeekEnd);
    
    const weekly = generateWeeklySummary(thisWeekExpenses, lastWeekExpenses);
    setWeeklyData(weekly);
    setIsLoading(false);
  };

  const getRecentExpenses = () => {
    return expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Travel': 'bg-green-100 text-green-800',
      'Groceries': 'bg-emerald-100 text-emerald-800',
      'Personal Care': 'bg-violet-100 text-violet-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-gray-600 font-medium mt-1">Your expense overview and insights</p>
      </div>

      {/* Quick Stats Widget */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <QuickStats />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 animate-slide-up group" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(todayTotal)}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Today's expenses</p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 animate-slide-up group" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(monthlyTotal)}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Monthly total</p>
            </div>
            <div className="bg-gradient-to-br from-success-100 to-success-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 animate-slide-up group" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Daily Average</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(insights.averagePerDay)}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">Average per day</p>
            </div>
            <div className="bg-gradient-to-br from-warning-100 to-warning-200 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      {weeklyData && (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
            This Week's Summary
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">{formatCurrency(weeklyData.currentWeekTotal)}</p>
              <p className="text-sm text-gray-500 font-medium">Total spent this week</p>
            </div>
            {weeklyData.percentageChange !== 0 && (
              <div className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium shadow-md animate-bounce-gentle ${
                weeklyData.trend === 'increased' 
                  ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' 
                  : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
              }`}>
                {weeklyData.trend === 'increased' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(weeklyData.percentageChange)}% from last week
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Insights */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2 rounded-xl">
              <AlertCircle className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Spending Insights</h3>
          </div>
          <div className="space-y-4">
            {insights.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-primary-50 rounded-xl hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mt-1 flex-shrink-0 animate-pulse-gentle"></div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tips */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-warning-100 to-warning-200 p-2 rounded-xl">
              <Lightbulb className="w-5 h-5 text-warning-600 animate-pulse-gentle" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Smart Saving Tips</h3>
          </div>
          <div className="space-y-4">
            {insights.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-xl hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: `${0.7 + index * 0.1}s` }}>
                <div className="w-3 h-3 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full mt-1 flex-shrink-0 animate-pulse-gentle"></div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 animate-slide-up" style={{ animationDelay: '0.8s' }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 rounded-xl mr-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          Recent Expenses
        </h3>
        <div className="space-y-3">
          {getRecentExpenses().map((expense) => (
            <div key={expense.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{expense.amount.toFixed(2)}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Tips */}
      <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <SmartTips />
      </div>

      {/* Achievements (only show if user has some activity) */}
      {expenses.length > 5 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <Achievements />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
