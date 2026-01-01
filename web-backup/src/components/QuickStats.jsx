import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Zap, Clock } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isToday, isYesterday, subDays } from 'date-fns';

/**
 * Quick Stats Component - Display key metrics at a glance
 */
const QuickStats = () => {
  const { expenses } = useExpenses();

  // Calculate various statistics
  const today = new Date();
  const yesterday = subDays(today, 1);
  const thisWeek = { start: startOfWeek(today), end: endOfWeek(today) };
  const thisMonth = { start: startOfMonth(today), end: endOfMonth(today) };

  const todayExpenses = expenses.filter(expense => isToday(new Date(expense.date)));
  const yesterdayExpenses = expenses.filter(expense => isYesterday(new Date(expense.date)));
  const thisWeekExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= thisWeek.start && expenseDate <= thisWeek.end;
  });
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= thisMonth.start && expenseDate <= thisMonth.end;
  });

  const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const yesterdayTotal = yesterdayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const weekTotal = thisWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate averages
  const dailyAverage = monthTotal / new Date().getDate();
  const weeklyAverage = monthTotal / (new Date().getDate() / 7);

  // Get most frequent category
  const categoryCount = {};
  thisMonthExpenses.forEach(expense => {
    categoryCount[expense.category] = (categoryCount[expense.category] || 0) + 1;
  });
  const topCategory = Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b, 'None'
  );

  // Calculate trend (today vs yesterday)
  const dailyTrend = todayTotal - yesterdayTotal;
  const dailyTrendPercent = yesterdayTotal > 0 ? ((dailyTrend / yesterdayTotal) * 100) : 0;

  const stats = [
    {
      title: "Today's Spending",
      value: formatCurrency(todayTotal),
      icon: Calendar,
      trend: dailyTrend,
      trendPercent: dailyTrendPercent,
      color: todayTotal > dailyAverage ? 'red' : 'green',
      subtitle: `${todayExpenses.length} transaction${todayExpenses.length !== 1 ? 's' : ''}`
    },
    {
      title: 'This Week',
      value: formatCurrency(weekTotal),
      icon: TrendingUp,
      color: 'blue',
      subtitle: `${thisWeekExpenses.length} transactions`
    },
    {
      title: 'This Month',
      value: formatCurrency(monthTotal),
      icon: Target,
      color: 'purple',
      subtitle: `${thisMonthExpenses.length} transactions`
    },
    {
      title: 'Daily Average',
      value: formatCurrency(dailyAverage),
      icon: Zap,
      color: 'orange',
      subtitle: 'This month'
    },
    {
      title: 'Top Category',
      value: topCategory,
      icon: Clock,
      color: 'indigo',
      subtitle: `${categoryCount[topCategory] || 0} times this month`
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'from-red-50 to-red-100 text-red-600 border-red-200';
      case 'green':
        return 'from-green-50 to-green-100 text-green-600 border-green-200';
      case 'blue':
        return 'from-blue-50 to-blue-100 text-blue-600 border-blue-200';
      case 'purple':
        return 'from-purple-50 to-purple-100 text-purple-600 border-purple-200';
      case 'orange':
        return 'from-orange-50 to-orange-100 text-orange-600 border-orange-200';
      case 'indigo':
        return 'from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200';
      default:
        return 'from-gray-50 to-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorClasses} p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className="w-5 h-5" />
                {stat.trend !== undefined && (
                  <div className={`flex items-center space-x-1 text-xs font-medium ${
                    stat.trend > 0 ? 'text-red-600' : stat.trend < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stat.trend > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : stat.trend < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {stat.trend !== 0 && (
                      <span>{Math.abs(stat.trendPercent).toFixed(0)}%</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-medium opacity-80">{stat.title}</div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs opacity-70">{stat.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-4 rounded-xl border border-primary-200">
        <h3 className="text-sm font-semibold text-primary-800 mb-2">💡 Quick Insight</h3>
        <p className="text-sm text-primary-700">
          {todayTotal > dailyAverage * 1.5 ? (
            `You're spending 50% more than your daily average today. Consider reviewing your expenses.`
          ) : todayTotal < dailyAverage * 0.5 ? (
            `Great job! You're spending less than usual today. Keep it up!`
          ) : weekTotal > 0 ? (
            `Your top spending category this month is ${topCategory}. ${categoryCount[topCategory]} transactions so far.`
          ) : (
            'Start tracking your expenses to get personalized insights!'
          )}
        </p>
      </div>
    </div>
  );
};

export default QuickStats;
