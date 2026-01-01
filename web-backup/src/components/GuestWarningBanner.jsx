import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Guest Warning Banner - Shows warning about temporary data in guest mode
 */
const GuestWarningBanner = () => {
  const { isGuest } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasGuestData, setHasGuestData] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed (for this session only)
    const dismissed = sessionStorage.getItem('guest-warning-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Check if there's guest data
    const guestExpenses = sessionStorage.getItem('smartjeb-guest-expenses');
    if (guestExpenses) {
      try {
        const expenses = JSON.parse(guestExpenses);
        setHasGuestData(expenses && expenses.length > 0);
      } catch (error) {
        setHasGuestData(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('guest-warning-dismissed', 'true');
  };

  // Don't show banner if not in guest mode, dismissed, or no data
  if (!isGuest || isDismissed || !hasGuestData) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Guest Mode Warning:
            </span>
            <span className="text-amber-700 dark:text-amber-300 ml-2">
              Your data will be lost if you refresh or close this page. 
              <strong className="ml-1">Export your expenses</strong> before signing up to save them.
            </span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 ml-4 flex-shrink-0"
          title="Dismiss warning"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GuestWarningBanner;
