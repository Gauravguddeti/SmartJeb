import React from 'react';
import { Menu, Home, Receipt, BarChart3, Target, Download, Plus, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Header Component
 */
const Header = ({ activeTab, setActiveTab, onAddExpense, onShowAuth }) => {
  const { user, isGuest, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // Redirect or show landing page logic can be handled in App.jsx
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Guest Mode Top Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-medium sticky top-0 z-50 animate-slide-down">
          <div className="flex items-center justify-center space-x-4">
            <span className="animate-pulse">⚠️ GUEST MODE: Your data will be lost if you refresh or close this page!</span>
            <button
              onClick={() => onShowAuth && onShowAuth()}
              className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-all duration-300"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      )}
      
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 animate-slide-down transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 group">
            <img 
              src="/logo.svg" 
              alt="SmartJeb Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  SmartJeb
                </h1>
                {isGuest && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    GUEST
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {isGuest ? "Guest mode - Data won't be saved" : "You buy. We judge. Gently."}
              </p>
            </div>
          </div>

          {/* Menu button for mobile (future enhancement) */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 active:scale-95">
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 shadow-lg'
                      : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-300" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* Guest Mode Warning and Login Button */}
            {isGuest && (
              <div className="flex items-center space-x-3 ml-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 animate-pulse">
                  <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                    ⚠️ GUEST MODE - Data will be lost on refresh!
                  </p>
                </div>
                <button
                  onClick={() => onShowAuth && onShowAuth()}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-bounce-gentle"
                >
                  <User className="w-4 h-4" />
                  <span>Sign Up to Save Data</span>
                </button>
              </div>
            )}
            
            {/* Add Expense Button */}
            <button
              onClick={onAddExpense}
              className="flex items-center space-x-2 px-4 py-2 ml-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Expense</span>
            </button>

            {/* User Profile / Sign Out */}
            <div className="flex items-center space-x-3 ml-4">
              {user && !isGuest && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {/* Back to Home button for guest mode */}
              {isGuest && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-all duration-300"
                  title="Back to Home"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-medium">Home</span>
                </button>
              )}
              
              {(user || isGuest) && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-all duration-300"
                  title={isGuest ? "Exit Guest Mode" : "Sign Out"}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{isGuest ? "Exit" : "Sign Out"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
