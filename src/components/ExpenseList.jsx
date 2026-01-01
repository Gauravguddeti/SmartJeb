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
  Eye,
  ZoomIn,
  Camera,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../services/database';
import { formatCurrency } from '../utils/formatters';
import ExpenseForm from './ExpenseForm';
import ReceiptModal from './ReceiptModal';
import MonthPicker from './MonthPicker';

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
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleViewReceipt = (receiptUrl, expenseDescription) => {
    console.log("handleViewReceipt called with:", receiptUrl?.substring(0, 50) + "...");
    
    if (!receiptUrl) {
      console.error("Attempted to view receipt with no URL");
      return;
    }
    
    // Show the modal immediately
    setSelectedReceipt({ url: receiptUrl, description: expenseDescription });
    setShowReceiptModal(true);
  };

  const handleCloseReceiptModal = () => {
    // Clean up object URL if needed
    if (selectedReceipt?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedReceipt.url);
    }
    setShowReceiptModal(false);
    // Use a small delay to avoid visual glitches
    setTimeout(() => {
      setSelectedReceipt(null);
    }, 300);
  };

  const handleMonthSelect = (monthDate) => {
    updateFilters({ 
      dateRange: 'specific-month',
      specificMonth: monthDate 
    });
  };

  const handleDateRangeChange = (value) => {
    if (value === 'custom-month') {
      setShowMonthPicker(true);
    } else {
      updateFilters({ 
        dateRange: value,
        specificMonth: null 
      });
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
      'Household': 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-200',
      'Other': 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <>
    <div className="space-y-4 sm:space-y-8 animate-fade-in pb-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 animate-slide-up">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-primary-600 bg-clip-text text-transparent">
            Your Expenses
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium mt-1">Track and manage your daily expenses</p>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2.5 px-4 sm:py-3 sm:px-6 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          <button
            onClick={onAddExpense}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-2.5 px-4 sm:py-3 sm:px-6 rounded-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 animate-glow text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                {filter.dateRange === 'specific-month' && filter.specificMonth 
                  ? `Selected: ${format(new Date(filter.specificMonth), 'MMMM yyyy')}`
                  : 'Date Range'
                }
              </label>
              <div className="flex gap-2">
                <select
                  value={filter.dateRange === 'specific-month' ? 'custom-month' : filter.dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom-month">Custom Month...</option>
                </select>
                {filter.dateRange === 'specific-month' && (
                  <button
                    onClick={() => setShowMonthPicker(true)}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    title="Change month"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                )}
              </div>
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
              className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:scale-[1.02] animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors break-words">{expense.description}</h3>
                    <span className={`px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold ${getCategoryColor(expense.category)} shadow-sm whitespace-nowrap`}>
                      {expense.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-1 rounded-lg">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>

                  {expense.note && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 border-l-4 border-primary-200 dark:border-primary-700">{expense.note}</p>
                  )}

                  {(expense.receiptUrl || expense.receipt) && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 mb-2">
                        <Camera className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">Receipt attached</span>
                      </div>
                      <div className="relative group/receipt">
                        {(() => {
                          const receiptUrl = expense.receiptUrl || expense.receipt;
                          console.log('Receipt URL for expense', expense.id, ':', receiptUrl?.substring(0, 50) + '...');
                          return receiptUrl ? (
                            <div className="relative">
                              <img 
                                src={receiptUrl} 
                                alt="Receipt"
                                loading="lazy"
                                decoding="async"
                                className="w-full max-w-sm h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleViewReceipt(receiptUrl, expense.description);
                                }}
                                onError={(e) => {
                                  console.error('Failed to load receipt thumbnail:', typeof receiptUrl);
                                  // Don't hide the image element, show a placeholder instead
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                  e.target.classList.add("p-4", "bg-gray-100", "dark:bg-gray-800");
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/receipt:bg-black/10 rounded-lg transition-all duration-200 flex items-center justify-center">
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleViewReceipt(receiptUrl, expense.description);
                                  }}
                                  className="opacity-0 group-hover/receipt:opacity-100 bg-primary-600 text-white px-3 py-2 rounded-md text-xs font-medium transition-all transform scale-95 hover:scale-100 flex items-center gap-1"
                                >
                                  <ZoomIn className="w-3 h-3" />
                                  View Receipt
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full max-w-sm h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500">
                              <span className="text-sm">Receipt URL not found</span>
                            </div>
                          );
                        })()}
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

    {/* Receipt Modal */}
    <ReceiptModal
      isOpen={showReceiptModal}
      onClose={handleCloseReceiptModal}
      receiptUrl={selectedReceipt?.url}
      expenseDescription={selectedReceipt?.description}
    />

    {/* Month Picker Modal */}
    <MonthPicker
      isOpen={showMonthPicker}
      onClose={() => setShowMonthPicker(false)}
      onSelectMonth={handleMonthSelect}
      selectedMonth={filter.specificMonth}
    />
    </>
  );
};

export default ExpenseList;
