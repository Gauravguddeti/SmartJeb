import React from 'react';
import { Menu, Home, Receipt, BarChart3, Target, Download, Plus, Settings } from 'lucide-react';

/**
 * Header Component
 */
const Header = ({ activeTab, setActiveTab, onAddExpense }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 animate-slide-down transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 group">
            <img 
              src="/logo.svg" 
              alt="SmartJeb Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SmartJeb
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">You buy. We judge. Gently.</p>
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
            
            {/* Add Expense Button */}
            <button
              onClick={onAddExpense}
              className="flex items-center space-x-2 px-4 py-2 ml-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
