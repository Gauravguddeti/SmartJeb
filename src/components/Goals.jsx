import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, TrendingUp, AlertTriangle, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useGoals } from '../context/GoalsContext';
import { formatCurrency } from '../utils/formatters';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/**
 * Goals Component - Set and track spending goals and budgets
 */
const Goals = () => {
  const { expenses } = useExpenses();
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [newGoal, setNewGoal] = useState({
    title: '',
    amount: '',
    category: 'all',
    type: 'monthly', // monthly, weekly, daily
    description: ''
  });

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.amount) return;

    try {
      await addGoal({
        ...newGoal,
        amount: parseFloat(newGoal.amount)
      });
      
      setNewGoal({ title: '', amount: '', category: 'all', type: 'monthly', description: '' });
      setShowAddGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const toggleGoalStatus = async (id) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      try {
        await updateGoal(id, { isActive: !goal.isActive });
      } catch (error) {
        console.error('Error toggling goal status:', error);
      }
    }
  };

  const calculateProgress = (goal) => {
    const now = new Date();
    let startDate, endDate;

    switch (goal.type) {
      case 'monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = now;
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const isInRange = isWithinInterval(expenseDate, { start: startDate, end: endDate });
      const categoryMatch = goal.category === 'all' || expense.category === goal.category;
      return isInRange && categoryMatch;
    });

    const spent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (spent / goal.amount) * 100;

    return {
      spent,
      remaining: Math.max(0, goal.amount - spent),
      percentage: Math.min(100, percentage),
      isOverBudget: spent > goal.amount,
      period: `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`
    };
  };

  const getProgressColor = (percentage, isOverBudget) => {
    if (isOverBudget) return 'from-red-500 to-red-600';
    if (percentage >= 80) return 'from-yellow-500 to-orange-500';
    if (percentage >= 60) return 'from-blue-500 to-indigo-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStatusIcon = (progress) => {
    if (progress.isOverBudget) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (progress.percentage >= 90) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-primary-600 bg-clip-text text-transparent">
            Goals & Budgets
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium mt-1">Set spending limits and track your progress</p>
        </div>
        
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 animate-glow"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const progress = calculateProgress(goal);
          
          return (
            <div 
              key={goal.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">{goal.title}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    {goal.category === 'all' ? 'All Categories' : goal.category} • {goal.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(progress)}
                  <button
                    onClick={() => toggleGoalStatus(goal.id)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      goal.isActive ? 'bg-green-500 shadow-green-200 shadow-lg' : 'bg-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{progress.percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(progress.percentage, progress.isOverBudget)} transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(100, progress.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Amount Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Budget:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(goal.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spent:</span>
                  <span className={`font-semibold ${progress.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatCurrency(progress.spent)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className={`font-semibold ${progress.remaining <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(progress.remaining)}
                  </span>
                </div>
              </div>

              {/* Period */}
              <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {progress.period}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGoal(goal)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  <Edit2 className="w-3 h-3 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="col-span-full text-center py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-float">
              <Target className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No goals set yet</h3>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
              Start by setting your first spending goal or budget to track your financial progress.
            </p>
            <button 
              onClick={() => setShowAddGoal(true)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto animate-bounce-gentle"
            >
              <Plus className="w-5 h-5" />
              Set Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add New Goal</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Monthly Food Budget"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={newGoal.amount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="5000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Travel">Travel</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Personal Care">Personal Care</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title || !newGoal.amount}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
