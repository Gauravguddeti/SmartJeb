/**
 * Main App Component
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Navigation
import AppNavigation from './src/navigation/AppNavigation';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ExpenseProvider } from './src/contexts/ExpenseContext';

// Services
import * as notificationService from './src/services/notificationService';
import { initDatabase } from './src/services/databaseService';
import { initTensorFlow } from './src/services/mlService';

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const colorScheme = useColorScheme();

  // Initialize app services
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database
        initDatabase();
        
        // Initialize TensorFlow.js for ML categorization
        await initTensorFlow();
        
        // Configure notifications
        await notificationService.configureNotifications();

        // When ready, hide the splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error initializing app:', error);
        await SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthProvider>
          <ExpenseProvider>
            <AppNavigation />
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
