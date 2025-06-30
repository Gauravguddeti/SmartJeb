import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Database,
  ChevronRight,
  LogOut,
  Edit3,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useGoals } from '../context/GoalsContext';
import UserProfileModal from './UserProfileModal';
import toast from 'react-hot-toast';

/**
 * Settings Component - App configuration and preferences
 */
const Settings = ({ darkMode, toggleDarkMode }) => {
  const { user, signOut } = useAuth();
  const { expenses, exportData, importData, clearAllData } = useExpenses();
  const { goals } = useGoals();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataBackup, setDataBackup] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('smartjeb-notifications');
    const savedDataBackup = localStorage.getItem('smartjeb-data-backup');
    
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedDataBackup) setDataBackup(JSON.parse(savedDataBackup));
  }, []);

  const handleNotificationToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('smartjeb-notifications', JSON.stringify(newValue));
    toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleDataBackupToggle = () => {
    const newValue = !dataBackup;
    setDataBackup(newValue);
    localStorage.setItem('smartjeb-data-backup', JSON.stringify(newValue));
    toast.success(newValue ? 'Auto backup enabled' : 'Auto backup disabled');
  };

  const handleExportData = () => {
    try {
      if (exportData) {
        exportData();
        toast.success('Data exported successfully!');
      } else {
        toast.error('Export feature not available');
      }
    } catch (error) {
      toast.error('Error exporting data. Please try again.');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (importData) {
          importData(data);
          toast.success('Data imported successfully!');
        } else {
          toast.error('Import feature not available');
        }
      } catch (error) {
        toast.error('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      if (clearAllData) {
        clearAllData();
        toast.success('All data has been cleared.');
      } else {
        toast.error('Clear data feature not available');
      }
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      toast.success('Signed out successfully');
    }
  };

  const SettingsSection = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h3>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingsItem = ({ icon: Icon, title, description, action, rightElement }) => (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0" onClick={action}>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {rightElement && (
        <div className="flex-shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const appVersion = '2.0.0';
  const totalExpenses = expenses.length;
  const totalGoals = goals.length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your SmartJeb experience
        </p>
      </div>

      {/* Profile Section */}
      <SettingsSection title="Profile">
        <SettingsItem
          icon={User}
          title={user?.email ? 'Edit Profile' : 'Guest User'}
          description={user?.email || 'Sign in to save your data permanently'}
          action={() => user?.email && setShowProfileModal(true)}
          rightElement={
            user?.email ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                Guest
              </span>
            )
          }
        />
      </SettingsSection>

      {/* Appearance Section */}
      <SettingsSection title="Appearance">
        <SettingsItem
          icon={darkMode ? Moon : Sun}
          title="Dark Mode"
          description="Toggle between light and dark themes"
          action={toggleDarkMode}
          rightElement={<Toggle checked={darkMode} onChange={toggleDarkMode} />}
        />
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection title="Notifications">
        <SettingsItem
          icon={Bell}
          title="Push Notifications"
          description="Get notified about your spending goals"
          action={handleNotificationToggle}
          rightElement={<Toggle checked={notifications} onChange={handleNotificationToggle} />}
        />
      </SettingsSection>

      {/* Data Management Section */}
      <SettingsSection title="Data Management">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalExpenses}</div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Expenses</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{totalGoals}</div>
            <div className="text-xs text-green-700 dark:text-green-300">Goals</div>
          </div>
        </div>
        
        <SettingsItem
          icon={Download}
          title="Export Data"
          description="Export your expenses and goals"
          action={handleExportData}
          rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
        />
        
        <SettingsItem
          icon={Upload}
          title="Import Data"
          description="Import data from a backup file"
          action={() => document.getElementById('import-file').click()}
          rightElement={<ChevronRight className="w-5 h-5 text-gray-400" />}
        />
        
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImportData}
          className="hidden"
        />
        
        <SettingsItem
          icon={Database}
          title="Auto Backup"
          description="Automatically backup data to local storage"
          action={handleDataBackupToggle}
          rightElement={<Toggle checked={dataBackup} onChange={handleDataBackupToggle} />}
        />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone">
        <SettingsItem
          icon={Trash2}
          title="Clear All Data"
          description="Permanently delete all expenses and goals"
          action={handleClearData}
          rightElement={
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              Delete
            </span>
          }
        />
        
        {user?.email && (
          <SettingsItem
            icon={LogOut}
            title="Sign Out"
            description="Sign out of your account"
            action={handleSignOut}
            rightElement={
              <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                Sign Out
              </span>
            }
          />
        )}
      </SettingsSection>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p>SmartJeb Expense Tracker</p>
        <p>Version {appVersion} • Made with ❤️</p>
        {user?.email && (
          <p className="mt-2">
            Signed in as: <span className="font-medium">{user.email}</span>
          </p>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          isFirstTime={false}
        />
      )}
    </div>
  );
};

export default Settings;
