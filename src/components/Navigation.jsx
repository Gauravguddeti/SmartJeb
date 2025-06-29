import React from 'react';
import { Home, Receipt, BarChart3, Plus, Target, Download, Settings } from 'lucide-react';

/**
 * Bottom Navigation Component
 */
const Navigation = ({ activeTab, setActiveTab, onAddExpense }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'analytics', label: 'Charts', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 md:hidden shadow-2xl transition-colors duration-300">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between py-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center space-y-1 py-2 px-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-0 flex-1 ${
                    isActive
                      ? 'text-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg animate-bounce-gentle'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'animate-pulse-gentle' : ''}`} />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Add Expense Button */}
          <button
            onClick={onAddExpense}
            className="flex flex-col items-center space-y-1 py-2 px-3 ml-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 animate-glow flex-shrink-0"
          >
            <Plus className="w-4 h-4 animate-pulse-gentle" />
            <span className="text-xs font-medium">Add</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
