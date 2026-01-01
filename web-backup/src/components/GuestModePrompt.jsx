import React, { useState, useEffect } from 'react';
import { User, X, ArrowUp } from 'lucide-react';

/**
 * GuestModePrompt Component - Floating prompt to encourage guest users to sign up
 */
const GuestModePrompt = ({ onShowAuth }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this prompt
    const dismissed = localStorage.getItem('smartjeb-guest-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after 30 seconds, then periodically
    const showPrompt = () => {
      if (!isDismissed) {
        setIsVisible(true);
        // Auto-hide after 10 seconds
        setTimeout(() => setIsVisible(false), 10000);
      }
    };

    // Initial delay
    const initialTimer = setTimeout(showPrompt, 30000);
    
    // Periodic reminders every 5 minutes
    const periodicTimer = setInterval(showPrompt, 300000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicTimer);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('smartjeb-guest-prompt-dismissed', 'true');
  };

  const handleSignUp = () => {
    setIsVisible(false);
    onShowAuth();
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4 shadow-2xl max-w-sm border-2 border-blue-400 animate-pulse-gentle">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">Save Your Progress!</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-white/90 mb-4 leading-relaxed">
          You've been using SmartJeb for a while! Create an account to:
        </p>
        
        <ul className="text-xs text-white/80 space-y-1 mb-4">
          <li className="flex items-center space-x-2">
            <ArrowUp className="w-3 h-3 transform rotate-45" />
            <span>Keep your data safe</span>
          </li>
          <li className="flex items-center space-x-2">
            <ArrowUp className="w-3 h-3 transform rotate-45" />
            <span>Sync across devices</span>
          </li>
          <li className="flex items-center space-x-2">
            <ArrowUp className="w-3 h-3 transform rotate-45" />
            <span>Track long-term progress</span>
          </li>
        </ul>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSignUp}
            className="flex-1 bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Sign Up Now
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestModePrompt;
