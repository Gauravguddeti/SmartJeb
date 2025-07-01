import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Calendar,
  Tag,
  FileText,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../services/database';
import { formatCurrency, getRelativeDateString } from '../utils/formatters';
import { getReceiptDisplayUrl } from '../services/storageService';
import ExpenseForm from './ExpenseForm';

/**
 * ExpenseList Component - Display and manage expenses
 */
const ExpenseList = ({ onAddExpense }) => {
  const { 
    filteredExpenses, 
    loading, 
    filter, 
    updateFilters, 
    deleteExpense 
  } = useExpenses();

  const [editingExpense, setEditingExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200',
      'Transportation': 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200',
      'Shopping': 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200',
      'Entertainment': 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200',
      'Bills & Utilities': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200',
      'Healthcare': 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200',
      'Education': 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-200',
      'Travel': 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200',
      'Groceries': 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-200',
      'Personal Care': 'bg-gradient-to-r from-violet-100 to-violet-200 text-violet-800 border border-violet-200',
      'Other': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-primary-600 bg-clip-text text-transparent">
            Your Expenses
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium mt-1">Track and manage your daily expenses</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <button
            onClick={onAddExpense}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 animate-glow"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 space-y-6 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={filter.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filter.dateRange}
                onChange={(e) => updateFilters({ dateRange: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your expenses...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-float">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No expenses found</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-md mx-auto">
              Get started by adding your first expense and begin tracking your spending habits.
            </p>
            <button 
              onClick={onAddExpense} 
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto animate-bounce-gentle"
            >
              <Plus className="w-5 h-5" />
              Add Your First Expense
            </button>
          </div>
        ) : (
          filteredExpenses.map((expense, index) => (
            <div 
              key={expense.id} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200/50 hover:scale-[1.02] animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">{expense.description}</h3>
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${getCategoryColor(expense.category)} shadow-sm`}>
                      {expense.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-100 p-1 rounded-lg">
                        <Calendar className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>

                  {expense.note && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 border-l-4 border-primary-200">{expense.note}</p>
                  )}

                  {(expense.receiptUrl || expense.receipt) && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 mb-2">
                        <Camera className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">Receipt attached</span>
                      </div>
                      <div className="relative group">
                        {(() => {
                          const receiptUrl = getReceiptDisplayUrl(expense.receiptUrl || expense.receipt);
                          console.log('Receipt URL for expense', expense.id, ':', receiptUrl);
                          return receiptUrl ? (
                            <img 
                              src={receiptUrl} 
                              alt="Receipt"
                              className="w-full max-w-sm h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                // Create a modal to view the image
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
                                modal.onclick = () => document.body.removeChild(modal);
                                
                                const img = document.createElement('img');
                                img.src = receiptUrl;
                                img.className = 'max-w-full max-h-full object-contain rounded-lg';
                                img.onclick = (e) => e.stopPropagation();
                                
                                const closeBtn = document.createElement('button');
                                closeBtn.innerHTML = '×';
                                closeBtn.className = 'absolute top-4 right-4 text-white text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70';
                                closeBtn.onclick = () => document.body.removeChild(modal);
                                
                                modal.appendChild(img);
                                modal.appendChild(closeBtn);
                                document.body.appendChild(modal);
                              }}
                              onError={(e) => {
                                console.error('Failed to load receipt image:', receiptUrl);
                                e.target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'w-full max-w-sm h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500';
                                errorDiv.innerHTML = '<span class="text-sm">Image not available</span>';
                                e.target.parentNode.appendChild(errorDiv);
                              }}
                            />
                          ) : (
                            <div className="w-full max-w-sm h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500">
                              <span className="text-sm">Receipt URL not found</span>
                            </div>
                          );
                        })()}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 transition-opacity">
                            Click to view full size
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setEditingExpense(expense)}
                  className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseForm
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
};

export default ExpenseList;
