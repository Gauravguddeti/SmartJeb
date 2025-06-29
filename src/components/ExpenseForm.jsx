import React, { useState, useEffect } from 'react';
import { X, Camera, Calendar, DollarSign, Tag, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../services/database';
import { categorizeExpense } from '../services/aiService';

/**
 * ExpenseForm Component - Modal form for adding/editing expenses
 * Features beautiful animations and modern UI design
 */
const ExpenseForm = ({ expense = null, onClose, onSuccess }) => {
  const { createExpense, modifyExpense } = useExpenses();
  const isEditing = Boolean(expense);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
    receipt: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Quick date selection helpers
  const setQuickDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
  };

  // Initialize form data for editing
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        date: expense.date,
        note: expense.note || '',
        receipt: expense.receipt || null
      });
    }
  }, [expense]);

  // Auto-categorize when description changes
  useEffect(() => {
    const suggestCategory = async () => {
      if (formData.description.length > 3 && !isEditing) {
        try {
          const suggested = await categorizeExpense(formData.description, formData.note);
          setSuggestedCategory(suggested);
          if (!formData.category && suggested !== 'Other') {
            setShowSuggestion(true);
          }
        } catch (error) {
          console.error('Failed to suggest category:', error);
        }
      }
    };

    const timeoutId = setTimeout(suggestCategory, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.description, formData.note, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt: file }));
    }
  };

  const applySuggestion = () => {
    setFormData(prev => ({ ...prev, category: suggestedCategory }));
    setShowSuggestion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    setIsSubmitting(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (isEditing) {
        await modifyExpense({ ...expenseData, id: expense.id });
      } else {
        await createExpense(expenseData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({ ...prev, receipt: null }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slide-up transform hover:shadow-3xl transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-indigo-50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* AI Suggestion Banner */}
        {showSuggestion && suggestedCategory && (
          <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-200 animate-slide-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary-500 animate-pulse-gentle" />
                <span className="text-sm text-primary-700 font-medium">
                  AI suggests: <strong>{suggestedCategory}</strong>
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={applySuggestion}
                  className="text-xs px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowSuggestion(false)}
                  className="text-xs px-3 py-1 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Amount Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 text-lg font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4 inline mr-1" />
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                placeholder="What did you spend on?"
              />
            </div>

            {/* Category Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
              >
                <option value="">Select a category</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              
              {/* Quick Date Selection */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    formData.date === format(new Date(), 'yyyy-MM-dd')
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    formData.date === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(2)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
                >
                  2 days ago
                </button>
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                />
                {formData.date === format(new Date(), 'yyyy-MM-dd') && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-2 py-1 rounded-lg text-xs font-medium animate-pulse-gentle">
                      Today
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {formData.date === format(new Date(), 'yyyy-MM-dd') 
                  ? "✨ Set to today's date" 
                  : `📅 Selected: ${format(new Date(formData.date), 'EEEE, MMMM dd, yyyy')}`}
              </p>
            </div>

            {/* Note Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 resize-none"
                placeholder="Any additional details..."
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <label className="block text-sm font-medium text-gray-700">
                <Camera className="w-4 h-4 inline mr-1" />
                Receipt (Optional)
              </label>
              {formData.receipt ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm text-gray-600 truncate">
                    {typeof formData.receipt === 'string' ? 'Receipt attached' : formData.receipt.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeReceipt}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 transition-all duration-300 hover:bg-primary-50 group">
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" />
                      <span className="text-sm text-gray-500 group-hover:text-primary-600">
                        Click to upload receipt
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.amount || !formData.description}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100 font-medium shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  isEditing ? 'Update Expense' : 'Add Expense'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
