import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Email Verification Banner
 * Shows a banner for users who need to verify their email
 */
const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user && user.email && !user.email_confirmed_at) {
      setShowBanner(true);
      setIsVerified(false);
    } else if (user && user.email_confirmed_at) {
      setIsVerified(true);
      setShowBanner(false);
    } else {
      setShowBanner(false);
    }
  }, [user]);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (error) throw error;
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('email-verification-dismissed', 'true');
  };

  if (!showBanner || isVerified) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 animate-pulse" />
            <div>
              <p className="font-semibold text-sm">
                Please verify your email address
              </p>
              <p className="text-xs opacity-90">
                Check your inbox and click the verification link to access all features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 disabled:opacity-50"
            >
              {isResending ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span>Resend</span>
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
  );
};

export default EmailVerificationBanner;
