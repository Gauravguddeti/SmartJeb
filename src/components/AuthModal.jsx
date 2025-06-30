import React, { useState } from 'react';
import { X, Mail, User, Eye, EyeOff, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, onGuestLogin, onSuccess }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, enterGuestMode, isSupabaseConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

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
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast.error(error);
        return;
      }
      
      toast.success('Signed in with Google successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    enterGuestMode();
    onGuestLogin();
    onClose();
    toast.success('Welcome! You\'re using SmartJeb as a guest.');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md relative border border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {activeTab === 'signin' ? 'Welcome Back!' : 'Join SmartJeb'}
          </h2>
          <p className="text-slate-400">
            {activeTab === 'signin' 
              ? 'Sign in to access your expense data' 
              : 'Create an account to get started'
            }
          </p>
          {!isSupabaseConfigured && (
            <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ⚠️ Database not configured. Authentication is limited to guest mode.
                <br />
                <span className="text-xs">See SUPABASE_SETUP.md for setup instructions.</span>
              </p>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition ${
              activeTab === 'signin'
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition ${
              activeTab === 'signup'
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {activeTab === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isSupabaseConfigured}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300"
          >
            {!isSupabaseConfigured 
              ? 'Database Not Configured' 
              : isLoading 
                ? 'Processing...' 
                : (activeTab === 'signin' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-slate-600"></div>
          <span className="px-4 text-slate-400 text-sm">or</span>
          <div className="flex-1 border-t border-slate-600"></div>
        </div>

        {/* Social Login */}
        <button
          onClick={handleGoogleAuth}
          disabled={!isSupabaseConfigured}
          className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center mb-4"
        >
          <Chrome className="mr-2" size={20} />
          {!isSupabaseConfigured ? 'Google Sign-in Unavailable' : 'Continue with Google'}
        </button>

        {/* Guest Access */}
        <button
          onClick={handleGuestAccess}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
        >
          Just Visiting (Guest Mode)
        </button>

        <p className="text-center text-sm text-slate-400 mt-4">
          {activeTab === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('signup')}
                className="text-blue-400 hover:underline"
              >
                Sign up here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('signin')}
                className="text-blue-400 hover:underline"
              >
                Sign in here
              </button>
            </>
          )}
        </p>

        <p className="text-center text-xs text-slate-500 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
