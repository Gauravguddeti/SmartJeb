import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Download, Upload, Trash2, User, Shield, Smartphone } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import toast from 'react-hot-toast';

/**
 * Settings Component - App configuration and preferences
 */
const Settings = () => {
  const { expenses, clearAllExpenses } = useExpenses();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('smartjeb-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
      setNotifications(settings.notifications !== false);
      setDailyReminder(settings.dailyReminder !== false);
      setWeeklyReport(settings.weeklyReport !== false);
      setCurrency(settings.currency || 'INR');
      setLanguage(settings.language || 'en');
      
      // Apply dark mode immediately
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    const settings = {
      darkMode,
      notifications,
      dailyReminder,
      weeklyReport,
      currency,
      language,
      ...newSettings
    };
    localStorage.setItem('smartjeb-settings', JSON.stringify(settings));
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveSettings({ darkMode: newDarkMode });
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      toast.success('Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      toast.success('Light mode enabled');
    }
  };

  const handleNotificationToggle = () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    saveSettings({ notifications: newNotifications });
    toast.success(newNotifications ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
      clearAllExpenses();
      localStorage.removeItem('smartjeb-goals');
      localStorage.removeItem('smartjeb-settings');
      toast.success('All data cleared successfully');
    }
  };

  const appVersion = '1.0.0';
  const totalExpenses = expenses.length;
  const dataSize = new Blob([JSON.stringify(expenses)]).size;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-primary-600 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Customize your SmartJeb experience</p>
      </div>

      {/* Appearance Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-primary-600" />
          <span>Appearance</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="w-5 h-5 text-primary-600" /> : <Sun className="w-5 h-5 text-primary-600" />}
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</div>
              </div>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                darkMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-primary-600" />
          <span>Notifications</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {notifications ? <Bell className="w-5 h-5 text-primary-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Get notified about important updates</div>
              </div>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                notifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Daily Reminders</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Get reminded to log your expenses</div>
              </div>
            </div>
            <button
              onClick={() => {
                const newDailyReminder = !dailyReminder;
                setDailyReminder(newDailyReminder);
                saveSettings({ dailyReminder: newDailyReminder });
                toast.success(newDailyReminder ? 'Daily reminders enabled' : 'Daily reminders disabled');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                dailyReminder ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  dailyReminder ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary-600" />
          <span>Data Management</span>
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600">{totalExpenses}</div>
              <div className="text-sm text-blue-700">Total Expenses</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600">{(dataSize / 1024).toFixed(1)} KB</div>
              <div className="text-sm text-green-700">Data Size</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-600">v{appVersion}</div>
              <div className="text-sm text-purple-700">App Version</div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleClearAllData}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-primary-600" />
          <span>About SmartJeb</span>
        </h2>
        
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p>
            SmartJeb is an AI-assisted expense journal that helps you track your daily expenses with smart categorization and insights.
          </p>
          <p className="text-sm">
            <strong>Features:</strong> AI-powered categorization, Visual analytics, Goal tracking, Data export, Offline functionality
          </p>
          <p className="text-sm">
            <strong>Privacy:</strong> All your data is stored locally on your device. No data is sent to external servers.
          </p>
          <div className="pt-4 text-center">
            <p className="text-sm text-gray-500">
              Made with <span className="text-red-500 animate-pulse-gentle">♥</span> by{' '}
              <span className="font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Gaurav G
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
