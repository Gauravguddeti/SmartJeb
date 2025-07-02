import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, User, Eye, EyeOff, Chrome, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const AuthModal = ({ isOpen, onClose, onGuestLogin, onSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, enterGuestMode, isSupabaseConfigured, isGuest } = useAuth();
  
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [guestExpenses, setGuestExpenses] = useState([]);
  // Remove migration feature - guest data stays in guest mode

  // Load guest expenses from storage
  useEffect(() => {
    if (isGuest) {
      try {
        const savedExpenses = sessionStorage.getItem('smartjeb-guest-expenses');
        console.log('📋 Loading guest expenses in AuthModal:', { 
          isGuest, 
          hasSessionData: !!savedExpenses,
          dataLength: savedExpenses ? JSON.parse(savedExpenses).length : 0
        });
        
        if (savedExpenses) {
          const parsed = JSON.parse(savedExpenses);
          setGuestExpenses(parsed);
          console.log(`✅ Loaded ${parsed.length} guest expenses in AuthModal`);
        }
      } catch (error) {
        console.error('❌ Error loading guest expenses:', error);
        setGuestExpenses([]);
      }
    } else {
      setGuestExpenses([]);
    }
  }, [isGuest, isOpen]); // Add isOpen to dependency to reload when modal opens

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Early return check
  if (!isOpen) {
    return null;
  }

  // Check if there are guest expenses to migrate
  const hasGuestExpenses = isGuest && guestExpenses && guestExpenses.length > 0;

  // Guest data stays in guest mode - no migration to authenticated accounts
  const clearGuestMigrationData = () => {
    // Clear any existing migration data since we don't migrate anymore
    localStorage.removeItem('smartjeb-guest-migration-data');
    localStorage.removeItem('smartjeb-guest-backup');
    sessionStorage.removeItem('smartjeb-migration-in-progress');
    console.log('🧹 Cleared any existing guest migration data - guests stay separate');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any existing migration data since guest stays separate
      clearGuestMigrationData();
      
      if (activeTab === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        
        const { user, error } = await signUpWithEmail(
          formData.email,
          formData.password,
          { name: formData.name }
        );
        
        if (error) {
          toast.error(error);
          return;
        }
        
        // Show email verification screen instead of closing
        setVerificationEmail(formData.email);
        setShowEmailVerification(true);
        toast.success('Account created! Please check your email to verify your account.');
        return; // Don't close modal yet
      } else {
        const { user, error } = await signInWithEmail(formData.email, formData.password);
        
        if (error) {
          toast.error(error);
          return;
        }
        
        // Don't show success toast here - let AuthContext handle it to avoid duplicates
      }
      
      onSuccess();
      onClose();
      
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      // Try to sign in to check if email is verified
      const { user, error } = await signInWithEmail(verificationEmail, formData.password);
      
      if (error) {
        if (error.includes('Email not confirmed')) {
          toast.error('Email not verified yet. Please check your inbox and click the verification link.');
        } else {
          toast.error(error);
        }
        return;
      }
      
      // If we get here, email is verified and user is signed in
      toast.success('Email verified successfully! Welcome to SmartJeb!');
      setShowEmailVerification(false);
      onSuccess();
      onClose();
      
    } catch (error) {
      toast.error('Failed to verify email status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Clear any existing migration data since guest stays separate  
      clearGuestMigrationData();
      
      // Add a small delay to ensure data is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }
      
      // Don't show success message or close modal immediately
      // Let the auth context handle the redirect
      // The modal will close automatically when auth state changes
      
    } catch (error) {
      toast.error('Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    enterGuestMode();
    onGuestLogin();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setShowPassword(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slide-up"
          style={{
            minHeight: '400px',
            backgroundColor: '#ffffff',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome to SmartJeb
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-300 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Verification View */}
          {showEmailVerification ? (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verify Your Email
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a verification link to<br />
                  <strong className="text-gray-900">{verificationEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check your email and click the verification link to activate your account.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCheckVerification}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : (
                    'I\'ve Verified My Email'
                  )}
                </button>

                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all duration-300"
                >
                  Resend Verification Email
                </button>

                <button
                  onClick={() => {
                    setShowEmailVerification(false);
                    setActiveTab('signin');
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => switchTab('signin')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'signin'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('signup')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'signup'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Sign Up
                </button>
              </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for signup */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field for signup */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white text-gray-900"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  activeTab === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Sign In */}
            {isSupabaseConfigured && (
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center space-x-2 bg-white mb-4"
              >
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            )}

            {/* Guest Data Warning - Show if user has guest expenses */}
            {hasGuestExpenses && (
              <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Your {guestExpenses.length} guest expense{guestExpenses.length !== 1 ? 's' : ''} will remain separate
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                      Guest data stays in guest mode only. Sign in to start fresh with your account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Access */}
            <div>
              <button
                onClick={handleGuestAccess}
                className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
              >
                Continue as Guest
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                ⚠️ Guest mode is for trying out the app only
                <span className="block text-orange-600 mt-1 font-medium">
                  Guest expenses are temporary and won't be saved to your account
                </span>
                <span className="block text-blue-600 mt-1 text-xs">
                  💡 Tip: You can export your expenses before signing up to save them
                </span>
              </p>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;
