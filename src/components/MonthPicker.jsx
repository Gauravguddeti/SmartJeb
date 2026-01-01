import { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, isSameMonth } from 'date-fns';
import { X, Calendar } from 'lucide-react';

/**
 * MonthPicker Component
 * Mobile-optimized bottom-sheet month selector for filtering expenses
 * Shows past 12 months dynamically, excluding future months
 * 
 * @param {boolean} isOpen - Controls visibility of the month picker
 * @param {function} onClose - Callback when picker is closed
 * @param {function} onSelectMonth - Callback when a month is selected, receives Date object
 * @param {Date} selectedMonth - Currently selected month (optional)
 */
const MonthPicker = ({ isOpen, onClose, onSelectMonth, selectedMonth }) => {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    // Generate past 12 months including current month
    const today = new Date();
    const monthsList = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(today, i);
      monthsList.push({
        date: monthDate,
        label: format(monthDate, 'MMMM yyyy'),
        shortLabel: format(monthDate, 'MMM yyyy'),
        isCurrentMonth: i === 0
      });
    }
    
    setMonths(monthsList);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleMonthClick = (monthDate) => {
    onSelectMonth(monthDate);
    onClose();
  };

  const handleQuickSelect = (monthsAgo) => {
    const date = subMonths(new Date(), monthsAgo);
    onSelectMonth(date);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Month Picker Panel */}
      <div 
        className="relative bg-white dark:bg-gray-800 w-full max-w-lg sm:max-w-xl 
                   rounded-t-3xl sm:rounded-2xl p-6 sm:p-8
                   animate-slide-up-from-bottom sm:animate-none
                   shadow-2xl max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="month-picker-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 
              id="month-picker-title"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Select Month
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            aria-label="Close month picker"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Quick Select Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => handleQuickSelect(0)}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 
                     bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 
                     dark:hover:bg-blue-900/30 transition-colors"
          >
            This Month
          </button>
          <button
            onClick={() => handleQuickSelect(1)}
            className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 
                     bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 
                     dark:hover:bg-purple-900/30 transition-colors"
          >
            Last Month
          </button>
          <button
            onClick={() => handleQuickSelect(2)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 
                     bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 
                     dark:hover:bg-indigo-900/30 transition-colors"
          >
            2 Months Ago
          </button>
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {months.map((month, index) => {
            const isSelected = selectedMonth && isSameMonth(month.date, selectedMonth);
            
            return (
              <button
                key={index}
                onClick={() => handleMonthClick(month.date)}
                className={`
                  relative px-4 py-3 rounded-xl font-medium transition-all
                  min-h-[48px] touch-manipulation
                  ${isSelected 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }
                  ${month.isCurrentMonth && !isSelected ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}
                `}
                aria-pressed={isSelected}
                aria-label={`Select ${month.label}`}
              >
                <div className="text-sm sm:text-base">
                  {month.shortLabel}
                </div>
                {month.isCurrentMonth && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Showing past 12 months • Future months are not available
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthPicker;
