import React, { useState, useEffect } from 'react';
import { AlertTriangle, User, Mail, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useGoals } from '../context/GoalsContext';

/**
 * Guest Mode Migration Banner
 * Shows a banner prompting guest users to save their data
 */
const GuestMigrationBanner = ({ onShowAuth }) => {
  const { isGuest, user } = useAuth();
  const { expenses } = useExpenses();
  const { goals } = useGoals();
  const [showBanner, setShowBanner] = useState(false);

  // Show banner if in guest mode and has data
  useEffect(() => {
    if (isGuest && (expenses.length > 0 || goals.length > 0)) {
      const dismissed = sessionStorage.getItem('migration-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    } else {
      setShowBanner(false);
    }

    // Add beforeunload event to clear guest data when browser/tab closes
    const handleBeforeUnload = (e) => {
      if (isGuest) {
        // Clear guest data immediately
        sessionStorage.removeItem('smartjeb-guest-expenses');
        sessionStorage.removeItem('smartjeb-guest-goals');
        sessionStorage.removeItem('migration-banner-dismissed');
      }
    };

    // Add visibility change to clear data when tab becomes hidden
    const handleVisibilityChange = () => {
      if (isGuest && document.visibilityState === 'hidden') {
        // Clear data immediately when tab becomes hidden
        sessionStorage.removeItem('smartjeb-guest-expenses');
        sessionStorage.removeItem('smartjeb-guest-goals');
        sessionStorage.removeItem('migration-banner-dismissed');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isGuest, expenses.length, goals.length]);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('migration-banner-dismissed', 'true');
  };

  const handleSaveData = () => {
    if (onShowAuth) {
      onShowAuth();
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Migration Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-slide-down">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <div>
                <p className="font-semibold text-sm">
                  You have {expenses.length} expenses and {goals.length} goals in guest mode
                </p>
                <p className="text-xs opacity-90">
                  Sign up to save your data permanently. Guest data will be lost when you close the browser.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveData}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>Save Data</span>
              </button>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* We removed the inline auth modal - now using the main AuthModal */}
    </>
  );
};

export default GuestMigrationBanner;
