/**
 * Notification service for handling notifications and background tasks
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Notifications as RNNotifications } from 'react-native-notifications';
import { Expense } from '../models/Expense';
import { addExpense } from './databaseService';
import mlService from './mlService';

// Configure notification settings
export const configureNotifications = async (): Promise<void> => {
  // Configure Expo notifications
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

// Request permissions for notifications
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }
  
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Register for notification listener (Android only)
export const registerNotificationListener = (): void => {
  if (Platform.OS === 'android') {
    // Register the notification listener using react-native-notifications
    RNNotifications.registerRemoteNotifications();
    
    // Handle notification events
    RNNotifications.events().registerNotificationReceivedForeground(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        processNotificationData(notification.payload);
      }
    );
    
    RNNotifications.events().registerNotificationReceivedBackground(
      (notification) => {
        console.log('Notification received in background:', notification);
        processNotificationData(notification.payload);
      }
    );
  }
};

// Process notification data and extract transaction details
export const processNotificationData = (payload: any): void => {
  try {
    // Check if this is a payment notification
    const title = payload.title || '';
    const text = payload.body || payload.message || '';
    const appName = payload.packageName || '';
    
    if (!mlService.isPaymentNotification(title, text)) {
      console.log('Not a payment notification:', title);
      return;
    }
    
    // Extract transaction details
    const { amount, merchantName, timestamp } = mlService.extractTransactionDetails(text);
    
    // If missing required data, skip
    if (!amount || !merchantName) {
      console.log('Missing required transaction data', { amount, merchantName });
      return;
    }
    
    // Determine category using ML service
    const category = mlService.categorizeText(`${merchantName} ${text}`);
    
    // Create expense object
    const expense: Expense = {
      id: '',
      amount,
      merchantName,
      category,
      timestamp,
      isAutoLogged: true,
      sourceApp: getAppNameFromPackage(appName),
    };
    
    // Save to database (if user is logged in)
    const userId = ''; // TODO: Get actual user ID
    if (userId) {
      addExpense(expense, userId)
        .then((savedExpense) => {
          // Show confirmation notification
          showExpenseLoggedNotification(savedExpense);
        })
        .catch((error) => {
          console.error('Error saving auto-logged expense:', error);
        });
    }
  } catch (error) {
    console.error('Error processing notification data:', error);
  }
};

// Show a notification confirming the expense was logged
export const showExpenseLoggedNotification = (expense: Expense): void => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expense Logged',
      body: `₹${expense.amount} paid to ${expense.merchantName} – added to ${expense.category}`,
      data: { expenseId: expense.id },
    },
    trigger: null, // Show immediately
  });
};

// Map package names to readable app names
const getAppNameFromPackage = (packageName: string): string => {
  const packageMap: Record<string, string> = {
    'com.google.android.apps.nbu.paisa.user': 'Google Pay',
    'com.phonepe.app': 'PhonePe',
    'net.one97.paytm': 'Paytm',
    'com.whatsapp': 'WhatsApp',
    'com.icicibank.imobile': 'ICICI Bank',
    'com.sbi.SBIFreedom': 'SBI Bank',
    'com.axis.mobile': 'Axis Bank',
    'com.hdfc.mobilebanking': 'HDFC Bank',
  };
  
  return packageMap[packageName] || packageName;
};

export default {
  configureNotifications,
  requestNotificationPermissions,
  registerNotificationListener,
  processNotificationData,
  showExpenseLoggedNotification,
};
