import React, { useState, useEffect } from 'react';
import { X, Check, Tag, Calendar, Hash, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { PendingTransaction, removePendingTransaction, dismissPendingTransaction } from '../services/pendingTransactions';
import { EXPENSE_CATEGORIES } from '../services/database';
import { categorizeExpense } from '../services/aiService';
import { useExpenses } from '../context/ExpenseContext';
import toast from 'react-hot-toast';

interface QuickConfirmExpenseProps {
  transaction: PendingTransaction;
  onConfirmed: () => void;
  onDismissed: () => void;
}

/**
 * Quick Confirm Expense Component
 * Heads-up notification-style UI at top of screen
 * Swipeable and cancelable
 */
const QuickConfirmExpense: React.FC<QuickConfirmExpenseProps> = ({
  transaction,
  onConfirmed,
  onDismissed
}) => {
  const { addExpense } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState(transaction.suggestedCategory || 'Other');
  const [note, setNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);

  // Re-categorize if no suggestion
  useEffect(() => {
    if (!transaction.suggestedCategory) {
      categorizeExpense(transaction.merchant).then(category => {
        setSelectedCategory(category);
      });
    }
  }, [transaction]);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await addExpense({
        amount: transaction.amount,
        description: transaction.merchant,
        category: selectedCategory,
        date: format(new Date(transaction.timestamp), 'yyyy-MM-dd'),
        note: note || `Auto-detected from ${transaction.appSource} • ${transaction.transactionId}`
      });

      await removePendingTransaction(transaction.id);
      toast.success(`₹${transaction.amount} expense saved!`);
      onConfirmed();
    } catch (error) {
      console.error('Error confirming expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = async () => {
    await dismissPendingTransaction(transaction.id);
    onDismissed();
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
    const diff = touchStart - e.targetTouches[0].clientY;
    if (diff > 0) return; // Don't slide down
    setSlideOffset(-diff);
  };

  const handleTouchEnd = () => {
    if (slideOffset > 80) {
      // Swiped up enough to dismiss
      handleDismiss();
    } else {
      setSlideOffset(0);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const appIcons: Record<string, string> = {
    gpay: '🟢',
    phonepe: '🟣',
    paytm: '🔵',
    bhim: '🟡',
    amazonpay: '🟠',
    unknown: '💳'
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10001] animate-slide-down"
      style={{ transform: `translateY(-${slideOffset}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main card */}
      <div className={`
        relative bg-gradient-to-r from-blue-500 to-purple-600 text-white
        shadow-2xl transition-all duration-300
        ${isExpanded ? 'rounded-b-3xl' : 'rounded-b-2xl'}
      `}>
        {/* Swipe indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Compact view */}
        <div
          className="px-4 py-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">{appIcons[transaction.appSource]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">₹{transaction.amount.toFixed(2)}</span>
                  <span className="text-sm opacity-90">to {transaction.merchant}</span>
                </div>
                <div className="text-xs opacity-75 truncate">
                  Tap to confirm • {selectedCategory}
                  {transaction.confidence && transaction.confidence < 85 && ' (verify?)'}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 animate-slide-down">
            {/* Transaction details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-75" />
                <span>{format(new Date(transaction.timestamp), 'MMM d, yyyy h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 opacity-75" />
                <span className="text-xs opacity-90">{transaction.transactionId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 opacity-75" />
                <span className="capitalize">{transaction.appSource}</span>
              </div>
            </div>

            {/* Category selector */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
                {transaction.confidence && (
                  <span className="text-xs opacity-75">
                    ({transaction.confidence}% confident)
                  </span>
                )}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex-1 bg-white text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Confirm Expense'}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isSaving}
                className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickConfirmExpense;
