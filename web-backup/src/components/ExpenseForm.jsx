import React, { useState, useEffect } from 'react';
import { X, Camera, Calendar, DollarSign, Tag, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { EXPENSE_CATEGORIES } from '../services/database';
import { categorizeExpense } from '../services/aiService';
import { uploadReceipt, deleteReceipt } from '../services/storageService';
import toast from 'react-hot-toast';

/**
 * ExpenseForm Component - Modal form for adding/editing expenses
 * Features beautiful animations and modern UI design
 */
const ExpenseForm = ({ expense = null, onClose, onSuccess }) => {
  const { addExpense, updateExpense } = useExpenses();
  const { user, isGuest } = useAuth();
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
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

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
        receipt: expense.receiptUrl || expense.receipt || null
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WebP, HEIC) or PDF.');
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
      }

      setIsUploadingReceipt(true);
      
      try {
        // Store the file temporarily - we'll upload it during form submission
        setFormData(prev => ({ ...prev, receipt: file }));
        console.log('Receipt file selected:', file.name);
      } catch (error) {
        console.error('Error handling file:', error);
        alert('Failed to process the file. Please try again.');
      } finally {
        setIsUploadingReceipt(false);
      }
    }
  };

  const applySuggestion = () => {
    setFormData(prev => ({ ...prev, category: suggestedCategory }));
    setShowSuggestion(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptUrl = null;

      // Handle receipt upload if there's a new file
      if (formData.receipt && formData.receipt instanceof File) {
        setIsUploadingReceipt(true);
        const userId = user?.id || 'guest';
        console.log('Starting receipt upload for user:', userId);
        
        const { url, error } = await uploadReceipt(formData.receipt, userId);
        
        if (error) {
          console.error('Receipt upload failed:', error);
          toast.error('Receipt upload failed, but expense will be saved');
          // Continue without receipt
        } else {
          receiptUrl = url;
          console.log('Receipt uploaded successfully:', receiptUrl);
          toast.success('Receipt uploaded successfully!');
        }
        setIsUploadingReceipt(false);
      } else if (typeof formData.receipt === 'string') {
        // Existing receipt URL
        receiptUrl = formData.receipt;
      }

      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        receiptUrl: receiptUrl
      };

      // Remove the file object before saving
      delete expenseData.receipt;

      if (isEditing) {
        await updateExpense(expense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingReceipt(false);
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({ ...prev, receipt: null }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-1 sm:p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-form-title"
    >
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[98vw] sm:max-w-md max-h-[98vh] overflow-hidden flex flex-col animate-slide-up transform hover:shadow-3xl transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-indigo-50 flex-shrink-0">
          <h2 
            id="expense-form-title"
            className="text-base sm:text-lg font-semibold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent"
          >
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/80 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* AI Suggestion Banner */}
        {showSuggestion && suggestedCategory && (
          <div className="mx-3 sm:mx-4 mt-2 p-2 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg border border-primary-200 animate-slide-down flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3 h-3 text-primary-500 animate-pulse-gentle" />
                <span className="text-xs text-primary-700 font-medium">
                  AI suggests: <strong>{suggestedCategory}</strong>
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={applySuggestion}
                  className="text-xs px-2 py-0.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowSuggestion(false)}
                  className="text-xs px-2 py-0.5 text-primary-600 hover:bg-primary-100 rounded-md transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guest Mode Warning */}
        {isGuest && (
          <div className="mx-3 sm:mx-4 mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 flex-shrink-0">
            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
              💡 Guest mode: Sign up to save permanently
            </p>
          </div>
        )}

        {/* Form - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Amount Field */}
            <div className="space-y-1 sm:space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-base">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 text-base font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-1 sm:space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="What did you spend on?"
              />
            </div>

            {/* Category Field */}
            <div className="space-y-1 sm:space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <div className="space-y-1 sm:space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Date
              </label>
              
              {/* Quick Date Selection */}
              <div className="flex gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 ${
                    formData.date === format(new Date(), 'yyyy-MM-dd')
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 ${
                    formData.date === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(2)}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-300"
                >
                  2 days ago
                </button>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {formData.date === format(new Date(), 'yyyy-MM-dd') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-1.5 py-0.5 rounded text-xs font-medium animate-pulse-gentle">
                      Today
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {formData.date === format(new Date(), 'yyyy-MM-dd') 
                  ? "✨ Set to today's date" 
                  : `📅 Selected: ${format(new Date(formData.date), 'MMM dd, yyyy')}`}
              </p>
            </div>

            {/* Note Field */}
            <div className="space-y-1 sm:space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Notes
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Any additional details..."
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-1 sm:space-y-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Receipt (Optional)
              </label>
              {formData.receipt ? (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {typeof formData.receipt === 'string' ? 'Receipt attached' : formData.receipt.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeReceipt}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-full p-2 sm:p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:bg-primary-50 dark:hover:bg-gray-700 group">
                    <div className="text-center">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1 group-hover:text-primary-500 transition-colors" />
                      <span className="text-xs text-gray-500 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {isUploadingReceipt ? 'Processing...' : 'Upload receipt'}
                      </span>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploadingReceipt}
                  />
                </label>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-2 pt-2 animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.amount || !formData.description}
                className="flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100 font-medium shadow-lg hover:shadow-xl text-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  isEditing ? 'Update' : 'Add Expense'
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
