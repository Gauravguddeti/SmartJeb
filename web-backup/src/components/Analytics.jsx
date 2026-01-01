import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Calendar, TrendingUp, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../services/database';

/**
 * Analytics Component - Visual charts and data analysis
 */
const Analytics = () => {
  const { expenses, getExpensesInRange } = useExpenses();
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState({
    categoryData: [],
    dailyData: [],
    monthlyTrend: []
  });

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  useEffect(() => {
    generateChartData();
  }, [expenses, timeRange]);

  const generateChartData = async () => {
    const today = new Date();
    let startDate, endDate;

    // Set date range based on selection
    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'quarter':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = today;
        break;
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
    }

    const filteredExpenses = await getExpensesInRange(startDate, endDate);

    // Category breakdown
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const categoryData = Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));

    // Daily spending data
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = days.map(day => {
      const dayExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === day.toDateString();
      });
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
        amount: total,
        fullDate: day
      };
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      const monthExpenses = await getExpensesInRange(monthStart, monthEnd);
      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyTrend.push({
        month: format(monthStart, 'MMM yyyy'),
        amount: total
      });
    }

    setChartData({
      categoryData,
      dailyData: dailyData.slice(-30), // Show last 30 days max
      monthlyTrend
    });
  };

  const getTotalAmount = () => {
    return chartData.categoryData.reduce((sum, item) => sum + item.value, 0);
  };

  const getTopCategory = () => {
    if (chartData.categoryData.length === 0) return 'None';
    return chartData.categoryData.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    ).name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Visual insights into your spending patterns</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{getTotalAmount().toFixed(2)}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Category</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{getTopCategory()}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-900/50 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{chartData.categoryData.length}</p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900/50 p-3 rounded-full">
              <PieChart className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Spending by Category</h3>
          {chartData.categoryData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Daily Spending */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily Spending</h3>
          {chartData.dailyData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">6-Month Spending Trend</h3>
        {chartData.monthlyTrend.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>No data available</p>
          </div>
        )}
      </div>

      {/* Category Details */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {chartData.categoryData.map((category, index) => {
            const percentage = ((category.value / getTotalAmount()) * 100).toFixed(1);
            return (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">₹{category.value.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
