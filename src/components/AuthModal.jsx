import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, User, Eye, EyeOff, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
  const [guestExpenses, setGuestExpenses] = useState([]);

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

  // Preserve guest data only when user explicitly tries to authenticate
  const preserveGuestDataForMigration = () => {
    // Check both local state and session storage for guest expenses
    let expensesToMigrate = guestExpenses;
    
    // If no expenses in local state, try to get from session storage directly
    if (!expensesToMigrate || expensesToMigrate.length === 0) {
      try {
        const sessionExpenses = sessionStorage.getItem('smartjeb-guest-expenses');
        if (sessionExpenses) {
          expensesToMigrate = JSON.parse(sessionExpenses);
        }
      } catch (error) {
        console.error('❌ Error reading guest expenses from session storage:', error);
      }
    }

    console.log('🔍 Checking guest expenses for migration:', {
      localStateExpenses: guestExpenses?.length || 0,
      sessionStorageExpenses: expensesToMigrate?.length || 0,
      isGuest,
      hasGuestExpenses
    });

    // Only preserve if we have actual guest expenses and user is in guest mode
    if (!isGuest || !expensesToMigrate || expensesToMigrate.length === 0) {
      console.log('❌ No guest expenses to preserve:', { 
        isGuest,
        expenseCount: expensesToMigrate?.length,
        hasGuestExpenses 
      });
      return;
    }

    try {
      const migrationData = {
        expenses: expensesToMigrate,
        timestamp: new Date().toISOString(),
        migrationPending: true,
        intentional: true, // Mark as intentional migration
        source: 'auth-modal-explicit'
      };
      
      localStorage.setItem('smartjeb-guest-migration-data', JSON.stringify(migrationData));
      console.log(`✅ Preserved ${expensesToMigrate.length} guest expenses for intentional migration:`, migrationData);
      
      // Set a short-lived flag indicating migration is in progress
      sessionStorage.setItem('smartjeb-migration-in-progress', 'true');
      
      // Also backup to ensure data persistence during OAuth redirects
      localStorage.setItem('smartjeb-guest-backup', JSON.stringify(migrationData));
    } catch (error) {
      console.error('❌ Error preserving guest data for migration:', error);
    }
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
      // Preserve guest data before any authentication (in case of page refresh)
      preserveGuestDataForMigration();
      
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
        
        toast.success('Account created successfully! Please check your email to verify your account.');
      } else {
        const { user, error } = await signInWithEmail(formData.email, formData.password);
        
        if (error) {
          toast.error(error);
          return;
        }
        
        toast.success('Signed in successfully!');
      }
      
      onSuccess();
      onClose();
      
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Preserve guest data before OAuth redirect (which will cause page reload)
      preserveGuestDataForMigration();
      
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
              {hasGuestExpenses && (
                <p className="text-sm text-blue-600 mt-1">
                  📊 {guestExpenses.length} expense{guestExpenses.length !== 1 ? 's' : ''} will be saved to your account
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-300 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

            {/* Guest Access */}
            <div>
              <button
                onClick={handleGuestAccess}
                className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
              >
                Continue as Guest
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Guest mode won't save your data permanently
                {hasGuestExpenses && (
                  <span className="block text-blue-600 mt-1">
                    💡 Tip: Sign up to keep your {guestExpenses.length} current expense{guestExpenses.length !== 1 ? 's' : ''}!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AuthModal;
