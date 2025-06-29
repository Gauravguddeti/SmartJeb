import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Star, Zap, Target, Calendar } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

/**
 * Smart Tips Component - AI-powered insights and personalized tips
 */
const SmartTips = () => {
  const { expenses } = useExpenses();
  const [insights, setInsights] = useState([]);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    generateSmartInsights();
  }, [expenses]);

  const generateSmartInsights = () => {
    if (expenses.length === 0) {
      setInsights([
        {
          type: 'welcome',
          icon: Star,
          color: 'blue',
          title: 'Welcome to SmartJeb!',
          description: 'Start tracking your expenses to get personalized insights and tips.',
          action: 'Add your first expense to begin'
        }
      ]);
      return;
    }

    const newInsights = [];
    const today = new Date();
    const thisMonth = { start: startOfMonth(today), end: endOfMonth(today) };
    const lastMonth = { start: startOfMonth(subMonths(today, 1)), end: endOfMonth(subMonths(today, 1)) };

    // Category analysis
    const categoryTotals = {};
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= thisMonth.start && expenseDate <= thisMonth.end;
    });

    thisMonthExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b, null
    );

    if (topCategory && categoryTotals[topCategory] > 0) {
      const percentage = ((categoryTotals[topCategory] / thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(0);
      newInsights.push({
        type: 'category',
        icon: TrendingUp,
        color: 'purple',
        title: 'Top Spending Category',
        description: `${percentage}% of your spending this month is on ${topCategory} (${formatCurrency(categoryTotals[topCategory])})`,
        action: percentage > 40 ? 'Consider setting a budget for this category' : 'Track this category closely'
      });
    }

    // Spending trend analysis
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= lastMonth.start && expenseDate <= lastMonth.end;
    });

    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (lastMonthTotal > 0) {
      const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      if (Math.abs(change) > 20) {
        newInsights.push({
          type: 'trend',
          icon: change > 0 ? TrendingUp : TrendingDown,
          color: change > 0 ? 'red' : 'green',
          title: change > 0 ? 'Spending Increased' : 'Spending Decreased',
          description: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}% compared to last month`,
          action: change > 0 ? 'Review your recent purchases' : 'Great job managing your expenses!'
        });
      }
    }

    // High expense alert
    const averageExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length;
    const highExpenses = thisMonthExpenses.filter(expense => expense.amount > averageExpense * 3);
    
    if (highExpenses.length > 0) {
      newInsights.push({
        type: 'alert',
        icon: AlertTriangle,
        color: 'orange',
        title: 'High Expenses Detected',
        description: `You have ${highExpenses.length} expense${highExpenses.length > 1 ? 's' : ''} significantly above average this month`,
        action: 'Review these transactions for accuracy'
      });
    }

    // Frequency insights
    const dailyAverageExpenses = thisMonthExpenses.length / new Date().getDate();
    if (dailyAverageExpenses > 5) {
      newInsights.push({
        type: 'frequency',
        icon: Zap,
        color: 'yellow',
        title: 'Frequent Transactions',
        description: `You're averaging ${dailyAverageExpenses.toFixed(1)} transactions per day`,
        action: 'Consider batching similar purchases to save time'
      });
    }

    // Budget suggestions
    const monthlyAverage = expenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(1, new Set(expenses.map(exp => exp.date.substring(0, 7))).size);
    if (monthlyAverage > 0 && thisMonthTotal > monthlyAverage * 1.2) {
      newInsights.push({
        type: 'budget',
        icon: Target,
        color: 'indigo',
        title: 'Budget Recommendation',
        description: `Consider setting a monthly budget of ${formatCurrency(monthlyAverage * 1.1)} based on your spending patterns`,
        action: 'Set up budget tracking in Goals'
      });
    }

    // Positive reinforcement
    if (thisMonthExpenses.length >= 10 && Math.random() > 0.5) {
      newInsights.push({
        type: 'positive',
        icon: Star,
        color: 'green',
        title: 'Great Job Tracking!',
        description: `You've logged ${thisMonthExpenses.length} expenses this month. Consistent tracking helps build better financial habits.`,
        action: 'Keep up the excellent work!'
      });
    }

    // Smart tips based on patterns
    const weekendExpenses = thisMonthExpenses.filter(expense => {
      const day = new Date(expense.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    if (weekendExpenses.length > thisMonthExpenses.length * 0.4) {
      newInsights.push({
        type: 'pattern',
        icon: Calendar,
        color: 'blue',
        title: 'Weekend Spending Pattern',
        description: `${((weekendExpenses.length / thisMonthExpenses.length) * 100).toFixed(0)}% of your expenses happen on weekends`,
        action: 'Plan weekend activities within budget'
      });
    }

    // If no insights generated, add a generic tip
    if (newInsights.length === 0) {
      newInsights.push({
        type: 'general',
        icon: Lightbulb,
        color: 'primary',
        title: 'Financial Tip',
        description: 'Tracking expenses is the first step toward better financial health. You\'re on the right track!',
        action: 'Continue building this healthy habit'
      });
    }

    setInsights(newInsights);
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'from-blue-50 to-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: 'text-blue-600' };
      case 'purple':
        return { bg: 'from-purple-50 to-purple-100', text: 'text-purple-800', border: 'border-purple-200', icon: 'text-purple-600' };
      case 'green':
        return { bg: 'from-green-50 to-green-100', text: 'text-green-800', border: 'border-green-200', icon: 'text-green-600' };
      case 'red':
        return { bg: 'from-red-50 to-red-100', text: 'text-red-800', border: 'border-red-200', icon: 'text-red-600' };
      case 'orange':
        return { bg: 'from-orange-50 to-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: 'text-orange-600' };
      case 'yellow':
        return { bg: 'from-yellow-50 to-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: 'text-yellow-600' };
      case 'indigo':
        return { bg: 'from-indigo-50 to-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', icon: 'text-indigo-600' };
      case 'primary':
        return { bg: 'from-primary-50 to-primary-100', text: 'text-primary-800', border: 'border-primary-200', icon: 'text-primary-600' };
      default:
        return { bg: 'from-gray-50 to-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: 'text-gray-600' };
    }
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % insights.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + insights.length) % insights.length);
  };

  if (insights.length === 0) return null;

  const currentInsight = insights[currentTip];
  const Icon = currentInsight.icon;
  const colors = getColorClasses(currentInsight.color);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-primary-600" />
          <span>Smart Insights</span>
        </h3>
        {insights.length > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevTip}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <TrendingDown className="w-4 h-4 text-gray-600 rotate-90" />
            </button>
            <span className="text-sm text-gray-500">
              {currentTip + 1} of {insights.length}
            </span>
            <button
              onClick={nextTip}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <TrendingUp className="w-4 h-4 text-gray-600 rotate-90" />
            </button>
          </div>
        )}
      </div>

      <div className={`bg-gradient-to-r ${colors.bg} p-6 rounded-2xl border ${colors.border} animate-fade-in`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 bg-white rounded-xl shadow-sm border ${colors.border}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          
          <div className="flex-1">
            <h4 className={`text-lg font-semibold ${colors.text} mb-2`}>
              {currentInsight.title}
            </h4>
            <p className={`${colors.text} opacity-90 mb-3 leading-relaxed`}>
              {currentInsight.description}
            </p>
            <div className={`inline-flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg border ${colors.border}`}>
              <Zap className={`w-4 h-4 ${colors.icon}`} />
              <span className={`text-sm font-medium ${colors.text}`}>
                {currentInsight.action}
              </span>
            </div>
          </div>
        </div>
      </div>

      {insights.length > 1 && (
        <div className="flex justify-center space-x-2">
          {insights.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTip(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTip
                  ? 'bg-primary-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartTips;
