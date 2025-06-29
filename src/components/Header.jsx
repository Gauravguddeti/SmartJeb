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
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <img 
                src="/logo.svg" 
                alt="SmartJeb Logo" 
                className="w-10 h-10"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 dark:from-gray-100 dark:to-primary-400 bg-clip-text text-transparent">
                SmartJeb
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">You buy. We judge. Gently.</p>
            </div>
          </div>

          {/* Menu button for mobile (future enhancement) */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-300 hover:scale-105 active:scale-95">
            <Menu className="w-6 h-6 text-gray-600" />
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
                      ? 'text-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg animate-bounce-gentle'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'animate-pulse-gentle' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* Add Expense Button */}
            <button
              onClick={onAddExpense}
              className="flex items-center space-x-2 px-4 py-2 ml-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 animate-glow"
            >
              <Plus className="w-4 h-4 animate-pulse-gentle" />
              <span className="text-sm font-medium">Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
