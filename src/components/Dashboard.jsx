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

/**
 * Dashboard Component - Overview of expenses and insights
 */
const Dashboard = () => {
  const { expenses, getExpensesInRange } = useExpenses();
  const [insights, setInsights] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    calculateDashboardData();
  }, [expenses]);

  const calculateDashboardData = async () => {
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

  if (!insights) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Your expense overview and insights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{todayTotal.toFixed(2)}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{monthlyTotal.toFixed(2)}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-900/50 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{insights.averagePerDay.toFixed(2)}</p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900/50 p-3 rounded-full">
              <Target className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      {weeklyData && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">This Week's Summary</h3>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{weeklyData.currentWeekTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total spent this week</p>
            </div>
            {weeklyData.percentageChange !== 0 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                weeklyData.trend === 'increased' 
                  ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' 
                  : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
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
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Spending Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tips */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Smart Saving Tips</h3>
          </div>
          <div className="space-y-3">
            {insights.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <div className="w-2 h-2 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {getRecentExpenses().map((expense) => (
            <div key={expense.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-gray-100">₹{expense.amount.toFixed(2)}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const lastWeekTotal = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastWeekStart = startOfWeek(subDays(new Date(), 7));
      const lastWeekEnd = endOfWeek(subDays(new Date(), 7));
      return expenseDate >= lastWeekStart && expenseDate <= lastWeekEnd;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const weeklyTrend = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your expenses for {filters.dateRange === 'today' ? 'today' : filters.dateRange}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spending */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.total.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
          </div>
          {weeklyTrend !== 0 && (
            <div className="mt-2 flex items-center">
              {weeklyTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-danger-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-success-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${weeklyTrend > 0 ? 'text-danger-500' : 'text-success-500'}`}>
                {Math.abs(weeklyTrend).toFixed(1)}% vs last week
              </span>
            </div>
          )}
        </div>

        {/* Transaction Count */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-success-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            ₹{stats.averagePerDay.toFixed(0)} average per transaction
          </p>
        </div>

        {/* Top Category */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="text-xl font-bold text-gray-900">
                {Object.keys(stats.categoryTotals).length > 0
                  ? Object.entries(stats.categoryTotals).reduce((a, b) => 
                      stats.categoryTotals[a[0]] > stats.categoryTotals[b[0]] ? a : b
                    )[0]
                  : 'None'
                }
              </p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-warning-500" />
            </div>
          </div>
          {Object.keys(stats.categoryTotals).length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              ₹{Object.entries(stats.categoryTotals).reduce((a, b) => 
                stats.categoryTotals[a[0]] > stats.categoryTotals[b[0]] ? a : b
              )[1].toFixed(0)} spent
            </p>
          )}
        </div>

        {/* This Week */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">₹{thisWeekTotal.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {format(startOfWeek(new Date()), 'MMM dd')} - {format(endOfWeek(new Date()), 'MMM dd')}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No expenses to display</p>
            </div>
          )}
        </div>

        {/* Daily Spending Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.date;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">
                      {expense.category === 'Food' ? '🍽️' :
                       expense.category === 'Transport' ? '🚗' :
                       expense.category === 'Shopping' ? '🛒' :
                       expense.category === 'Entertainment' ? '🎬' :
                       expense.category === 'Health' ? '🏥' :
                       expense.category === 'Bills' ? '📄' :
                       expense.category === 'Education' ? '📚' : '📦'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {expense.note || expense.vendor || 'Expense'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.category} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{expense.amount}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No expenses found</p>
            <p className="text-sm">Add your first expense to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
